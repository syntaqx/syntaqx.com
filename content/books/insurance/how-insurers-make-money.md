+++
title = "How Insurers Make Money"
nav_title = "How Insurers Profit"
description = "Written, earned and unearned premium worked through; loss, LAE, expense and combined ratios; investment income and float; surplus, leverage and the cycle."
category = "Insurance Industry"
order = 2703
part = "The Business"
tags = ["insurance", "property-and-casualty", "accounting", "ratios", "business-models"]
+++

An insurer sells a product whose cost it learns years later, and it is paid before it delivers. Those two facts produce the whole income statement. Premium arrives at the start of the term and is earned only as the days pass, so a growing insurer always has more written than earned and a liability for the difference. Losses are estimated the day they're reported and re-estimated until the last payment, so this year's profit includes corrections to every earlier year. The money in between, the unearned premium and the loss reserves, is invested, and over the last decade the US property and casualty industry earned far more from investing it than from underwriting.

This chapter works through the mechanics with numbers: written, earned and unearned premium on a policy and a book; the loss, LAE, expense and combined ratios on statutory and GAAP bases; underwriting profit against investment income and float; statutory surplus and premium-to-surplus leverage; the underwriting cycle; and a state law that caps auto profit. Figures come from NAIC's 2016-2025 industry series and the 2025 filings of Progressive, Travelers and Allstate. It extends `premium_entries`, `reserves` and `claim_payments` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `financial_periods` and `ratio_snapshots`; the general accounting (recognition schedules, closed periods, syncing to a GL) is in [Accounting](/docs/money/accounting).

## How the Platforms Do It

How three large carriers and the industry reported 2025:

| | Progressive | Travelers | Allstate (Property-Liability) | US P&C industry (NAIC, statutory) |
| --- | --- | --- | --- | --- |
| Net premiums written | $83,174M | $44,387M | $59,546M | $976,779M |
| Net premiums earned | $81,661M | Not in release | $57,682M | $958,726M |
| Combined ratio | 87.4 (GAAP, companywide) | 89.9% | 85.2 | 92.9% |
| Underlying or ex-cat measure | Net catastrophe loss ratio 1.8% | Underlying 83.9%; catastrophes 8.4 points; favorable prior-year development 2.4 points | Underlying 79.4; catastrophe losses $4,959M | Net loss and LAE ratio 66.5%, expense ratio 25.8% |
| Net investment income | $3,549M ($3,583M investment income) | $3,959M pre-tax | $3,449M | $88,898M |
| Net income | $11,308M | $6,288M | $10,165M to common shareholders (whole company) | $150,551M |

The columns don't line up, and that is the first lesson. Progressive reports a GAAP combined ratio by business (agency auto 85.4, direct auto 90.1, property 75.1, commercial lines 87.0). Travelers and Allstate lead with an "underlying" ratio that strips out catastrophes and prior-year reserve development, each on its own definition. The NAIC's statutory ratio divides expenses by written premium, not earned. A combined ratio is only comparable after reading which losses, which expenses and which denominator it uses ([The Ratios That Run the Business](#the-ratios-that-run-the-business)).

## Written, Earned and Unearned

**Written premium** is recorded when a policy transaction is processed: the full term premium of a new policy or renewal, the pro rata difference of an endorsement, the negative pro rata return of a cancellation. **Earned premium** is the part of written premium for coverage already provided, by default pro rata by day across the term. **Unearned premium** is the rest, held as the unearned premium reserve, a liability, because a cancellation tomorrow would have to return most of it. [Written, Earned and Unearned](/books/insurance/insurance-business#written-earned-and-unearned) in the first chapter follows one auto policy through an endorsement and a cancellation; here are the two views that drive reporting.

**One policy across a year-end.** A homeowners policy is written for $2,400.00, effective 12:01 a.m. April 1, 2026, for a 365-day term (my example). At the December 31, 2026 close, 275 days have passed (April 1 through December 31), so:

| As of | Written | Earned | Unearned |
| --- | --- | --- | --- |
| April 1, 2026 | $2,400.00 | $0.00 | $2,400.00 |
| June 30, 2026 (91 days) | $2,400.00 | 2,400 × 91 / 365 = $598.36 | $1,801.64 |
| December 31, 2026 (275 days) | $2,400.00 | 2,400 × 275 / 365 = $1,808.22 | $591.78 |
| March 31, 2027 (365 days) | $2,400.00 | $2,400.00 | $0.00 |

The 2026 calendar year carries $2,400.00 of written premium and $1,808.22 of earned premium from this policy, and 2027 earns the other $591.78 without writing anything. A fee the state lets the insurer keep in full (a policy fee, an installment fee) can earn at once; its `premium_entries` row has an earning window of one instant.

**A growing book.** Now a book that writes one annual $1,200.00 policy on the first of each month of 2026 (my example, earned by month for round numbers). Written premium for the year is 12 × 1,200 = $14,400. The January policy earns all twelve months in 2026 ($1,200), February's earns eleven ($1,100), and so on to December's one month ($100): 100 × (12 + 11 + ... + 1) = 100 × 78 = **$7,800 earned**, leaving **$6,600 unearned** at year end. The book wrote nearly twice what it earned. That gap is why a fast-growing insurer reports thin earned revenue, heavy acquisition costs paid on written premium, and a large unearned premium reserve: Progressive wrote $83,174 million and earned $81,661 million in 2025 with $25,219 million unearned at year end, and the industry wrote $976.8 billion and earned $958.7 billion.

The earning rule is code that runs over every premium entry, as of a date. Pro rata by time, in integer minor units, rounding once at the end:

```go tab="Go"
// Earned returns the part of amount earned by asOf, pro rata by time across
// [from, to). Amounts are minor units; the result rounds half away from zero.
func Earned(amount int64, from, to, asOf time.Time) int64 {
	switch {
	case !asOf.After(from):
		return 0
	case !asOf.Before(to):
		return amount
	}
	num := new(big.Int).Mul(big.NewInt(amount), big.NewInt(asOf.Sub(from).Nanoseconds()))
	den := big.NewInt(to.Sub(from).Nanoseconds())
	q, r := new(big.Int).QuoRem(num, den, new(big.Int))
	if new(big.Int).Abs(new(big.Int).Mul(r, big.NewInt(2))).Cmp(den) >= 0 {
		q.Add(q, big.NewInt(int64(num.Sign())))
	}
	return q.Int64()
}
```

```rust tab="Rust"
use chrono::{DateTime, Utc};

/// Part of `amount` (minor units) earned by `as_of`, pro rata by time across
/// [from, to), rounding half away from zero.
pub fn earned(amount: i64, from: DateTime<Utc>, to: DateTime<Utc>, as_of: DateTime<Utc>) -> i64 {
    if as_of <= from {
        return 0;
    }
    if as_of >= to {
        return amount;
    }
    let elapsed = (as_of - from).num_seconds() as i128;
    let term = (to - from).num_seconds() as i128;
    let num = amount as i128 * elapsed;
    let (q, r) = (num / term, num % term);
    let q = if (r.abs() * 2) >= term { q + num.signum() } else { q };
    q as i64
}
```

Seconds are fine for a term measured in days, because terms start and end at the same clock time; the policy's own rule (12:01 a.m. local at the risk) decides the instants, and Quote, Bind & Issue owns it. Two cautions. Earned premium is never stored as a running balance: it is recomputed from entries for any as-of date, so a backdated endorsement or a reversal changes history correctly ([Recognition Schedules](/docs/money/accounting#recognition-schedules)). And the earning window belongs to the entry, not the policy, so an endorsement's premium earns only over the days it covers.

## The Ratios That Run the Business

Four ratios measure underwriting, and NAIC defines them in its industry report:

- **Loss ratio**: losses incurred over earned premium. Incurred is paid losses plus the change in loss reserves, including reserves for claims incurred but not reported.
- **LAE ratio**: loss adjustment expense incurred over earned premium. NAIC's industry table folds it in, reporting a net loss ratio "including LAE"; its market share tables show the DCC part separately ([Where the Premium Dollar Goes](/books/insurance/insurance-business#where-the-premium-dollar-goes)).
- **Expense ratio**: underwriting expenses (commissions, premium taxes, acquisition, general expenses) over **written** premium on the statutory basis, because those costs are mostly incurred when the policy is written.
- **Combined ratio**: the sum. Below 100% is an underwriting profit.

NAIC's 2025 figures, worked: net losses incurred $551,755 million plus LAE incurred $86,003 million is $637,758 million, over net premiums earned of $958,726 million, a **66.5%** net loss ratio including LAE. Underwriting expenses of $252,164 million over net premiums written of $976,779 million is **25.8%**. The two sum to 92.3 points; the published combined ratio is **92.9%**. The $5.7 billion of policyholder dividends NAIC reports for 2025 is 0.6 points of earned premium, which closes the gap, so I treat the published statutory figure as including a dividend component.

GAAP filers compute differently. Progressive's ratios divide everything by earned premium: from its 2025 income statement, losses and LAE of $53,959 million over earned premium of $81,661 million is 66.1%, and policy acquisition plus other underwriting expenses of $17,425 million over earned premium is 21.3%, together 87.4, matching its reported companywide GAAP combined ratio; the $1,224 million policyholder credit expense sits on its own line outside those two (my arithmetic; [An Excess Profits Law, Worked](#an-excess-profits-law-worked) explains the credit). Travelers' release decomposes its 89.9% combined ratio: an underlying 83.9%, plus 8.4 points of catastrophe losses, less 2.4 points of favorable prior-year reserve development (83.9 + 8.4 - 2.4 = 89.9). Allstate's Property-Liability recorded ratio was 85.2 against an underlying 79.4, with $4,959 million of catastrophe losses.

Two adjustments every report needs explained:

- **Catastrophes.** Underlying ratios remove them because they swing by billions a year; but cat losses are a cost of writing property, and a carrier that always reports ex-cat is describing a business it doesn't run.
- **Prior-year development.** Losses incurred this year include re-estimates of every earlier accident year. NAIC reports one-year reserve development as a share of prior-year surplus: (1.8%) in 2025, favorable, a $20.0 billion one-year redundancy. Accident-year ratios (losses for accidents in the year, wherever they're booked) and calendar-year ratios (everything booked in the year) answer different questions, and Loss Reserving & Development builds both from the reserve history.

### Ten Years of Results

NAIC's 2016-2025 series for the US P&C industry, statutory, in millions:

| Year | Net premiums earned | Underwriting gain (loss) | Net loss ratio incl. LAE | Expense ratio | Combined ratio | Net investment income earned | Net income |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2016 | 533,236 | (1,700) | 72.2% | 27.6% | 100.5% | 45,539 | 42,860 |
| 2017 | 549,958 | (22,459) | 76.2% | 27.0% | 103.9% | 48,978 | 38,717 |
| 2018 | 603,188 | 2,907 | 71.4% | 27.1% | 99.1% | 53,287 | 57,565 |
| 2019 | 630,772 | 8,374 | 71.0% | 26.9% | 98.7% | 55,132 | 62,233 |
| 2020 | 646,010 | 12,103 | 70.2% | 27.3% | 98.7% | 51,595 | 59,198 |
| 2021 | 693,763 | (112) | 72.5% | 26.3% | 99.6% | 52,935 | 60,452 |
| 2022 | 752,673 | (24,745) | 76.4% | 25.7% | 102.5% | 69,466 | 38,745 |
| 2023 | 826,707 | (19,678) | 76.3% | 24.9% | 101.7% | 70,312 | 87,292 |
| 2024 | 908,913 | 25,269 | 71.2% | 25.3% | 96.9% | 85,295 | 167,217 |
| 2025 | 958,726 | 68,742 | 66.5% | 25.8% | 92.9% | 88,898 | 150,551 |

Summed over the decade (my arithmetic on the table), the industry's underwriting gain was **$48.7 billion** and its net investment income earned **$621.4 billion**, nearly thirteen times as much. Five of the ten years lost money on underwriting. 2025's 92.9% was, in NAIC's words, the industry's "strongest underwriting performance in over two decades," on lower catastrophe losses and favorable reserve development.

## Float and Investment Income

The **float** is the money an insurer holds between collecting it and paying it out: unearned premium and loss and LAE reserves. The industry's loss and LAE reserves were $1.03 trillion at the end of 2025 ($869.2 billion unpaid losses, $162.9 billion unpaid LAE), per NAIC. Progressive's float was $25.2 billion of unearned premium and $43.3 billion of loss and LAE reserves against a $97.4 billion investment portfolio, earning a 4.1% fixed-income book yield in 2025.

The float's value depends on two things: how long the money stays and what it costs. Personal auto physical damage pays within weeks; workers' compensation and other liability pay over many years, so a casualty writer's reserves are several times its annual premium and its investment income matters more. The cost of float is the underwriting result: a 97% combined ratio means the float was paid for, a 103% one means the insurer paid 3% of premium to hold it. NAIC reports the industry's investment yield at 3.56% for 2025, with bonds 58.3% of investment income, and notes that half of invested assets were bonds, nearly all investment grade, because claims must be paid in cash on the claimant's schedule, not the market's.

For the system, the float is not an investment-team concept. It is the sum of the unearned premium the policy system computes and the reserves the claims system holds, by line and by duration, and the investment portfolio is matched to the payout pattern those records imply. A reserve recorded late, or a premium earned on the wrong window, misstates the float.

## Surplus and Leverage

**Policyholders' surplus** is statutory capital: admitted assets minus liabilities on the statutory balance sheet, which leaves out assets the regulator won't count toward paying claims (Statutory Accounting & the Annual Statement covers admitted and nonadmitted assets). The industry's surplus reached $1.27 trillion at the end of 2025, up 11.9%.

Surplus limits how much an insurer can write. The classic measure is **premium-to-surplus**, net premiums written over surplus. NAIC's "net writings leverage" for the industry was 77.3% in 2025 (976.8 / 1,266.1, about 0.77 to 1), near or below 80% for over fifteen years. Individual companies run far higher: Progressive reported $83.2 billion of net premiums written against $28.4 billion of statutory surplus, 2.9 to 1, described 3 to 1 as the general regulatory benchmark for P&C insurers, and noted that two states allow up to 3.5 to 1 for personal vehicle insurers while property business runs lower. NAIC also reports **reserve leverage**, loss and LAE reserves over surplus, at 81.5% for 2025.

The arithmetic of growth follows. An insurer at 3 to 1 that wants to grow premium 20% needs 20% more surplus, from retained earnings, new capital, or reinsurance that cedes premium (and the surplus strain with it). A company that grows faster than its earnings uses quota share reinsurance, a fronting carrier or a capital provider instead, which is why [MGAs, Programs & Fronting](/books/insurance/mgas-programs-and-fronting) and Reinsurance Structures are part of the same economics. Regulators watch the ratios through IRIS and risk-based capital (Solvency & Capital).

## The Underwriting Cycle

Underwriting results move in cycles, and NAIC's 2025 report describes a market splitting in two. In a **hard market** prices rise, capacity tightens and underwriting tightens after losses deplete surplus or reinsurers pull back; in a **soft market** competition and surplus push prices down until results deteriorate. NAIC quotes the Council of Insurance Agents & Brokers survey: commercial premiums rose an average of 1.9% in the fourth quarter of 2025, down from 5.4% a year earlier; commercial property premiums fell 0.7% in the fourth quarter; commercial auto rose 6.6%, its fifteenth straight year of increases. Property is softening on lower losses; casualty stays firm on social inflation and large verdicts.

Personal lines run the same cycle through rate filings rather than negotiation, so they lag. After the 2022-2023 losses (combined ratios of 102.5% and 101.7%), NAIC says insurers took "aggressive rate increases" against inflation and catastrophe losses, and direct premiums grew roughly 8-10% a year for four years before slowing to 4.6% in 2025. A carrier's pricing team sees the cycle as filings: how much rate it can get approved, in which states, how fast (Filing Rates & Forms).

## An Excess Profits Law, Worked

Some states cap underwriting profit directly. Florida's excessive profits law for motor vehicle insurance (Fla. Stat. 627.066, 2026) tests each insurer group over the three most recent calendar-accident years combined: excess profit exists when the combined underwriting gain exceeds the anticipated underwriting profit plus 5% of earned premiums. The anticipated profit is the profit and contingencies factor from each rate filing applied to the premium earned under that filing; underwriting gain is calendar-year earned premium less accident-year incurred losses and LAE, administrative and selling expenses and policyholder dividends. Groups file the data before July 1 each year, and any excess is returned as a cash refund or a credit toward future premium, pro rata on earned premium to voluntary policyholders of record on December 31.

Worked, with numbers of my own: a group earned $10.0 billion of Florida auto premium over the three years, filed at a 5% profit and contingencies factor. Anticipated profit is $500 million; the threshold adds 5% of earned premium, another $500 million, for $1.0 billion. If the combined underwriting gain was $1.6 billion, the excess is $600 million, returned to policyholders.

Progressive's filings show the rule in practice. In October 2025 it accrued a $950 million policyholder credit expense, saying it was probable its Florida personal auto profit for 2023-2025 would exceed the statutory limit, with credits to be provided in early 2026 to policyholders active at December 31, 2025; it had about 2.7 million active Florida personal auto policyholders at September 30. The full-year 2025 expense was $1,224 million. A system has to produce the three-year calendar-accident-year computation by state, keep the profit factor of every filing that was in force, and issue a credit per policyholder from the policy records as of a date.

## How to Build It

Ratios are queries over the core records, frozen per closed period and basis:

```sql
CREATE TABLE financial_periods (           -- the accounting calendar, closed once
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  period_start       DATE NOT NULL,
  period_end         DATE NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('open', 'closing', 'closed')),
  closed_at          TIMESTAMPTZ,
  UNIQUE (insurer_id, period_start, period_end)
);

CREATE TABLE expense_entries (             -- underwriting expenses from the GL feed
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  accounting_date    DATE NOT NULL,
  category           TEXT NOT NULL CHECK (category IN ('commission', 'premium_tax',
                       'acquisition_other', 'general', 'policyholder_dividend')),
  statement_line     TEXT,                  -- allocated line of business
  state              TEXT,
  amount             BIGINT NOT NULL        -- minor units
);

CREATE TABLE ratio_snapshots (             -- every published ratio, with its parts
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  period_id          UUID NOT NULL REFERENCES financial_periods (id),
  basis              TEXT NOT NULL CHECK (basis IN ('statutory', 'gaap')),
  scope              TEXT NOT NULL,         -- 'company', 'line:04', 'state:US-FL', ...
  premiums_written   BIGINT NOT NULL,
  premiums_earned    BIGINT NOT NULL,
  losses_incurred    BIGINT NOT NULL,       -- paid plus change in loss reserves
  dcc_incurred       BIGINT NOT NULL,
  ao_incurred        BIGINT NOT NULL,
  uw_expenses        BIGINT NOT NULL,
  dividends          BIGINT NOT NULL,
  cat_losses         BIGINT NOT NULL,       -- by cat_code on the claims
  prior_year_dev     BIGINT NOT NULL,       -- incurred on accident years before the period
  computed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (period_id, basis, scope)
);

-- Combined ratio on either basis, from the stored parts.
SELECT scope,
       basis,
       (losses_incurred + dcc_incurred + ao_incurred)::NUMERIC / premiums_earned AS loss_lae_ratio,
       uw_expenses::NUMERIC /
         CASE basis WHEN 'statutory' THEN premiums_written ELSE premiums_earned END AS expense_ratio,
       dividends::NUMERIC / premiums_earned AS dividend_ratio,
       (losses_incurred + dcc_incurred + ao_incurred - cat_losses - prior_year_dev)::NUMERIC
         / premiums_earned AS underlying_loss_ratio
FROM ratio_snapshots
WHERE period_id = :period;
```

Design notes:

- **Incurred comes from history.** Losses incurred for a period are claim payments in the period plus the change in open reserves between its start and end, by cost type, from the `reserves` rows; prior-year development is the same computation restricted to claims whose `loss_at` falls before the period.
- **Basis is a column, not a convention.** The same period has a statutory and a GAAP snapshot, and the expense denominator differs; storing both prevents a dashboard from mixing them.
- **Closed periods stay closed.** A late reserve change or backdated endorsement after close is booked in the next open period, and the earlier snapshot is never recomputed in place ([Closed Periods Stay Closed](/docs/money/accounting#closed-periods-stay-closed)).
- **Catastrophe losses are tagged at the claim.** The underlying ratio is only as good as the `cat_code` on claims (Catastrophe Events), and the prior-year split is only as good as the loss date.

## Auditing

- **Earned premium can be rebuilt.** For any period, earned and unearned recomputed from `premium_entries` with the earning rule match the reported figures and the unearned premium reserve on the balance sheet.
- **Every ratio shows its parts.** Numerators, denominators, basis and the cat and development adjustments stored per snapshot, so an underlying ratio in an investor deck can be traced to claims.
- **Profit caps can be computed.** For states with excess profit laws, the earned premium by filing, the filing's profit factor and the accident-year results, retained for the full review period and the refund that followed.

## What This Means for the System You Build

- **Derive written, earned and unearned from entries** with an as-of date; never keep them as balances.
- **Keep the earning window on each entry,** with fully earned fees as zero-length windows.
- **Store every ratio's numerator and denominator and its basis,** statutory or GAAP, and the catastrophe and prior-year adjustments separately.
- **Tag catastrophe claims and keep loss dates exact,** because underlying ratios and accident-year development depend on them.
- **Compute surplus leverage for capacity planning:** projected written premium against surplus by legal entity, before a growth plan reaches the regulator.
- **Keep each filing's profit factor with the product version,** because some states test profit against it years later.

## References

**Law and regulation**

- [Fla. Stat. 627.066](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.066.html), excessive profits for motor vehicle insurance: the three-year test, anticipated profit plus 5% of earned premium, the July 1 filing, refunds or credits pro rata to policyholders of record

**NAIC**

- [NAIC: 2025 Annual Property and Casualty and Title Insurance Industries Analysis Report (PDF)](https://content.naic.org/sites/default/files/2025-annual-property-and-casualty-and-title-insurance-industries-analysis-report.pdf), the 2016-2025 results table, ratio definitions, policyholder dividends, loss and LAE reserves, reserve development, investment yield and mix, net writings and reserve leverage, surplus, the CIAB pricing figures and the market conditions narrative

**Filings**

- [Progressive: December 2025 and full-year results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/80661/000008066126000071/pgr202512ex991earningsrele.htm), net premiums written and earned, GAAP combined ratios by business, net catastrophe loss ratio, investment income, book yield and net income
- [Progressive: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/80661/000008066126000086/pgr-20251231.htm) and [Exhibit 13](https://www.sec.gov/Archives/edgar/data/80661/000008066126000086/pgr-20251231_d2.htm), the income statement, policyholder credit expense, unearned premiums, loss and LAE reserves, investment portfolio, statutory surplus and the 3 to 1 and 3.5 to 1 benchmarks
- [Progressive: September 2025 results (Form 8-K, Exhibit 99)](https://www.sec.gov/Archives/edgar/data/80661/000008066125000126/pgr20250930ex99earningsrel.htm), the $950 million Florida policyholder credit accrual, the statutory profit limit and about 2.7 million active Florida personal auto policyholders
- [Travelers: Fourth quarter and full year 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/86312/000008631226000008/a991pressrelease123125.htm), combined and underlying combined ratios, catastrophe losses, prior-year development, net written premiums, investment income and net income
- [Allstate: Fourth quarter and full year 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/899051/000089905126000013/allcorp123125earningsrelea.htm), Property-Liability premiums, recorded and underlying combined ratios, catastrophe losses, net investment income and net income
