+++
title = "Portfolio Accounting & Performance"
nav_title = "Portfolio Accounting"
description = "Time-weighted vs money-weighted returns on the same cash flows, external flows, GIPS 2020, benchmarks, fees in performance, and crypto at 24/7 marks."
category = "Investing & Digital Assets Industry"
order = 2534
part = "Wealth and Advice"
tags = ["investing", "performance", "twr", "mwr", "gips", "benchmarks", "portfolio-accounting"]
+++

"How did my account do?" has two correct answers that often disagree. One measures the manager: what a dollar invested at the start of the period would have become, regardless of when the client added or withdrew money. The other measures the client's experience: the return on the money actually invested, when it was invested. A client who deposited a large sum just before a decline sees a worse number than the portfolio's, and both numbers are right. Statements, performance reports, marketing and the adviser's own composites each need the right one, computed the same way every time, from valuations and cash flows the firm can reproduce.

Portfolio accounting is the layer that makes that possible. It is not the ledger: the ledger says what the account holds and why each unit moved; portfolio accounting says what the holdings were worth at each valuation point, which movements were the client's (external flows) and which were the portfolio's own (dividends, fees charged inside funds, trades), and how returns link from one period to the next. Advisers and their platforms run it daily for billing, rebalancing and reporting, and the adviser marketing rule and the GIPS standards decide how its results may be shown.

This chapter covers that layer as of November 2026: time-weighted and money-weighted returns worked on the same cash flows, external flows and valuation points, the GIPS 2020 standards, benchmarks and relative returns, fees in performance, and crypto performance at 24/7 marks. Positions come from [Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions#how-positions-derive-from-the-ledger); the marketing rule's performance requirements are in [The Marketing Rule](/books/investing-and-digital-assets/advice-and-conduct#the-marketing-rule).

## How the Platforms Do It

Portfolio accounting is mostly sold to advisers as a platform, and the vendors describe the job in the same terms, as of November 2026:

| Vendor | What it describes | What stands out |
| --- | --- | --- |
| **Orion** | Portfolio accounting to "automate performance reporting, billing, and oversight"; trading with "model management"; a TAMP through Orion Portfolio Solutions | "$6.8T" of advisor-managed assets administered on its platform and "100,000+" professionals on its Redtail CRM (as of September 30, 2026) |
| **Envestnet** | Trading, direct indexing and a tax management overlay | Announced it would acquire Vestmark |
| **Altruist** | Fee billing by AUM, flat, hourly or one-off, monthly, quarterly or annually | Billing at a firm that is also the clearing and custody broker ([RIA Custodians & Advisor Platforms](/books/investing-and-digital-assets/advisor-platforms#how-the-platforms-do-it)) |
| **Betterment** (Advisor Solutions) | Managed portfolios and reporting for third-party advisers on its custody | A wrap fee tiered from 0.12% to 0.20% by the advising firm's aggregate balance |

The shared design: **one valuation history and one flow history per account,** from which performance, billing and rebalancing all read, so the fee a client paid and the return they were shown come from the same numbers.

## Two Returns on the Same Cash Flows

**Time-weighted return (TWR)** splits the period at every external cash flow, computes each sub-period's return from the value just before the flow, and chains the sub-period returns geometrically. Flows don't affect it, so it measures the manager's decisions on whatever money they had. **Money-weighted return (MWR)** is the internal rate of return: the single rate at which the starting value plus every flow, compounded to the end, equals the ending value. Flows do affect it, so it measures the investor's outcome.

**Worked numbers: TWR and MWR on the same flows.** My illustration, for calendar 2026:

| Date | Event | Value |
| --- | --- | ---: |
| January 1 | Start | $100,000.00 |
| March 31 | Value before the deposit | $110,000.00 |
| March 31 | Client deposits $50,000.00 | $160,000.00 |
| December 31 | End | $152,000.00 |

**Time-weighted.** Two sub-periods, split at the deposit:

- January 1 to March 31: 110,000 ÷ 100,000 = 1.1000, **+10.00%**
- March 31 to December 31: 152,000 ÷ 160,000 = 0.9500, **−5.00%**
- Linked: 1.1000 × 0.9500 − 1 = **+4.50%**

**Money-weighted.** Solve for r with the deposit invested for the 275 days from March 31 to December 31, 275/365 = 0.7534 of the year:

100,000 × (1 + r) + 50,000 × (1 + r)^0.7534 = 152,000

which gives r = **+1.45%**. The **Modified Dietz** approximation, the gain divided by the time-weighted average capital, gives the same to two decimals here: the gain is 152,000 − 100,000 − 50,000 = $2,000, the average capital is 100,000 + 50,000 × 0.7534 = $137,671, and 2,000 ÷ 137,671 = **+1.45%**.

The manager earned 4.50% on each dollar under management. The client made $2,000 on an average of $137,671, 1.45%, because a third of their money arrived just before the portfolio fell 5%. A report that shows the client 4.50% is honest about the manager and misleading about the client's money; a composite that showed 1.45% would penalize the manager for a deposit they didn't time. That is the whole argument for showing both: TWR for comparing managers and against benchmarks, MWR on the client's own statement.

Linking sub-period returns is a few lines; what matters is that the inputs are values just before each external flow, which only a valuation history at flow dates can give:

```go tab="Go"
package perf

// SubPeriod is one span between external flows: the value at its start (after the
// previous flow) and the value at its end (just before the next flow).
type SubPeriod struct {
	StartValue float64
	EndValue   float64
}

// TimeWeighted links sub-period returns geometrically.
func TimeWeighted(periods []SubPeriod) float64 {
	growth := 1.0
	for _, p := range periods {
		if p.StartValue == 0 {
			continue // an empty account earns nothing in that span
		}
		growth *= p.EndValue / p.StartValue
	}
	return growth - 1
}
```

```rust tab="Rust"
/// One span between external flows: the value at its start (after the previous
/// flow) and the value at its end (just before the next flow).
pub struct SubPeriod {
    pub start_value: f64,
    pub end_value: f64,
}

/// Links sub-period returns geometrically.
pub fn time_weighted(periods: &[SubPeriod]) -> f64 {
    periods
        .iter()
        .filter(|p| p.start_value != 0.0) // an empty account earns nothing in that span
        .map(|p| p.end_value / p.start_value)
        .product::<f64>()
        - 1.0
}
```

With the two sub-periods above ({100,000, 110,000} and {160,000, 152,000}) both return 0.045. Returns are ratios, so floating point is fine here; the values and flows they are computed from come from integer minor units in the ledger ([Integer Minor Units](/docs/money/amounts#integer-minor-units)), and the result is rounded only for display.

## External Flows and Valuation Points

The hard part of performance is classification, not arithmetic. Every movement in an account is either **external** (crossing the boundary of the portfolio being measured) or **internal** (the portfolio's own activity):

| Movement | External? | Notes |
| --- | --- | --- |
| Deposit, withdrawal, ACATS transfer in or out | Yes | Valued at the transfer time for securities |
| Dividend, interest, coupon received | No | Income is return |
| Trades, including rebalances and harvests | No | |
| Fund expense ratios | No | Already inside the fund's price |
| Advisory fee deducted from the account | Depends | External for a gross-of-fees return; internal (a cost that lowers return) for net-of-fees |
| Transfer between two accounts of the same client | Yes for each account; no for the household | Depends on what is being measured |
| A match or promotional credit | Yes | It's new money, not return |
| Staking reward, airdrop | No if the portfolio earned it | Income in kind |

The valuation points follow from the flows: TWR needs a value just before each external flow. Daily valuation solves the problem outright, since every flow then falls at a valuation point; where values are monthly, the GIPS standards below require a valuation at each "large cash flow" and an approximation (daily-weighted flows) for the rest. Most robo and advisory platforms value daily, so they compute daily returns and link them.

Two engineering rules keep this reproducible. **Classify flows once, when they post,** with the classification on the flow record, never re-derived at report time from transaction descriptions. **Store each day's valuation with its price sources,** so a corrected price is a new valuation version and last quarter's report can be rerun as it was or as corrected, deliberately ([Recorded Time and Corrections](/docs/database/temporal-data#recorded-time-and-corrections)).

## GIPS

The Global Investment Performance Standards, owned by CFA Institute, are a voluntary standard for how investment firms calculate and present performance; firms claim compliance, usually with independent verification, because institutional buyers ask for it. The 2020 edition for firms took effect January 1, 2020, and GIPS Reports with performance "for periods ending on or after 31 December 2020 must be prepared in accordance with the 2020 edition." The rules that shape a system:

- **Time-weighted by default.** "The firm must present time-weighted returns unless certain criteria are met," and may present money-weighted returns only if it "has control over the external cash flows" and the portfolios are closed-end, fixed life, fixed commitment, or hold illiquid investments as a significant part of the strategy (1.A.35). A robo-adviser or RIA managing open accounts reports TWR.
- **Valuation.** For time-weighted returns, portfolios are valued at least monthly, as of the calendar month end or last business day, and "on the date of all large cash flows," which the firm must define for each composite (2.A.23); returns are calculated at least monthly, sub-period returns at each large cash flow if not daily, and flows that aren't large adjusted by daily weighting (2.A.24).
- **Money-weighted, where allowed:** annualized since-inception returns using daily external cash flows (2.A.29).
- **Composites.** "All actual, fee-paying, discretionary segregated accounts must be included in at least one composite" (3.A.2), and composite returns are asset-weighted from their members' returns, by beginning-of-period values or a method that also reflects external cash flows.
- **Fees.** Gross-of-fees returns are reduced by transaction costs; net-of-fees by transaction costs and the investment management fee. For bundled fees where transaction costs can't be separated, gross returns are reduced by the entire bundled fee or the part that includes transaction costs, and net returns by the entire bundled fee or the part that includes both. For wrap fee composites, "pure gross-of-fees" returns (before the whole wrap fee) must be labeled as such and shown as supplemental information.

GIPS isn't law; the marketing rule is. Rule 206(4)-1 requires net performance alongside any gross performance, with equal prominence, and one-, five- and ten-year periods for portfolios and composites, so an adviser that follows GIPS still checks each advertisement against the rule.

## Benchmarks

A benchmark makes a return mean something: 4.50% is good in a year the benchmark returned 2% and bad in one it returned 12%. The choices a platform has to make and record:

- **Which benchmark.** A blended index for a model (for a 60/40 model, 60% a stock index and 40% a bond index, rebalanced monthly), matched to the model's version; when the model changes, the benchmark changes from that date and the history keeps both.
- **Total return.** Benchmarks are total return (dividends reinvested), because the account's return includes income.
- **Relative return.** Arithmetic (account minus benchmark) for client reports; geometric ((1 + account) ÷ (1 + benchmark) − 1) where periods are chained.
- **Tracking error.** The standard deviation of periodic relative returns, the measure a direct indexing account is judged by ([Direct Indexing](/books/investing-and-digital-assets/tax-loss-harvesting-and-direct-indexing#direct-indexing)), computed from monthly or daily relative returns over a stated window.
- **Licensing.** Index providers license their data for display and for benchmarks; that is a market data entitlement ([Entitlements, Delayed Data and Display Rules](/books/investing-and-digital-assets/market-data#entitlements-delayed-data-and-display-rules)).

## Fees in Performance

Fees separate gross from net, and the difference is what the client keeps. On the worked example, a 0.25% annual advisory fee deducted quarterly reduces the TWR by roughly the fee: net ≈ (1.045 × (1 − 0.0025)) − 1 ≈ **4.24%**, with the exact figure depending on when each quarter's deduction came out and the values then. Computed properly, each fee deduction is a cash outflow treated as internal for the net return: it lowers the end value of its sub-period instead of splitting the period.

What the marketing rule and GIPS together require: gross returns never appear without net, and wrap fee programs label pure gross returns and say what the fee bundles. For a robo-adviser this is easy to get right and easy to get wrong: easy because the fee is deducted from the account and its date and amount are in the ledger; wrong because a fee billed from a different account of the household (Altruist and others let advisers route a household's fees to one designated account) makes the paying account look worse and the others look better unless flows are classified per account.

## Crypto Performance at 24/7 Marks

Securities have a closing price; crypto has a price at every second, on every venue, slightly different on each. Performance needs one value per instrument per valuation point, so a crypto-holding portfolio needs a **mark policy**: the cut time (for example 00:00 UTC, or 4:00 p.m. New York to align with equities), the source (a composite index, a reference rate, or the platform's own venue), and the fallback when the source is stale. The same policy has to drive performance, fees, rebalancing drift and year-end tax values, or a client's fee is computed on one bitcoin price and their return on another. The mark methodology and its storage are in [Pricing Data and Oracles for Marks](/books/investing-and-digital-assets/chain-data-and-indexing#pricing-data-and-oracles-for-marks).

Three crypto specifics change the flow classification. **Staking rewards and airdrops** arrive as units, not dollars: they are income to the portfolio (internal), valued at the mark when received ([Staking as a Product](/books/investing-and-digital-assets/staking#tax) covers their tax side). **Network fees** paid on a transfer out are a cost to the portfolio, not part of the withdrawal. **Transfers between a customer's own wallets** are external to the platform's account but not to the customer's wealth, the same household question as above. A 24/7 market also has no natural month-end "last business day," so monthly valuation for a GIPS-style report uses the calendar month-end at the policy's cut.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `positions`, `transfers`, `instruments` and `fees`, with [Chain Data & Indexing](/books/investing-and-digital-assets/chain-data-and-indexing)'s `price_marks` for crypto and [Robo-Advisors & Model Portfolios](/books/investing-and-digital-assets/robo-advisors)' `model_portfolios`. This chapter adds valuations, external flows, performance periods, benchmarks and composites.

```sql
CREATE TABLE valuations (                    -- an account's value at a valuation point, versioned
  account_id          UUID NOT NULL REFERENCES accounts (id),
  valued_at           TIMESTAMPTZ NOT NULL,    -- the cut, e.g. 16:00 New York or 00:00 UTC
  version             INT NOT NULL DEFAULT 1,  -- a price correction is a new version
  market_value        BIGINT NOT NULL,         -- minor units of the base currency
  accrued_income      BIGINT NOT NULL DEFAULT 0,
  through_entry_id    UUID NOT NULL REFERENCES journal_entries (id),  -- the positions it used
  mark_policy         TEXT NOT NULL,           -- which price sources and cut
  detail              JSONB NOT NULL,          -- per instrument: quantity, price, source
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (account_id, valued_at, version)
);

CREATE TABLE external_flows (                -- classified once, when the movement posts
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  transfer_id         UUID REFERENCES transfers (id),
  fee_id              UUID REFERENCES fees (id),
  kind                TEXT NOT NULL CHECK (kind IN ('deposit', 'withdrawal', 'transfer_in',
                        'transfer_out', 'advisory_fee', 'match', 'internal_household')),
  amount              BIGINT NOT NULL,         -- signed: positive in, negative out, minor units
  flow_at             TIMESTAMPTZ NOT NULL,
  is_large            BOOLEAN NOT NULL DEFAULT FALSE,  -- per the composite's definition
  CHECK ((transfer_id IS NULL) <> (fee_id IS NULL))
);

CREATE TABLE benchmarks (                    -- a blended, versioned benchmark
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  name                TEXT NOT NULL,
  components          JSONB NOT NULL,          -- [{index, weight_bps}], total return
  rebalance           TEXT NOT NULL,           -- 'monthly', 'daily'
  license_ref         TEXT NOT NULL,           -- the index data license that permits this use
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE performance_periods (           -- computed returns, reproducible from inputs
  account_id          UUID REFERENCES accounts (id),
  composite_id        UUID,                    -- set for composite returns instead
  period              DATERANGE NOT NULL,
  method              TEXT NOT NULL CHECK (method IN ('twr_daily', 'twr_modified_dietz',
                        'mwr_irr')),
  basis               TEXT NOT NULL CHECK (basis IN ('gross', 'net', 'pure_gross')),
  return_value        NUMERIC(12, 8) NOT NULL, -- a ratio, e.g. 0.04500000
  benchmark_id        UUID REFERENCES benchmarks (id),
  benchmark_return    NUMERIC(12, 8),
  valuation_versions  JSONB NOT NULL,          -- which valuation versions it read
  computed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((account_id IS NULL) <> (composite_id IS NULL))
);

CREATE TABLE composites (                    -- GIPS composites of discretionary portfolios
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  name                TEXT NOT NULL,
  strategy            TEXT NOT NULL,           -- matches model_portfolios.strategy
  large_flow_threshold_bps INT NOT NULL,       -- the composite's large cash flow definition
  benchmark_id        UUID NOT NULL REFERENCES benchmarks (id),
  created_on          DATE NOT NULL
);

CREATE TABLE composite_members (             -- which accounts were in, when
  composite_id        UUID NOT NULL REFERENCES composites (id),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  valid_during        DATERANGE NOT NULL,
  PRIMARY KEY (composite_id, account_id, valid_during)
);

ALTER TABLE performance_periods ADD FOREIGN KEY (composite_id) REFERENCES composites (id);
```

How it runs:

1. **Each day at the cut,** value every managed account from positions and the mark policy, as a new `valuations` row.
2. **When a transfer or fee posts,** classify it into `external_flows` in the same transaction, flagging large flows by the composite's threshold.
3. **Compute daily TWR** from consecutive valuations and the flows between them, link to months, quarters and years, gross and net; compute MWR per account for client statements.
4. **Compute composite returns** asset-weighted from members in each month, with membership by date.
5. **Recompute deliberately** after a valuation correction, storing a new `performance_periods` row that names the valuation versions it read.

Design notes:

- **Valuations are versioned and pinned,** so a report shows the numbers it was built on and a correction is a choice, not a side effect.
- **Fees are flows with a basis.** The same advisory fee is external for gross and internal for net, so the flow row exists once and the calculation decides.
- **Composite membership is dated,** because a portfolio that leaves a composite takes none of its history with it.
- **One mark policy per instrument class,** shared by performance, billing, drift and tax values.

## Auditing

Performance is tested by the SEC under the marketing rule, by GIPS verifiers, and by clients comparing statements. Keep:

- **Every valuation version** with its prices, sources and cut.
- **Every external flow** with its classification and the rule that classified it.
- **Every performance figure** shown to a client or in an advertisement, with method, basis, period, benchmark and the valuation versions behind it.
- **Composite definitions and membership** by date, with large cash flow thresholds.
- **Benchmark definitions and data licenses.**

## What This Means for the System You Build

- **Compute both TWR and MWR,** and show each where it answers the question: TWR for the manager and benchmarks, MWR for the client's own money.
- **Classify flows when they post,** never at report time.
- **Value daily where you can,** so every flow falls at a valuation point.
- **Version valuations** and make every performance figure name the versions it used.
- **Never show gross without net,** and label pure gross for wrap programs.
- **Match benchmarks to model versions,** total return, with the license recorded.
- **Give crypto one mark policy** for performance, fees, drift and tax values.

## References

**Law and regulation**

- [17 CFR 275.206(4)-1: Investment adviser marketing](https://www.law.cornell.edu/cfr/text/17/275.206(4)-1), net with gross at equal prominence and one-, five- and ten-year periods

**Standards and protocols**

- [CFA Institute: Global Investment Performance Standards for Firms, 2020 edition](https://www.gipsstandards.org/wp-content/uploads/2021/03/2020_gips_standards_firms.pdf), the January 1, 2020 effective date, the December 31, 2020 requirement, time-weighted returns by default and the money-weighted criteria (1.A.35), valuation and large cash flows (2.A.23, 2.A.24), daily flows for money-weighted returns (2.A.29), composite membership (3.A.2) and asset weighting, bundled fees and pure gross-of-fees returns for wrap composites
- [CFA Institute: GIPS standards for firms](https://www.gipsstandards.org/standards/gips-standards-for-firms/), the standard's home page and errata

**Vendor documentation**

- [Orion](https://orion.com/), portfolio accounting, billing and oversight, model management, its TAMP, and the $6.8 trillion and 100,000+ figures as of September 30, 2026
- [Envestnet](https://www.envestnet.com/), trading, direct indexing, tax management and the announced Vestmark acquisition
- [Altruist: Fee billing](https://altruist.com/fee-billing/), fee types, frequencies and routing a household's fees to a designated account
- [Betterment: Form ADV Part 2A brochure (October 27, 2026)](https://www.betterment.com/adv), the Advisor Solutions wrap fee from 0.12% to 0.20%
