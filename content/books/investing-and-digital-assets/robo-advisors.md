+++
title = "Robo-Advisors & Model Portfolios"
nav_title = "Robo-Advisors"
description = "Questionnaires to allocations, model portfolios, drift bands and rebalancing, cash drag and the Schwab order, robo fees, and crypto in managed portfolios."
category = "Investing & Digital Assets Industry"
order = 2531
part = "Wealth and Advice"
tags = ["investing", "robo-advisors", "model-portfolios", "rebalancing", "cash-drag", "advisory-fees"]
+++

A robo-adviser is an investment adviser whose portfolio manager is a scheduler. The customer answers a questionnaire, the software maps the answers to one of a few dozen model portfolios, and from then on a set of jobs keeps each account near its model: investing deposits, raising cash for withdrawals and fees, rebalancing when markets move the weights, harvesting losses, and reinvesting dividends. The product is sold on low fees and discipline, and the regulatory duty is the same fiduciary duty a human adviser owes, delivered through code ([The Adviser's Fiduciary Duty](/books/investing-and-digital-assets/advice-and-conduct#the-adviser-s-fiduciary-duty)).

The engineering is a portfolio of small decisions made millions of times. How far may an account drift before it trades? Should a deposit buy the underweight fund or the model's weights? How much cash does a portfolio hold, who earns on it, and is that a portfolio decision or a revenue decision? Each answer is a parameter somebody chose, and the Schwab Intelligent Portfolios order shows that an examiner will ask who chose it and why.

This chapter covers that layer as of November 2026: how platforms package automated advice, questionnaires to allocations, model portfolios and their versions, rebalancing with drift bands and cash flows (worked through), cash drag and the 2022 Schwab order, fees, and crypto in managed portfolios. Tax-loss harvesting has its own chapter, [Tax-Loss Harvesting & Direct Indexing](/books/investing-and-digital-assets/tax-loss-harvesting-and-direct-indexing); how the orders a rebalance generates are batched and filled as fractions is in [Fractional Shares & Recurring Investing](/books/investing-and-digital-assets/fractional-and-recurring#how-brokers-create-fractions); the revenue view across firms is in [Subscriptions and Advisory Fees](/books/investing-and-digital-assets/revenue-models#subscriptions-and-advisory-fees).

## How the Platforms Do It

Published terms, as of November 2026:

| Platform | Fee | Minimum | Rebalancing | Cash in the portfolio | What stands out |
| --- | --- | --- | --- | --- | --- |
| **Betterment** (Digital) | $5 a month under $24,000; 0.25% a year with a $200+ monthly recurring deposit or a $24,000 to $1 million balance; 0.15% on the portion from $1 million to $2 million and 0.10% above; Premium 0.65% on the first $1 million with a $100,000 minimum | No minimum balance | Cash flows first; a threshold rebalance when drift exceeds "generally 3% for managed portfolios", 7% for the Crypto ETF portfolio and Betterment-managed Custom Portfolios | From May 1, 2026, a small operational cash allocation, "generally targeting 0.5% of total portfolio value," that "does not earn interest" | Fees billed in arrears, monthly or quarterly, by selling securities if cash is short |
| **Wealthfront** | 0.25% a year for The Wealthfront Portfolio | The brokerage account is "$1 to get started" | Not stated on the pages I read | Not stated | About 75% of fiscal 2025 revenue came from its cash management business (S-1/A) |
| **Vanguard Digital Advisor** | Gross advisory fee 0.20% (index) or 0.25% (active) before a revenue credit; "no more than $20 per $10,000" for all-index and ESG, $25 for active-index; no advisory fee for the first 90 days | $100 | When the portfolio has "drifted more than 5% from our recommended allocation" | Not stated | Taxable, IRA, inherited IRA, SEP-IRA and eligible Vanguard-administered 401(k) accounts |
| **Robinhood Strategies** | 0.25% a year; Gold members "only pay management fees on $100,000 of assets" | $50 | Not stated | Not stated | Under $500, ETFs only; $500 or more may mix ETFs and individual stocks; 350,000 funded customers and over $2 billion of AUM at Q3 2026 |
| **Schwab Intelligent Portfolios** | Current terms not stated here | | | | The 2022 SEC order below |

Schwab's Intelligent Portfolios pages refused automated access, so the table doesn't state its current fee, cash allocation or minimum. <!-- source-gap: ida-schwab-sip-current-terms | missing | Schwab Intelligent Portfolios' current fee (none), Premium subscription, minimum and cash allocation range as of November 2026 | closes with: an opened Schwab Intelligent Portfolios disclosure brochure or Form ADV Part 2A for the program | checked: 2026-11-05 -->

Three things stand out. **Fees converge on 0.25% and below,** with flat monthly fees or caps for small and subscribed accounts, so the economics come from scale and from what surrounds the portfolio, cash above all. **Drift bands differ by a factor of two** (Betterment's 3% and Vanguard's 5%), each a stated parameter, and Betterment states that it rebalances through cash flows before trading. **Cash is disclosed as a conflict.** Betterment's brochure says higher sweep balances and lower interest paid "both serve to increase the revenue Betterment receives from Program Banks," and lists its mitigations: no wrap fee on swept cash, a small 0.5% target, and elective participation in its cash product.

## Questionnaires to Allocations

The questionnaire is the adviser's "reasonable inquiry into the client's financial situation," and its output is a recommendation. Betterment's brochure describes the shape most platforms share: the advice type (a goal such as retirement, or general investing), a time horizon where the goal has one, and the client's inputs map to "a specific set of asset classes (i.e., stocks, bonds, and if applicable, other asset classes) and the relative distribution among those asset classes," which differs for taxable and tax-advantaged goals and by portfolio strategy.

What the mapping looks like inside, in my own generic form:

1. **Inputs**, each versioned with the questionnaire: goal, horizon, age, income and liquid assets bands, the answers to risk questions (capacity: can the client afford a loss; willingness: would they sell after one).
2. **A risk score** from a published function of the inputs, often a capacity score capped by a willingness score so a client who says they'd sell in a crash isn't put at 90% stocks because their horizon is long.
3. **A glide path** for goals with a date: the equity share falls as the date approaches, by a schedule per strategy.
4. **A model** chosen from the strategy's ladder (say, 0% to 100% stocks in 10% steps) by the score and the glide path.
5. **A customer override** within limits, recorded as the customer's choice with the recommended model next to it, and a warning if it's outside the range the firm considers suitable.

The record that matters is the triple (questionnaire version, answers, model recommended), saved at the moment of advice, because the fiduciary duty is judged against what the adviser knew then. Opening Accounts' [`investment_profiles`](/books/investing-and-digital-assets/opening-accounts#how-to-build-it) holds the answers; this chapter's `account_models` holds the result.

## Model Portfolios

A model portfolio is a list of target weights over a list of instruments, with tolerances and a version. In practice a model has two layers: **asset classes** with target weights (US stocks 50%, developed international 25%, bonds 24.5%, cash 0.5%), and for each class one or more **tickers** that represent it. Betterment's tax-loss harvesting design gives each class a primary, a secondary and a tertiary ticker and lets an account hold more than one of them at once ("Parallel Position Management"), which means the account's holdings are not the model's tickers and drift has to be measured at the asset class level ([Tax-Loss Harvesting & Direct Indexing](/books/investing-and-digital-assets/tax-loss-harvesting-and-direct-indexing#substitute-securities)).

Models change: an investment committee replaces a fund, adds an asset class, moves the glide path. A model change is a new version, and moving thousands of accounts onto it is a migration with tax consequences in taxable accounts, so the usual practice is to switch accounts to the new targets and let cash flows and threshold rebalances move holdings over time, selling old tickers only where the tax cost is low. Betterment's brochure reserves the right to pause automated trading "to manage potential tax impacts during a portfolio strategy transition or in-kind transfer." The version an account was on at any date has to be answerable, because performance, billing and the client's statement all depend on it.

## Rebalancing and Drift Bands

Markets move weights away from targets. **Drift** is the distance between the account's current weights and its model, and rebalancing brings it back. The design choices:

- **The measure.** Per asset class (the largest absolute deviation from target, in percentage points), or for the portfolio (half the sum of absolute deviations, which equals the share of the portfolio that would have to trade to get back). Platforms state a tolerance without always stating the measure; my default is the per-class absolute deviation, which is easy to explain to a client.
- **The band.** A tolerance beyond which a threshold rebalance runs: 3% at Betterment for most portfolios, 5% at Vanguard Digital Advisor. A tight band trades more and tracks the model closely; a wide band trades less and, in taxable accounts, realizes fewer gains.
- **Cash flows first.** Betterment describes using deposits, withdrawals and dividend reinvestments to move toward targets before a threshold rebalance (Vanguard's page states only its 5% trigger): a deposit buys the underweight classes, a withdrawal sells the overweight ones. Betterment's order: "first directs inflows to fill any cash allocation to its target before buying underweight holdings and selling overweight holdings."
- **To target or to the band.** A rebalance can trade all the way back to target, or only back inside the band. Trading to target resets the clock; trading to the edge trades less but leaves the account near the threshold.
- **Minimums and priorities.** Small trades cost more than they fix; Betterment requires a minimum portfolio balance for rebalancing, calibrates to "avoid frequent small rebalance transactions," and "generally prioritizes identifying potential tax loss harvests ahead of potential rebalancing opportunities."

**Worked numbers: a rebalance with a drift band and cash.** My illustration. An account's model is 50% US stocks, 25% international stocks, 24.5% bonds and 0.5% cash, with a per-class band of 3 percentage points. It started at $100,000 on target. Over a quarter US stocks rise 20%, international is flat and bonds fall 2%:

| Class | Target | Value | Weight | Deviation |
| --- | ---: | ---: | ---: | ---: |
| US stocks | 50.0% | $60,000.00 | 54.79% | +4.79 |
| International | 25.0% | $25,000.00 | 22.83% | −2.17 |
| Bonds | 24.5% | $24,010.00 | 21.92% | −2.58 |
| Cash | 0.5% | $500.00 | 0.46% | −0.04 |
| **Total** | | **$109,510.00** | | |

US stocks are 4.79 points over: outside the band. Before the nightly run, a $3,000 deposit arrives. The new total is $112,510.00, so the targets are US $56,255.00, international $28,127.50, bonds $27,564.95 and cash $562.55.

1. **Fill cash to target:** $62.55 of the deposit stays as cash, leaving $2,937.45.
2. **Buy underweights in proportion to their shortfall:** international is $3,127.50 short and bonds $3,554.95, $6,682.45 in all, so international gets $2,937.45 × 3,127.50 ÷ 6,682.45 = **$1,374.78** and bonds **$1,562.67**.
3. **Check the band again:** US stocks are now $60,000.00 of $112,510.00, **53.33%**, still 3.33 points over. Cash flows weren't enough.
4. **Threshold rebalance to target:** sell **$3,745.00** of US stocks and buy $1,752.72 of international and $1,992.28 of bonds.

Without the deposit the same rebalance would have sold $5,245.00 of US stocks (to 50% of $109,510); the deposit saved $1,500 of selling. In a taxable account that is the point: if the US position's basis is the $50,000 it started at, the sale realizes $3,745.00 × 10,000 ÷ 60,000 = **$624.17** of gain, short-term if the lots are under a year old. A wider band, a "rebalance to the band edge" policy, or selling the highest-basis lots first ([Lot Relief Methods](/books/investing-and-digital-assets/cost-basis-and-tax-lots#lot-relief-methods)) each lowers that number, and each is a parameter to record.

The drift check, in the form a nightly job runs it, with weights in basis points so the comparison is exact:

```go tab="Go"
package rebalance

// Class is one asset class in an account: its model target and current value.
type Class struct {
	Name      string
	TargetBps int64 // target weight in basis points; the classes sum to 10_000
	Value     int64 // current market value in cents
}

// Breaches returns the classes whose weight is outside the band, in basis points.
// A class breaches when |value/total - target| > band, compared without division:
// |value*10_000 - target*total| > band*total.
func Breaches(classes []Class, bandBps int64) []string {
	var total int64
	for _, c := range classes {
		total += c.Value
	}
	if total == 0 {
		return nil
	}
	var out []string
	for _, c := range classes {
		diff := c.Value*10_000 - c.TargetBps*total
		if diff < 0 {
			diff = -diff
		}
		if diff > bandBps*total {
			out = append(out, c.Name)
		}
	}
	return out
}
```

```rust tab="Rust"
/// One asset class in an account: its model target and current value.
pub struct Class {
    pub name: String,
    pub target_bps: i128, // target weight in basis points; the classes sum to 10_000
    pub value: i128,      // current market value in cents
}

/// The classes whose weight is outside the band, compared without division:
/// |value * 10_000 - target * total| > band * total.
pub fn breaches(classes: &[Class], band_bps: i128) -> Vec<&str> {
    let total: i128 = classes.iter().map(|c| c.value).sum();
    if total == 0 {
        return Vec::new();
    }
    classes
        .iter()
        .filter(|c| (c.value * 10_000 - c.target_bps * total).abs() > band_bps * total)
        .map(|c| c.name.as_str())
        .collect()
}
```

On the table above, with a band of 300 basis points, `Breaches` returns US stocks before the deposit and again after the cash-flow step, which is what sends the run to a threshold rebalance. Integer cents times 10,000 overflow 64 bits only above about $9 trillion in one account; the Rust version uses 128-bit integers anyway.

## A Rebalance Run

A rebalance is a run with states, not a function call, because between deciding and booking it waits on markets, fills and other jobs.

![The rebalance run state machine. A row of states: scheduled, evaluated, planned, submitted, filled and booked, with that path accented and booked a terminal state. From evaluated, a dashed exit to the terminal no-action state when the account is within its bands. From planned, a dashed exit to the terminal deferred state when a corporate action, a transfer or a tax rule blocks trading. From submitted, a back edge labeled partial fill returns to planned, so the unfilled remainder is planned again.](/diagrams/ida-rebalance-run-states.svg "Most nightly evaluations end in no action; the ones that trade wait on fills and book only what was filled, and an account that can't trade today records why.")

How each state is decided:

- **Evaluated.** The run reads positions as of a cut ([Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions#how-positions-derive-from-the-ledger)), the model version and the band, and records the drift per class. Most accounts on most nights stop here.
- **Planned.** Cash flows are applied first, then threshold trades, then lot selection and wash sale checks against the account's recent purchases, its other accounts and the household ([Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots#wash-sales)). A plan that would wash a harvested loss buys the class's alternate ticker instead.
- **Deferred.** Trading is blocked by a pending corporate action, an incoming ACATS transfer, a pending withdrawal larger than cash, or a firm-wide pause; Betterment's brochure lists the first two. The reason is recorded and the next run tries again.
- **Submitted and filled.** Orders from many accounts are aggregated into block orders and filled at an average price ([Order Batches](/books/investing-and-digital-assets/fractional-and-recurring#how-brokers-create-fractions); allocation is in [RIA Custodians & Advisor Platforms](/books/investing-and-digital-assets/advisor-platforms#block-trading-and-allocation)). A partial fill sends the remainder back to planning against new prices.
- **Booked.** Each account's fills post to the ledger and tax lots, and the run records what it traded and why.

## Cash Drag and the Schwab Order

Every robo portfolio holds some cash: to pay fees, absorb small withdrawals and avoid selling fractions. The question is how much, and who decides. **Cash drag** is the return lost by holding cash instead of the model's invested assets: approximately the cash weight times the difference between the invested assets' return and the cash's yield.

**Worked numbers: cash drag on a robo portfolio.** My illustration, on $100,000 over a year in which the invested assets return 7%:

| Cash allocation | Cash yield | Drag | Dollars | Compare |
| --- | ---: | ---: | ---: | --- |
| 12.5% (the Schwab average) | 0.5% | 12.5% × (7.0% − 0.5%) = 0.8125% | $812.50 | More than three times a 0.25% fee ($250) |
| 12.5% | 3.5% | 12.5% × (7.0% − 3.5%) = 0.4375% | $437.50 | Still above the fee |
| 0.5% (an operational buffer) | 0% | 0.5% × 7.0% = 0.035% | $35.00 | A rounding error by comparison |

In a year when the invested assets fall, cash helps, which is why cash drag is a cost only "under market conditions where other assets such as equities outperform cash," in the SEC's words. The conflict is that the firm's revenue on the cash doesn't depend on the market: an affiliated bank earns the spread every year.

**The order.** On June 13, 2022 the SEC settled with Charles Schwab & Co. and two affiliated advisers (Release 34-95087, IA-6047) over Schwab Intelligent Portfolios, launched March 9, 2015 as a robo-adviser with no advisory fee. Schwab made money "in large part, by allocating a fixed percentage of clients' portfolios to cash and depositing that cash with Schwab Bank," and the order found:

- **The cash was a revenue target.** Management decided the portfolios "would collectively hold an average of at least 12.5% of their assets in cash," set each model's cash from 6% (most aggressive) to 29.4% (most conservative) "based in large part on its analysis that Schwab Bank would make a minimum amount of revenue at these levels," and the portfolio manager "treated the cash allocations provided by management as constraints."
- **Schwab knew the cost.** Its internal models showed the cash would reduce returns when other assets outperformed cash; employees used the term "cash drag"; one internal study found the portfolios would underperform a competitor's at all risk levels "even after subtracting a hypothetical advisory fee."
- **The disclosures said otherwise.** After critical press in February 2015, the Form ADV was rewritten in two days to say the cash allocations were "set based on a disciplined portfolio construction methodology designed to balance performance with risk management appropriate for a client's goal," and to describe a "potential conflict of interest." The SEC found "an actual, not just potential, conflict," and that the references to modern portfolio theory were misleading because the cash constraint prevented returns from being maximized at each level of risk.
- **"No advisory fees" was misleading.** Ads said "no hidden fees [and] no advisory fees," while Schwab's models showed the cash would "reduce investors' returns by approximately as much as advisory fees would have."
- **Money.** $45,907,541 of disgorgement, $5,629,320 of prejudgment interest and a $135,000,000 penalty, $186,536,861 in total, into a Fair Fund, for conduct from March 2015 through November 2018.

The engineering lesson is that a cash allocation is a model parameter with an owner. If the owner is the investment committee, the model's documentation says why the cash is there; if revenue had any say, the brochure says that plainly. The Betterment brochure's approach, a small stated target with no fee on the cash and the conflict named, is one pattern; the record that matters in either case is who set each model's cash weight, when, and on what analysis. Brokerage sweep economics are in [The Sweep Spread](/books/investing-and-digital-assets/cash-and-sweeps#the-sweep-spread).

## Fees

Robo fees take three shapes, and each needs its own accrual and billing logic:

- **Asset-based.** A percentage of assets, usually accrued daily on the account's value and billed monthly or quarterly. Betterment bills "on a monthly or quarterly, as applicable, basis in arrears," on or about the first business day after the period, selling securities if cash doesn't cover it, and carries mutual fund pricing differences into the next period.
- **Flat or capped.** Betterment's $5 a month under $24,000; Robinhood Strategies' cap at $100,000 of assets for Gold members, at most $250 a year at 0.25%. A cap is a tier with a zero rate above it.
- **Tiered by household.** Betterment's 0.25%, 0.15% and 0.10% bands apply across a household's investing accounts, so a deposit in one account can change the rate in another. The SEC's examination staff list failing to aggregate household accounts for breakpoints among the most frequent fee deficiencies ([Billing Advisory Fees](/books/investing-and-digital-assets/advisor-platforms#billing-advisory-fees)).

What a fee excludes is as important as its rate: Betterment's brochure excludes cash held in its sweep program from fee-bearing balances. A wrap fee bundles advice, trading and custody into one rate; the underlying fund expense ratios are charged separately inside the funds and belong in the cost the client is shown.

## Crypto in Managed Portfolios

Managed crypto exposure reaches retail clients mostly through ETFs. Betterment's brochure treats an ETF that invests in digital assets as a security in its wrap fee program, offers a Crypto ETF portfolio with a 7% drift tolerance against 3% for its other managed portfolios, and adds crypto-specific risk disclosures (volatility, limited history, technology, blockchain and regulatory risk). A wider band for a volatile sleeve is the sensible design: a 3% band on bitcoin would trade constantly.

Holding spot crypto in an advisory account is a custody question first: the adviser needs a qualified custodian for it under the custody rule, and the SEC proposed crypto custody amendments on October 6, 2026 ([The Custody Rule and the Withdrawn Safeguarding Proposal](/books/investing-and-digital-assets/advisor-platforms#the-custody-rule-and-the-withdrawn-safeguarding-proposal); [Qualified Custody](/books/investing-and-digital-assets/qualified-custody) later in this book covers the custodians). For the robo engine, a spot crypto sleeve needs 24/7 marks for drift and fees ([Pricing Data and Oracles for Marks](/books/investing-and-digital-assets/chain-data-and-indexing#pricing-data-and-oracles-for-marks)), a cut time for the nightly run on a market that never closes, and a rebalancing window that may differ from the equity session.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `accounts`, `instruments`, `orders`, `positions` and `fee_schedules`, with [Opening Accounts](/books/investing-and-digital-assets/opening-accounts)' `investment_profiles` and [Advice, Reg BI & Conduct](/books/investing-and-digital-assets/advice-and-conduct)'s `recommendations` (kind `model_portfolio`). This chapter adds models and their versions, the account's model assignment, and rebalance runs with their drift checks.

```sql
CREATE TABLE model_portfolios (              -- a strategy's model, e.g. 'core 60/40'
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),  -- the adviser
  strategy            TEXT NOT NULL,           -- 'core', 'socially_responsible', 'crypto_etf', ...
  name                TEXT NOT NULL,
  tax_profile         TEXT NOT NULL CHECK (tax_profile IN ('taxable', 'tax_advantaged')),
  equity_share_bps    INT NOT NULL,            -- its rung on the strategy's ladder
  version             INT NOT NULL,
  band_bps            INT NOT NULL,            -- drift tolerance, e.g. 300
  band_measure        TEXT NOT NULL CHECK (band_measure IN ('per_class_abs', 'portfolio_half_sum')),
  rebalance_to        TEXT NOT NULL CHECK (rebalance_to IN ('target', 'band_edge')),
  cash_target_bps     INT NOT NULL,            -- the cash weight, a parameter with an owner
  cash_rationale      TEXT NOT NULL,           -- why: the committee's reason, in words
  approved_by         TEXT NOT NULL,           -- investment committee minute or approver
  valid_during        TSTZRANGE NOT NULL,
  UNIQUE (strategy, name, tax_profile, version)
);

CREATE TABLE model_allocations (             -- target weights by asset class, and the tickers for each
  model_portfolio_id  UUID NOT NULL REFERENCES model_portfolios (id),
  asset_class         TEXT NOT NULL,           -- 'us_stocks', 'intl_developed', 'bonds', 'cash', ...
  target_bps          INT NOT NULL CHECK (target_bps BETWEEN 0 AND 10000),
  primary_instrument_id UUID NOT NULL REFERENCES instruments (id),
  alternate_instrument_ids UUID[] NOT NULL DEFAULT '{}',  -- secondary and tertiary, in order
  PRIMARY KEY (model_portfolio_id, asset_class)
);

CREATE TABLE account_models (                -- which model an account follows, by date
  account_id          UUID NOT NULL REFERENCES accounts (id),
  model_portfolio_id  UUID NOT NULL REFERENCES model_portfolios (id),
  recommendation_id   UUID REFERENCES recommendations (id),  -- the advice that chose it
  chosen_by           TEXT NOT NULL CHECK (chosen_by IN ('recommended', 'customer_override',
                        'glide_path', 'model_migration')),
  rebalance_mode      TEXT NOT NULL DEFAULT 'full' CHECK (rebalance_mode IN ('full',
                        'cash_flows_only', 'off')),
  valid_during        TSTZRANGE NOT NULL,
  PRIMARY KEY (account_id, valid_during)
);

CREATE TABLE rebalance_runs (                -- one evaluation of one account
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  model_portfolio_id  UUID NOT NULL REFERENCES model_portfolios (id),
  trigger             TEXT NOT NULL CHECK (trigger IN ('nightly', 'deposit', 'withdrawal',
                        'dividend', 'fee', 'model_change', 'manual')),
  positions_as_of     TIMESTAMPTZ NOT NULL,
  through_entry_id    UUID NOT NULL REFERENCES journal_entries (id),
  status              TEXT NOT NULL CHECK (status IN ('scheduled', 'evaluated', 'planned',
                        'submitted', 'filled', 'booked', 'no_action', 'deferred')),
  deferred_reason     TEXT,                    -- 'corporate_action', 'acats_pending', 'paused', ...
  plan                JSONB,                   -- intended trades by class and instrument, with lots
  estimated_realized_gain BIGINT,              -- minor units, for taxable accounts
  order_ids           UUID[] NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at         TIMESTAMPTZ
);

CREATE TABLE drift_checks (                  -- the measurement behind each run's decision
  rebalance_run_id    UUID NOT NULL REFERENCES rebalance_runs (id),
  stage               TEXT NOT NULL CHECK (stage IN ('before_flows', 'after_flows', 'after_trades')),
  asset_class         TEXT NOT NULL,
  value               BIGINT NOT NULL,         -- minor units
  weight_bps          INT NOT NULL,
  deviation_bps       INT NOT NULL,            -- signed, against the model's target
  breached            BOOLEAN NOT NULL,
  PRIMARY KEY (rebalance_run_id, stage, asset_class)
);
```

How it runs:

1. **Nightly, after positions are rebuilt,** create a run per managed account with the cut and the model version in force, and write `drift_checks` at `before_flows`.
2. **Apply pending cash flows** (deposits, withdrawals, dividends, fees) by the model's order, and write `after_flows`.
3. **If any class still breaches, plan threshold trades** to target or the band edge, choosing lots and checking wash sales against the household; estimate the realized gain.
4. **Defer when blocked,** with the reason, and let the next run retry.
5. **Submit through the block engine,** book fills, and replan remainders after a partial fill.

Design notes:

- **Cash is a row in `model_allocations` with a rationale and an approver** on the model, so a regulator asking who set the cash weight gets an answer from the table.
- **Drift is stored, not recomputed,** at each stage, so an account's history of why it traded (or didn't) survives later price corrections.
- **A model change is a new version and a migration,** with `chosen_by = 'model_migration'`, never an edit of the targets in place.
- **The customer's override is preserved next to the recommendation,** because the adviser's duty runs to both.

## Auditing

The SEC examines robo-advisers on whether the advice matched the client, whether the program did what the brochure says, and whether conflicts are disclosed as they are. Keep:

- **Every questionnaire version, answer set and recommended model,** with any override.
- **Every model version** with targets, tickers, band, cash weight and its rationale and approver.
- **Every rebalance run** with drift at each stage, the plan, the deferral reasons and the trades.
- **The cash held in every managed account by day,** with where it was swept and what the firm earned on it.
- **Fee calculations** reproducible from balances, tiers, household aggregation and exclusions.
- **Brochure statements about rebalancing, cash and fees** next to the parameters in force, so the two can be compared on any date.

## What This Means for the System You Build

- **Version the questionnaire, the model and the mapping between them,** and save the triple at the moment of advice.
- **Measure drift at the asset class level,** because tax-aware accounts hold more than one ticker per class.
- **Rebalance through cash flows first,** then trade only what the band requires, and record the realized gain the plan expected.
- **Make cash a model parameter with an owner and a reason,** and disclose any revenue the firm earns on it as an actual conflict.
- **Treat a rebalance as a run with states,** deferrals and partial fills, not a function.
- **Aggregate households for fee tiers** and exclude what the brochure excludes.
- **Give volatile sleeves like crypto ETFs their own band** and a 24/7 mark policy.

## References

**Regulators and guidance**

- [Federal Register: Commission Interpretation Regarding Standard of Conduct for Investment Advisers (84 FR 33669)](https://www.federalregister.gov/documents/full_text/html/2019/07/12/2019-12208.html), reasonable inquiry into the client's situation and the duty's application to robo-advisers
- [Federal Register: Adviser and Regulated Fund Custody Rules; Crypto Custody Rules (91 FR 63870, October 6, 2026)](https://www.federalregister.gov/api/v1/documents/2026-20466.json), the proposed crypto custody amendments, comments due December 7, 2026
- [SEC OCIE: Risk Alert, Most Frequent Advisory Fee and Expense Compliance Issues (April 12, 2018)](https://www.sec.gov/files/ocie-risk-alert-advisory-fee-expense-compliance.pdf), household aggregation and breakpoint deficiencies

**Courts and enforcement**

- [SEC: In the Matter of Charles Schwab & Co., Schwab Wealth Investment Advisory and Charles Schwab Investment Advisory (Rel. 34-95087, IA-6047, June 13, 2022)](https://www.sec.gov/litigation/admin/2022/34-95087.pdf), the March 9, 2015 launch, the 12.5% average and 6% to 29.4% range, cash allocations as constraints, internal cash drag findings, the Form ADV language, the advertising, and the $186,536,861 total

**Filings**

- [Wealthfront: Form S-1/A (December 11, 2025)](https://www.sec.gov/Archives/edgar/data/1524566/000162828025056439/wealthfrontforms-1prexeffe.htm), platform assets of $88.2 billion and over 1.3 million funded clients at July 31, 2025, and cash management at about 75% of fiscal 2025 revenue
- [Robinhood: Q3 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000164/q32026robinhoodexhibit991.htm), Robinhood Strategies at 350,000 funded customers and over $2 billion of AUM

**Vendor documentation**

- [Betterment: Form ADV Part 2A brochure (October 27, 2026)](https://www.betterment.com/adv), the Allocation process, the 0.5% operational cash allocation from May 1, 2026 and its conflict, the 3% and 7% drift tolerances, cash-flow rebalancing, minimums and priorities, pauses, fees in arrears, order aggregation and the crypto ETF portfolio
- [Betterment: Pricing](https://www.betterment.com/pricing), $5 a month, 0.25%, the $1 million and $2 million tiers, Premium at 0.65% and no minimum balance
- [Betterment: Tax-loss harvesting methodology (updated August 4, 2026)](https://www.betterment.com/resources/tax-loss-harvesting-methodology), primary, secondary and tertiary tickers and Parallel Position Management
- [Wealthfront: Pricing](https://www.wealthfront.com/pricing), the 0.25% fee and the $1 brokerage account
- [Vanguard: Digital Advisor](https://investor.vanguard.com/advice/digital-advisor), gross fees, the per-$10,000 caps, the 90-day waiver, the $100 minimum, the 5% drift trigger and eligible accounts
- [Robinhood: Strategies](https://robinhood.com/us/en/strategies/), the 0.25% fee, the $100,000 cap for Gold, the $50 minimum and the ETF and stock thresholds
