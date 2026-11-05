+++
title = "Investing & Digital Assets Metrics"
nav_title = "Investing Metrics"
description = "One definition per investing and crypto metric: funded customers, assets, net deposits, ARPU, DARTs, take rate and stablecoin supply, as filings define them."
category = "Investing & Digital Assets Industry"
order = 2580
part = "Running the Platform"
tags = ["investing", "crypto", "metrics", "kpis", "analytics", "stablecoins", "data-model"]
+++

Brokers and exchanges report a handful of numbers every quarter, and almost none of them mean the same thing from one company to the next. Robinhood counts funded customers, people with a positive balance or a transaction in the past 45 days; Schwab counts active brokerage accounts, accounts with activity in the past 270 days; Coinbase counted monthly transacting users over a rolling 28 days. Robinhood's net deposits include dividends, staking rewards and promotional stock; a performance report's external flows exclude them. Coinbase's trading volume counted half of every trade it routed elsewhere, and in 2026 it changed what its headline volume includes. A metric copied from one company's filing and computed over another's data is a different metric, and the arguments that follow are about the definition.

This chapter owns the volume's metric definitions: each metric with the filing's own definition where one exists, the formula over the book's tables, and where the variants disagree, with a metric computed two ways in worked numbers. The industry map of who reports what (accounts, assets and activity at each broker, exchange and issuer) is [The Investing & Crypto Landscape](/books/investing-and-digital-assets/investing-landscape), whose `participant_metrics` stores outside firms' figures as reported; this chapter is about computing the platform's own. The revenue behind the numbers is [How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models), and return calculations are [Portfolio Accounting & Performance](/books/investing-and-digital-assets/portfolio-accounting). The general method (one definition per metric with its version, grain and business date; frozen periods; reconciliation to source) is the playbook's [One Definition per Metric](/docs/data/data-pipelines#one-definition-per-metric), and the other volumes' versions are [Banking & Lending Metrics](/books/banking-and-lending/banking-metrics), [Payments Metrics](/books/payments/payments-metrics) and [Commerce Metrics](/books/commerce/commerce-metrics). The chapter adds `metric_definitions` and `metric_values` to [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model), in the same shape as those volumes.

## Why the Same Metric Disagrees

Seven choices change most numbers in this chapter, and each definition below states them:

- **Person, account or wallet.** Robinhood counts unique people ("Individuals who share a funded joint investing account are each considered to be a Funded Customer"); Schwab counts accounts; Circle counts on-chain wallets. One person with an individual account, a Roth IRA and a joint account is one funded customer, three accounts, and possibly a second customer (the joint owner).
- **The activity window.** 45 days (Robinhood funded customers), 270 days (Schwab active accounts), 28 days (Coinbase MTUs). A longer window holds dormant customers in the count longer.
- **What counts as activity.** A positive balance, a transaction, a login, a passive event such as a dividend or a staking reward. Robinhood excludes "amounts that are deposited into a Funded Customer account by the Company with no action taken by the unique person," so a free share alone doesn't make a customer funded.
- **Average or end of period.** ARPU divides by an average of customers; which average (two points, monthly, daily) moves the result.
- **Annualized how.** A quarter times four, or the trailing twelve months. Robinhood's 10-K and its quarterly releases use different growth rates for net deposits (below).
- **Gross or net, and of what.** Net deposits net of withdrawals and of interest and fees charged; volume counting both sides or one; Coinbase counting "half of the value of trades that we routed off our platform."
- **Scope changes.** Acquisitions and new programs enter the count on a date: Robinhood's net deposits included TradePMR from March 2026, WonderFi from June 2026, and Trump Account contributions and Treasury seed funding from July 2026. A growth rate across a scope change measures the acquisition.

My rule, as in the other volumes: every metric is a versioned definition with its unit of count, window, valuation basis, annualization, scope and formula; every reported value names its definition and version; and a reported period is frozen, so a late correction, a restated price or a scope change creates a new row rather than a silent change. Where the company has published a definition in a filing, that definition is the default, because investors, analysts and the SEC read the filing.

## How the Companies Report

As of November 2026, from each company's own filings (definitions quoted or closely paraphrased):

| Company | Metric | Definition as filed |
| --- | --- | --- |
| **Robinhood** | Funded Customer | "a unique person who has at least one account with a Robinhood entity and, within the past 45 calendar days (a) had an account balance that was greater than zero (excluding amounts that are deposited into a Funded Customer account by the Company with no action taken by the unique person) or (b) completed a transaction using any such account" |
| **Robinhood** | Total Platform Assets | The fair value of all equities, options, cryptocurrency, futures and other customer assets on the platform, as of a date, "on a trade date basis" |
| **Robinhood** | Net Deposits | "all cash deposits and asset transfers from customers, as well as dividends, interest, staking rewards, and cash or assets earned in connection with Company promotions ... net of reversals, customer cash withdrawals, margin and lending interest, Robinhood Gold subscription fees, and assets transferred off of our platforms" |
| **Robinhood** | ARPU | "total revenue for a given period divided by the average number of Funded Customers on the last day of that period and the last day of the immediately preceding period"; quarterly releases annualize it |
| **Robinhood** | Gold Subscriber | A unique person who, at period end, is subscribed to Robinhood Gold and "has made at least one Robinhood Gold subscription fee payment" |
| **Schwab** | Active brokerage accounts | "Brokerage accounts with activity within the preceding 270 days" |
| **Schwab** | Core net new assets | "Net new client assets before significant one-time inflows or outflows, such as acquisitions/divestitures," and excluding other extraordinary flows |
| **Schwab** | Daily average trades | Daily average revenue trades by clients plus trades by clients in asset-based pricing relationships and other trades the glossary lists |
| **Interactive Brokers** | DARTs | "Daily average revenue trades ("DARTs") are based on customer orders" |
| **Coinbase** | Monthly Transacting User | "a consumer who actively or passively transacts in one or more products on our platform at least once during the rolling 28-day period ending on the date of measurement"; the 10-K warns the metric "may overstate the number of unique customers" |
| **Coinbase** | Trading Volume (2025 10-K) | "the total U.S. dollar equivalent value of spot matched trades transacted between a buyer and seller through our platform, plus half of the value of trades that we routed off our platform for fulfillment" |
| **Coinbase** | Total Trading Volume (from 2026) | "Sum of Crypto Spot Trading Volume, Derivatives Trading Volume, and Stablecoin Volume"; the old metric "is equivalent to our Crypto Spot Trading Volume plus Stablecoin Trading Volume" |
| **Coinbase** | Assets on Platform | The US dollar value of crypto assets and payment stablecoins "held or managed on behalf of customers in digital wallets on our platform, including our custody services but excluding assets for which the customer holds full or partial keys," at the market price on the measurement date |
| **Circle** | USDC in circulation | "the total amount of USDC minted and outstanding as of the end of the reporting period"; the average is "the simple daily average of USDC in circulation," each day's figure determined at the end of the day |
| **Circle** | Reserve return rate | "the rate of return generated on assets held in reserve," computed as reserve income over the average balance of reserves |
| **Circle** | Revenue less distribution costs | "Total revenue and reserve income less total distribution, transaction, and other costs"; RLDC margin is that over total revenue and reserve income |
| **Circle** | Meaningful wallets | "onchain digital asset wallets holding $10 or more of USDC" in the 10-K; the third quarter 2026 release says "more than $10" |

Three lessons from the table:

- **Companies define what regulators don't.** Unlike a bank's delinquency rate, none of these has a regulatory definition; each company writes its own, and changes it. Coinbase's 2026 volume redefinition and Circle's two wordings of meaningful wallets in the same year are normal.
- **Some metrics are named but not defined.** Interactive Brokers' filing defines DARTs in one line and gives no definition of customer accounts or customer equity in the sections reported. A builder copying the metric has to write the definition the filer didn't.
- **Activity windows are product decisions.** A firm that counts customers by a 45-day window and one that counts accounts by 270 days will report different churn from the same behavior. Choose the window from what the business needs to know, write it down, and don't change it to improve a quarter.

## Customers and Accounts

| Metric | Definition over the volume's tables | Notes |
| --- | --- | --- |
| **Funded customers** | Distinct `parties` with an `owner` or `joint_owner` role on any account where, in the trailing 45 days, a position was greater than zero excluding firm-granted promotions, or a customer-initiated order, execution or transfer posted | The window and the promotion exclusion are the definition; state both |
| **Active accounts** | Accounts with any customer-initiated activity (order, transfer, login if the definition says so) in the trailing N days | Schwab's N is 270; say which activities count |
| **Monthly transacting users** | Distinct consumer parties with at least one transaction, active or passive, in a rolling 28 days | "Passive" (staking rewards, recurring buys) must be listed; it inflates the count |
| **Subscribers** | Parties subscribed at period end with at least one fee paid | Free trials excluded by the payment rule |
| **New funded customers** | Funded at period end, not funded at the prior period end | Reactivations are a separate line from new customers |
| **Churned** | Funded at the prior period end, not funded at this one | Over a 45-day window, a customer who empties an account takes up to 45 days to leave the count |
| **Meaningful wallets** | On-chain addresses holding at least a threshold of a token at period end | An address is not a person; exchange omnibus addresses hold millions of people's balances |

## Assets

All asset metrics are a sum of positions times prices at a cut, and the choices are which positions, which prices and which cut.

| Metric | Definition | Notes |
| --- | --- | --- |
| **Platform assets** | Sum over accounts of `valuations.market_value` at period end, trade date basis ([Portfolio Accounting & Performance](/books/investing-and-digital-assets/portfolio-accounting#how-to-build-it)) | Trade date basis includes unsettled purchases and excludes unsettled sales; cash included or not must be stated |
| **Assets under custody** | Platform assets for one product or entity (retirement accounts, an RIA custody platform) | Robinhood reports retirement and Strategies figures as subsets |
| **Assets on platform (crypto)** | Crypto and stablecoins held or managed in the platform's custodial wallets, at market, excluding self-custody | Excluding wallets where the customer holds keys is a choice Coinbase states; a firm with a self-custody wallet product must say which side it's on |
| **Customer equity** | Net liquidation value of customer accounts (assets less margin debt) | Interactive Brokers reports it; a net figure, smaller than gross assets for margin-heavy books |
| **Cash sweep and margin book** | Swept cash balances; margin loans outstanding at period end | Rate-sensitive; see [Net Interest on Cash and Margin](/books/investing-and-digital-assets/revenue-models#net-interest-on-cash-and-margin) |

Crypto valuations need a mark policy (which venues, which time, what if the mark is stale), stored with the valuation ([Price Marks](/books/investing-and-digital-assets/chain-data-and-indexing)). A quarter-end that falls on a weekend values crypto at Sunday midnight and equities at Friday's close; the definition says so.

## Flows

Two definitions of "money in" live side by side, and confusing them is the commonest mistake in this chapter:

- **Net deposits (a business metric).** Robinhood's definition counts as inflows not only cash deposits and incoming transfers but also "dividends, interest, staking rewards, and cash or assets earned in connection with Company promotions," and nets out withdrawals, outgoing transfers, margin and lending interest and Gold subscription fees. It measures how much the platform's assets grew from everything except market movement.
- **External flows (a performance metric).** For a time-weighted return, only money the customer moved in or out counts; dividends, interest and staking rewards are part of the return, not flows ([Portfolio Accounting & Performance](/books/investing-and-digital-assets/portfolio-accounting)).

The same account can show $10,000 of net deposits and $9,600 of external flows in a quarter in which it received $400 of dividends. Both are right; they answer different questions.

**Net deposits growth rate,** two ways from the same filings. Robinhood's 10-K defines the growth rate as "aggregate Net Deposits over a specified 12 month period, divided by Total Platform Assets for the fiscal quarter that immediately precedes such 12 month period." Its quarterly release uses "Net Deposits for a specified quarter multiplied by 4," over platform assets at the end of the prior quarter. For the third quarter of 2026:

| Method | Numerator | Denominator | Rate |
| --- | --- | --- | --- |
| Quarterly, annualized | $15.7 billion × 4 = $62.8 billion | Total Platform Assets at the end of Q2 2026: $369 billion | 17.0% (reported as 17%) |
| Trailing twelve months | $71.0 billion, Q4 2025 through Q3 2026 | Total Platform Assets at the end of Q3 2025: about $333 billion, implied by the reported 19% growth to $396 billion | about 21.3% (reported as 21%) |

Both are Robinhood's own definitions, in the same release. The four-point gap is not an error: the second quarter's $21.7 billion of net deposits sits in the trailing twelve months and not in the annualized quarter. A dashboard that shows "net deposit growth" without the method beside it will be read as whichever the reader expects.

**Core net new assets** (Schwab) excludes one-time flows such as acquisitions, so it measures organic growth; Robinhood's net deposits instead state the date each acquisition entered. Either is defensible; mixing them across firms is not.

## Trading Activity and Take Rate

| Metric | Definition | Notes |
| --- | --- | --- |
| **DARTs** | Customer orders that generate revenue, per trading day, averaged over the period | Interactive Brokers says only that they are "based on customer orders"; a multi-fill order is one trade or several depending on the definition |
| **Daily average trades** | Customer trades per trading day, including those that don't generate commissions | Schwab's DATs include trades in asset-based pricing relationships and commission-free trades |
| **Notional volume** | Sum of `executions.price × quantity` in USD for the period, per asset class | One side only for a broker's customer trades; a venue may count both |
| **Options contracts traded** | Sum of contracts in customer executions | Contracts, not notional; a 0DTE contract and a LEAPS count the same |
| **Event contracts traded** | Contracts in customer executions | Robinhood reported 16.4 billion in Q3 2026 |
| **Crypto volume** | Matched spot volume on the platform, plus routed volume as defined, plus derivatives and stablecoin volume if included | State which; Coinbase's 2026 total is about nine times its spot volume because of derivatives |
| **Take rate** | Transaction revenue ÷ the volume that produced it, in basis points | Only meaningful with matching scope in numerator and denominator |

**Worked numbers: take rates from one quarter's filings.** Coinbase's third quarter 2026 10-Q reports consumer transaction revenue of $450.1 million and institutional transaction revenue of $91.65 million; its earnings deck reports consumer volume of $23.4 billion and institutional volume of $111.1 billion. My arithmetic:

- **Consumer:** $450.1 million ÷ $23.4 billion = 1.92%, 192 basis points.
- **Institutional:** $91.65 million ÷ $111.1 billion = 0.082%, about 8 basis points.

A 23x gap between two customer types on one platform is the reason a blended take rate says little: a quarter in which institutional volume grows and consumer volume falls shows a falling blended take rate with no change in pricing. Robinhood's crypto line shows the same trap: $120 million of crypto revenue over $50 billion of crypto notional is 24 basis points, but the $50 billion is $21 billion from the app and $29 billion from Bitstamp, a separate exchange, and the release doesn't split the revenue between them. The number to track internally is the take rate per product and customer segment, from `fees` and `executions` joined on the same scope.

## Revenue per Customer

**Worked numbers: ARPU two ways.** Robinhood's definition divides total revenue by the average of funded customers at the end of the period and the end of the prior period; its releases annualize the quarter. For the third quarter of 2026: total net revenues $1,424 million; funded customers 28.4 million at the end of Q2 and 28.7 million at the end of Q3.

| Method | Customers | Quarterly ARPU | Annualized |
| --- | --- | --- | --- |
| As defined: two-point average | (28.4 + 28.7) ÷ 2 = 28.55 million | $1,424M ÷ 28.55M = $49.88 | $199.5, reported as $200 |
| End of period only | 28.7 million | $1,424M ÷ 28.7M = $49.62 | $198.5 |

The gap is small here because the customer count grew 1% in the quarter; for a platform adding customers fast, the end-of-period divisor understates ARPU noticeably, and a daily or monthly average is closer to the truth than either. The definition also says "total revenue," so event contracts, net interest and subscription revenue are all in it: ARPU rose while crypto revenue fell 55% year over year, because other lines grew. ARPU is a mix metric before it is a pricing metric.

## Stablecoin Supply and Reserve Income

| Metric | Definition | Notes |
| --- | --- | --- |
| **Circulation, end of period** | Minted and outstanding tokens at the cut | Across every chain the issuer supports ([Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin#how-to-build-it) keeps `supply_by_network`) |
| **Average circulation** | Simple average of each day's end-of-day circulation | Circle's definition |
| **Reserve return rate** | Reserve income ÷ average reserve balance, annualized | Over reserves, not circulation |
| **Minted and redeemed** | Gross tokens issued and burned in the period | Circle minted and redeemed $104 billion each in Q3 2026, flat net supply with heavy gross flow |
| **RLDC and margin** | Revenue and reserve income less distribution, transaction and other costs, and that over revenue | The issuer's economics after paying distributors ([Distribution Costs](/books/investing-and-digital-assets/stablecoin-business#distribution-costs)) |
| **Velocity** | On-chain transfer volume ÷ average circulation | Not an issuer-defined metric; Circle reports on-chain volume without defining it |

**Worked numbers: checking reserve income against its definition.** Circle's third quarter 2026 release reports average USDC in circulation of $73.3 billion, a reserve return rate of 3.5% and reserve income of $658 million. Computing reserve income from circulation: $73.3 billion × 3.5% × 92 ÷ 365 = $647 million, $11 million short. Solving the other way, $658 million ÷ (3.5% × 92 ÷ 365) implies an average reserve balance of about $74.6 billion, above average circulation. Both are consistent with the definition, which divides by reserves, not circulation, and with a rounded rate (3.45% to 3.55% spans about $73.6 billion to $75.7 billion). The lesson for a builder: a rate published to one decimal can't reproduce income to the million, and a metric whose denominator differs from the obvious one has to say so in its definition. Velocity in the same quarter, by my arithmetic, was $13.9 trillion ÷ $73.3 billion, about 190 times in the quarter, a figure that mostly measures trading and DeFi churn, not payments.

## Definitions as Code, Restatements as Rows

The playbook's rules apply ([Versions, Stamps and Frozen Periods](/docs/data/data-pipelines#versions-stamps-and-frozen-periods)), with three additions for brokers and exchanges:

- **The filing's definition is the default.** When the platform is public, the metric in the dashboard is the one in the 10-K, computed the same way, so the board, investor relations and the filing agree; an internal variant gets its own key.
- **Scope is effective-dated.** An acquired platform's customers and assets enter on a date, recorded on the definition's version, so a growth rate can be shown with and without them.
- **Prices are part of the definition.** Asset metrics name their mark policy and cut, and a restated price (a corrected crypto mark, a late fund NAV) restates the metric as a new row.

## How to Build It

The chapter adds the definition and value tables the other volumes use, with the legal entity as the scope and the unit of count stated; every formula above is a query over tables earlier chapters own (`parties`, `account_parties`, `positions`, `valuations`, `external_flows`, `transfers`, `executions`, `fees`, `journal_lines`, `supply_by_network`):

```sql
CREATE TABLE metric_definitions (          -- one definition per metric, versioned
  key                 TEXT NOT NULL,         -- 'funded_customers', 'net_deposits', 'arpu', 'take_rate_consumer'
  version             INT NOT NULL,
  unit                TEXT NOT NULL CHECK (unit IN ('count', 'amount', 'ratio', 'bps', 'per_customer')),
  unit_of_count       TEXT CHECK (unit_of_count IN ('person', 'account', 'wallet', 'trade', 'contract')),
  activity_window_days INT,                  -- 45, 270, 28
  activity_rule       TEXT,                  -- what counts as activity, and what doesn't
  scope               TEXT NOT NULL,         -- 'all_entities', 'entity:<id>', 'product:retirement'
  scope_changes       JSONB NOT NULL DEFAULT '[]',   -- [{"from": "2026-06-01", "adds": "acquired platform"}]
  valuation_basis     TEXT CHECK (valuation_basis IN ('trade_date', 'settlement_date')),
  mark_policy         TEXT,                  -- prices and cut for asset metrics
  average_basis       TEXT CHECK (average_basis IN ('two_point', 'monthly', 'daily', 'end_of_period')),
  annualization       TEXT CHECK (annualization IN ('none', 'x4', 'x12', 'ttm', 'days_365')),
  filed_definition    TEXT,                  -- the filing's words, where the metric is filed
  formula_ref         TEXT NOT NULL,         -- the SQL or model in version control
  history_policy      TEXT NOT NULL CHECK (history_policy IN ('frozen', 'recomputed')),
  owner               TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL,
  PRIMARY KEY (key, version)
);

CREATE TABLE metric_values (               -- computed, frozen when reported
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  metric_key          TEXT NOT NULL,
  metric_version      INT NOT NULL,
  legal_entity_id     UUID REFERENCES legal_entities (id),  -- null: all entities
  period              DATERANGE NOT NULL,
  dimensions          JSONB NOT NULL DEFAULT '{}',  -- {"segment": "consumer"}, {"asset_class": "crypto"}
  value               NUMERIC NOT NULL,
  numerator           NUMERIC,
  denominator         NUMERIC,
  computed_at         TIMESTAMPTZ NOT NULL,
  inputs_ref          TEXT NOT NULL,         -- the snapshot it was computed from
  frozen_at           TIMESTAMPTZ,           -- reported to the board, investors or a regulator
  supersedes_id       UUID REFERENCES metric_values (id),  -- a restatement is a new row
  FOREIGN KEY (metric_key, metric_version) REFERENCES metric_definitions (key, version)
);
```

Funded customers at a date, by the 45-day rule: a person counts if any account they own had a non-promotional balance or a customer-initiated activity in the window. Promotions are journal entries of kind `promotion`, so a balance made only of them doesn't count:

```sql
WITH owners AS (
  SELECT DISTINCT ap.party_id, ap.account_id
  FROM account_parties ap
  WHERE ap.role IN ('owner', 'joint_owner')
    AND ap.valid_during @> :as_of::timestamptz
), funded_by_balance AS (
  SELECT DISTINCT o.party_id
  FROM owners o
  JOIN journal_lines jl ON jl.account_id = o.account_id AND jl.ledger_account = 'customer'
  JOIN journal_entries je ON je.id = jl.journal_entry_id
  WHERE je.posted_at <= :as_of AND je.kind <> 'promotion'
  GROUP BY o.party_id, o.account_id, jl.instrument_id
  HAVING SUM(jl.amount) > 0
     AND MAX(je.posted_at) > :as_of - INTERVAL '45 days'   -- simplification: see note
), funded_by_activity AS (
  SELECT DISTINCT o.party_id
  FROM owners o
  JOIN transfers t ON t.account_id = o.account_id
  WHERE t.status = 'completed' AND t.created_at > :as_of - INTERVAL '45 days'
  UNION
  SELECT DISTINCT o.party_id
  FROM owners o
  JOIN orders ord ON ord.account_id = o.account_id
  JOIN executions e ON e.order_id = ord.id
  WHERE e.executed_at > :as_of - INTERVAL '45 days'
)
SELECT COUNT(*) AS funded_customers
FROM (SELECT party_id FROM funded_by_balance UNION SELECT party_id FROM funded_by_activity) f;
```

The balance test in the sketch reads "a positive balance now, built from lines that moved in the window"; the definition's "had an account balance that was greater than zero" at any time in 45 days needs daily balance snapshots, which is why production versions read `position_snapshots` from [Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions#how-to-build-it) rather than the lines.

Net deposits for a quarter, as the business metric, against external flows, as the performance metric, from the same accounts:

```sql
SELECT
  SUM(f.amount)                                              AS external_flows,
  SUM(f.amount) + COALESCE((
    SELECT SUM(jl.amount * pm.price)    -- customer lines: income positive, charges negative
    FROM journal_lines jl
    JOIN journal_entries je ON je.id = jl.journal_entry_id
    JOIN LATERAL (SELECT price FROM price_marks p
                  WHERE p.instrument_id = jl.instrument_id AND p.as_of <= je.posted_at
                  ORDER BY p.as_of DESC LIMIT 1) pm ON TRUE
    WHERE jl.ledger_account = 'customer'
      AND je.kind IN ('dividend', 'interest', 'staking_reward', 'promotion',
                      'margin_interest', 'subscription_fee')
      AND je.posted_at >= :q_start AND je.posted_at < :q_end
  ), 0)                                                      AS net_deposits
FROM external_flows f
WHERE f.kind IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out')
  AND f.flow_at >= :q_start AND f.flow_at < :q_end;
```

The sketch assumes a USD mark of 1 in `price_marks` for cash and stablecoin instruments, and amounts in minor units of USD throughout. Because the customer line of a dividend is a credit and the customer line of a margin interest charge is a debit, one sum over those entry kinds adds the income and nets the charges, as the filed definition does.

ARPU for a quarter, as defined, from frozen values:

```sql
SELECT r.value / ((c_prev.value + c_end.value) / 2) * 4 AS arpu_annualized
FROM metric_values r
JOIN metric_values c_end  ON c_end.metric_key = 'funded_customers'
                         AND upper(c_end.period) = upper(r.period)
JOIN metric_values c_prev ON c_prev.metric_key = 'funded_customers'
                         AND upper(c_prev.period) = lower(r.period)
WHERE r.metric_key = 'total_revenue' AND r.period = :quarter
  AND r.frozen_at IS NOT NULL AND c_end.frozen_at IS NOT NULL AND c_prev.frozen_at IS NOT NULL;
```

Design notes:

- **Compute from frozen inputs.** ARPU reads frozen revenue and frozen customer counts, so a later restatement of either produces a new ARPU row, not a changed one.
- **Keep the filed words.** `filed_definition` holds the filing's text, so a reviewer can compare the query with the definition the company published.
- **Count people from parties, not logins.** Funded customers join `account_parties`; a person with three accounts is one row, and joint owners are each counted, as the filed definition says.
- **Separate peers from self.** Outside firms' reported numbers stay in `participant_metrics` ([The Investing & Crypto Landscape](/books/investing-and-digital-assets/investing-landscape#how-to-build-it)); this table holds the platform's own.
- **Events:** `metric_value.frozen` notifies investor relations and finance; a restatement of a frozen value notifies the definition's owner and, for filed metrics, the disclosure committee.

## Auditing

What auditors, the SEC's reviewers and investors ask of a public broker's or exchange's metrics:

- **The definition behind every reported number,** with its version, the filing's words and the date it changed.
- **The inputs,** as snapshots: the customer counts, valuations, flows and executions each value was computed from ([Reconcile to the Source](/docs/data/data-pipelines#reconcile-to-the-source)).
- **Reconciliation to the financial statements.** Revenue in ARPU ties to the income statement; platform assets tie to the custody records and the stock record; net deposits tie to the transfer and journal records.
- **Every restatement,** with what changed and why.
- **Scope changes,** each acquisition or program with the date it entered each metric.

## What This Means for the System You Build

- **Write every metric's unit of count, window, activity rule, average and annualization,** and store them with the definition.
- **Use the filing's definition** for any metric a public company reports, and give internal variants their own keys.
- **Keep net deposits and external flows apart:** one is growth, the other is return.
- **Compute take rates per segment,** because a blended rate moves with mix, not price.
- **Check derived numbers against their definitions,** as the reserve income check does; a mismatch is either a definition you misread or a bug.
- **Freeze reported values and restate as rows,** with scope changes effective-dated.

## References

**Filings**

- [Robinhood Markets: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000023/hood-20251231.htm), definitions of Funded Customers, Total Platform Assets, Net Deposits and its 12-month growth rate, ARPU, Gold Subscribers, notional volume and options contracts traded
- [Robinhood Markets: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000164/q32026robinhoodexhibit991.htm), Q3 2026 revenues, funded customers, platform assets, net deposits and both growth rates, ARPU, trading volumes, the Net Deposits definition and its scope changes, joint account counting
- [Robinhood Markets: Second quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000113/q22026robinhoodexhibit991.htm), funded customers, Total Platform Assets and Net Deposits at the end of Q2 2026
- [Charles Schwab: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/316709/000031670926000009/schw-20251231.htm), definitions of active brokerage accounts, client assets, core net new assets and daily average trades
- [Interactive Brokers: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1381197/000138119726000062/ibkr-20251231.htm), the DARTs definition
- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), definitions of Monthly Transacting Users, Trading Volume and Assets on Platform, and the MTU overstatement risk
- [Coinbase Global: Q3 2026 earnings deck (Form 8-K exhibit)](https://www.sec.gov/Archives/edgar/data/0001679788/000167978826000121/q326earningsdeck_vsec.htm), consumer and institutional volume, the 2026 Total Trading Volume definition and its relation to the old metric
- [Coinbase Global: Form 10-Q for the quarter ended September 30, 2026](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000122/coin-20260930.htm), consumer and institutional transaction revenue
- [Circle Internet Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000062/crcl-20251231.htm), definitions of USDC in circulation, average circulation, reserve return rate, RLDC and meaningful wallets
- [Circle Internet Group: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000309/finalq3epr-110326.htm), reserve income, reserve return rate, average and end-of-period circulation, minted and redeemed, on-chain volume, RLDC and meaningful wallets
