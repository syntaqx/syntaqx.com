+++
title = "Prime Brokerage, OTC & Crypto Lending"
nav_title = "Prime, OTC & Lending"
description = "Crypto prime brokerage: OTC desks, credit lines, an over-collateralized loan through a margin call and liquidation, the Genesis lesson and tri-party collateral."
category = "Investing & Digital Assets Industry"
order = 2555
part = "Institutional Crypto"
tags = ["crypto", "prime-brokerage", "otc", "lending", "collateral", "margin", "genesis"]
+++

A prime broker gives an institution one relationship for custody, execution across venues, and credit: it holds the client's assets, routes its orders, lends it cash or coins against collateral, and lets it trade before its assets have moved. In securities this is an old business with Regulation T, FINRA 4210, Rule 15c3-3 and decades of default law behind it. In crypto it was rebuilt from scratch in the last cycle, much of it by lenders that took customer coins, lent them to trading firms on thin or no collateral, and failed together when Three Arrows Capital and Alameda Research did. What survived and what's been built since is narrower and more collateralized: prime brokers that are custodians first, loans over-collateralized and marked continuously, collateral kept at a third party rather than with the lender, and lending books disclosed in public filings.

For an engineer the product is a credit system on 24/7 collateral. Every loan has a loan-to-value ratio that moves with the price of the collateral every second, thresholds at which the platform asks for more collateral and then sells it, a clock for each step, and a question the 2022 failures made unavoidable: where is the collateral, and can the lender reuse it? This chapter covers what a crypto prime broker does, OTC desks, institutional credit and margin lending with a worked loan through a margin call and a liquidation, the Genesis and Three Arrows lessons, tri-party arrangements, and lending after 2022. It extends `accounts`, `positions` and [Margin & Short Selling](/books/investing-and-digital-assets/margin-and-short-selling#margin-calls-and-liquidations)'s `margin_calls` with `prime_credit_limits`, `collateral_pledges` and `crypto_loans`. Retail yield programs are [Crypto Yield: BlockFi, Celsius and Gemini Earn](/books/investing-and-digital-assets/cash-and-sweeps#crypto-yield-blockfi-celsius-and-gemini-earn) in Cash, Sweeps & Yield; protocol lending is [DeFi Lending & Liquidations](/books/investing-and-digital-assets/defi-lending); venue spot margin is [Crypto Margin and Borrowing](/books/investing-and-digital-assets/margin-and-short-selling#crypto-margin-and-borrowing); leveraged derivatives are [Perpetuals & Crypto Derivatives](/books/investing-and-digital-assets/perpetuals-and-crypto-derivatives).

## How the Platforms Do It

What public filings show about crypto lending and prime books, as of the latest filing for each:

| Firm | What it lends | Collateral terms disclosed | Size disclosed | Collateral reuse |
| --- | --- | --- | --- | --- |
| **BitGo** (Prime) | Clients "trade, borrow and lend digital assets" | Lending is typically "over-collateralized"; collateral in segregated accounts | Lending fees about $18.1 million in 2025, up from $5.8 million in 2024 | "We do not rehypothecate or otherwise use client collateral for proprietary purposes" |
| **Coinbase** | Fiat, stablecoin and crypto loans to institutional and retail customers | Collateral requirements "ranged from 100% to 250% of the fair value of the loan" | Loan receivables $1,976 million (fiat and stablecoin $1,959 million, crypto $18 million); customer collateral not on the balance sheet $3,285 million ($2,804 million crypto) at September 30, 2026 | Not stated in the 10-Q excerpt; crypto borrowings of $407 million on the liability side |
| **Galaxy Digital** | Fiat and digital asset loans | Not in the balance sheet excerpt | Loans receivable $947 million and digital asset loans receivable $782 million (current); collateral payable $1,933 million; digital assets borrowed $1,487 million at June 30, 2026 | Collateral payable is the obligation to return what it holds |
| **Coinbase Credit** (to the iShares Bitcoin Trust) | Trade Credits in cash or bitcoin to settle trades before assets move | Lien on the Trust's Trading and Vault Balances; Trading Balance exhausted first | Not disclosed | Not applicable; interest-free, due 6:00 pm ET the next business day |
| **Genesis** (failed, 2023) | Customer coins from Gemini Earn lent to trading firms | "Undersecured," per the New York Attorney General | Nearly 60% of third-party loans to Alameda | Lent out by design |

The survivors converge on three rules the failures taught: lend against more collateral than the loan, keep the collateral somewhere the borrower can see it and the lender can't spend it, and disclose the book. The figures above are lenders' own balance sheets, and the market's overall size is harder to source than it was in 2021. <!-- source-gap: crypto-lending-market-size | missing | the size of the centralized crypto lending market by quarter since 2021 and the largest lenders' shares | closes with: a dated industry dataset or research report that aggregates lenders' disclosures | checked: 2026-11-05 -->

## What a Crypto Prime Broker Does

A crypto prime broker bundles four things, and each one sits in a different legal entity at the larger firms:

- **Custody** in a trust company or trust bank ([Qualified Custody](/books/investing-and-digital-assets/qualified-custody)), so the client's assets are held as custody, not lent to the broker.
- **Execution** across exchanges, OTC liquidity providers and the firm's own desk, through smart order routing and RFQ. BitGo's 10-K describes agency execution only, no principal trading; others run principal desks.
- **Settlement credit**, so a client can trade on a venue before its assets arrive there. The iShares Bitcoin Trust's Trade Credits from Coinbase Credit are the public example: interest-free, due "by 6:00 p.m. ET on the business day following," secured by a lien on the trust's balances, so the trust can settle a sale before its bitcoin leaves the vault.
- **Financing**: margin loans against a portfolio, fixed-term loans of cash or coins, and borrowing to short.

The entity split matters when one fails. A client whose assets are in the custodian and whose loan is with the lending affiliate has a debt to the lender and custody assets at the trust company; the lender's claim on the collateral is only what the pledge agreement gives it. Coinbase's filings put custody in Coinbase Custody Trust Company and carry loans as Coinbase's receivables, with the customer collateral securing them reported as "customer collateral not recognized," which is what an arrangement looks like when the collateral never became the lender's property.

## OTC Desks

Block trades too large for an order book go through OTC desks: the client asks for a two-way price or a price on one side for a size, the desk quotes, the client accepts within seconds, and settlement happens on the prime broker's books or on chain. [RFQ and OTC Desks](/books/investing-and-digital-assets/crypto-trading-products#rfq-and-otc-desks) in Crypto Trading Products covers the quote mechanics. What changes inside a prime relationship is settlement: the desk and the client settle by moving balances on the custodian's ledger, the same way off-exchange settlement does ([Off-Exchange Settlement](/books/investing-and-digital-assets/custody-platforms#off-exchange-settlement)), so the client never sends coins to the desk and waits for cash back. Delivery-versus-payment on the same ledger is the custodian's answer to the counterparty risk of sending first.

## Institutional Credit and Margin Lending

A crypto loan is simple to describe and hard to run: the borrower pledges collateral, receives cash, stablecoins or coins, pays interest, and must keep the loan-to-value ratio below a threshold as the collateral's price moves. Three thresholds define the loan:

- **Initial LTV**, the most the lender will lend against the collateral on day one.
- **Margin call LTV**, at which the borrower must add collateral or repay within a cure period.
- **Liquidation LTV**, at which the lender sells collateral without waiting.

Coinbase's 10-Q shows a 100% to 250% collateral range, which is an initial LTV of 40% (250% collateral) to 100%. The thresholds in the example below are mine.

### Worked numbers: a loan through a margin call and a liquidation

A fund borrows 1,000,000 USDC against 20 BTC with BTC at $90,000. Terms, assumed: initial LTV at most 60%, margin call at 70% with 24 hours to cure back to 60%, liquidation at 80% with a 2% liquidation fee, interest at 9% a year accrued daily.

```text
day 0     collateral 20 BTC × 90,000 = 1,800,000      loan 1,000,000.00     LTV 55.56%
          margin call price  = 1,000,000 / (0.70 × 20) = 71,428.57
          liquidation price  = 1,000,000 / (0.80 × 20) = 62,500.00

day 30    interest 1,000,000 × 0.09 × 30 / 365 = 7,397.26 → debt 1,007,397.26
          BTC falls to 70,000: collateral 1,400,000, LTV 71.96%   → margin call
          to cure to 60%: collateral needed 1,007,397.26 / 0.60 = 1,678,995.43
                          = 23.9856 BTC at 70,000 → post 3.9856 BTC
                          or repay 1,007,397.26 − 0.60 × 1,400,000 = 167,397.26

day 30, not cured; BTC falls to 62,000: collateral 1,240,000, LTV 81.24% → liquidate
          liquidation fee 2% of debt = 20,147.95
          BTC sold = (1,007,397.26 + 20,147.95) / 62,000 = 16.5733 BTC
          returned to the borrower: 20 − 16.5733 = 3.4267 BTC
```

Interest moves the thresholds: the margin call price on day 30 is 1,007,397.26 / 14 = $71,956.95, not the day-0 $71,428.57, so the engine recomputes LTV from the accrued debt, not the original principal. The 24-hour cure period is the borrower's protection and the lender's exposure: from $70,000 a fall of 11.4% to $62,000 crosses the liquidation line, and on October 10, 2025 more than $19 billion of crypto leverage was liquidated in roughly a day while top-of-book depth fell by more than 90% on key venues ([October 10, 2025](/books/investing-and-digital-assets/perpetuals-and-crypto-derivatives#october-10-2025)). So the liquidation threshold has to fire whether or not a margin call is open, and the gap between the call and liquidation lines is a risk decision sized to the collateral's volatility and the time it takes to sell it.

Three engine rules follow:

- **Mark continuously, from more than one venue.** LTV runs on a mark price, an index across venues or the custodian's mark, never the last trade on one exchange, for the same reason perpetuals use a mark price.
- **Sell in size the market can take.** A liquidation of 16.57 BTC moves a thin market; the lender sells through its execution desk in slices, and the borrower bears the slippage under the agreement.
- **Liquidate only what's owed.** The lender sells enough to repay the debt and fees and returns the rest; a lender that sweeps the whole collateral has converted a pledge into a sale.

## The Genesis and Three Arrows Lessons

Genesis was the largest crypto lender of the last cycle and the lender behind Gemini Earn. The New York Attorney General's October 19, 2023 suit against Gemini, Genesis and their parent Digital Currency Group describes what failed:

- **Concentration.** Genesis's loan book was "highly concentrated in a small number of counterparties"; Alameda Research was the borrower for "nearly 60 percent" of Genesis's outstanding loans to third parties.
- **Undersecured loans.** "Gemini knew Genesis' loans were undersecured," and didn't tell Earn investors; Gemini had said it "had vetted Genesis through a risk management framework."
- **A borrower default hidden by a note.** Three Arrows Capital "defaulted on billions in loans," Genesis lost more than $100 million on Babel Finance, and total losses exceeded $1.1 billion; DCG agreed to pay Genesis "$1.1 billion in a decade at only a one percent interest rate," which the suit says concealed Genesis's condition.
- **The customer never chose the borrower.** More than 230,000 Earn investors lent through Gemini to Genesis, which lent to trading firms; when Genesis stopped Earn withdrawals they were creditors of a lender two steps away.

The Attorney General announced settlements worth $2 billion with Genesis in May 2024 and $50 million in kind from Gemini in June 2024 ([BlockFi and Genesis: Lending Customers' Coins](/books/investing-and-digital-assets/exchange-collapses#blockfi-and-genesis-lending-customers-coins) has the SEC side). The engineering failures map onto controls a lending system can enforce:

| Failure | Control |
| --- | --- |
| One borrower held most of the book | Concentration limits per counterparty and per group, checked before every new loan |
| Loans were undersecured | Minimum collateral per loan, marked continuously, with automatic calls |
| Losses were papered over with an affiliate note at 1% | Related-party exposures flagged and reported; no affiliate asset counts as collateral |
| Retail coins funded institutional loans | Customer custody assets can't fund loans without the customer's per-loan consent (NYDFS forbids using customer assets to "extend credit" absent approval) |

## Tri-Party Arrangements

Tri-party moves the collateral to someone who isn't the borrower or the lender. A custodian holds the pledged assets in an account titled to the borrower with the lender's security interest; the custodian releases collateral to the lender only on a default notice under the control agreement, and back to the borrower when the loan is repaid. It's how repo and securities lending work in traditional markets, and in crypto it is the off-exchange settlement model applied to credit: Copper describes "protected collateral" supporting about $105 billion of monthly notional trading through ClearLoop, and BitGo keeps lending collateral in segregated accounts it doesn't reuse.

For the lender, tri-party gives up reuse (it can't lend the collateral on, so its funding costs more) in exchange for certainty that the collateral exists and is unencumbered. For the borrower, it means the lender's failure doesn't take the collateral with it, which is the Genesis lesson from the borrower's side. The records are a pledge with its control agreement, the custodian account, the lender's instruction rights, and every release, each reconciled against the custodian's statement.

## Lending After 2022

The lending that came back is visible in public filings rather than in private term sheets: Coinbase's loan book of about $2 billion at September 30, 2026, mostly fiat and stablecoin loans against crypto collateral; Galaxy's loans and digital asset loans; BitGo's lending fees tripling in 2025. Alongside it, over-collateralized lending moved on chain, where collateral factors and liquidations are protocol rules rather than contract terms ([Collateral Factors and the Health Factor](/books/investing-and-digital-assets/defi-lending#collateral-factors-and-the-health-factor)). A centralized lender's risk engine and a lending protocol's liquidation logic now compute the same thing, LTV against a mark, and differ in who can change the parameters and who holds the collateral.

## How to Build It

Credit limits, pledges and loans extend `accounts` and `positions`; a margin call on a crypto loan is a row in Margin & Short Selling's `margin_calls` with the loan it belongs to:

```sql
CREATE TABLE prime_credit_limits (         -- what a client may owe, by kind
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  lender_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('settlement_credit', 'margin_loan',
                          'term_loan', 'asset_borrow')),
  limit_cents           BIGINT NOT NULL CHECK (limit_cents >= 0),
  counterparty_group    TEXT NOT NULL,     -- for concentration limits across affiliates
  approved_by           UUID NOT NULL REFERENCES parties (id),
  valid_during          TSTZRANGE NOT NULL
);

CREATE TABLE collateral_pledges (          -- collateral under a control agreement
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  instrument_id         UUID NOT NULL REFERENCES instruments (id),
  quantity              NUMERIC(78, 0) NOT NULL CHECK (quantity > 0),
  held_in_wallet_id     UUID NOT NULL REFERENCES wallets (id),
  structure             TEXT NOT NULL CHECK (structure IN ('tri_party', 'lender_custody',
                          'title_transfer')),
  reuse_allowed         BOOLEAN NOT NULL DEFAULT FALSE,
  control_agreement     TEXT NOT NULL,
  status                TEXT NOT NULL CHECK (status IN ('pledged', 'released',
                          'seized', 'liquidated')),
  CHECK (structure <> 'tri_party' OR reuse_allowed = FALSE)
);

CREATE TABLE crypto_loans (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  lender_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  credit_limit_id       UUID NOT NULL REFERENCES prime_credit_limits (id),
  principal_instrument_id UUID NOT NULL REFERENCES instruments (id),  -- USD, USDC, BTC, ...
  principal             NUMERIC(78, 0) NOT NULL CHECK (principal > 0),
  rate_bps              INT NOT NULL,      -- per year, accrued daily
  initial_ltv_bps       INT NOT NULL,
  call_ltv_bps          INT NOT NULL,
  liquidation_ltv_bps   INT NOT NULL,
  cure_period           INTERVAL NOT NULL,
  liquidation_fee_bps   INT NOT NULL,
  mark_source           TEXT NOT NULL,     -- the index or mark the LTV uses
  status                TEXT NOT NULL CHECK (status IN ('requested', 'active', 'margin_call',
                          'liquidating', 'repaid', 'liquidated', 'defaulted')),
  opened_at             TIMESTAMPTZ,
  closed_at             TIMESTAMPTZ,
  CHECK (initial_ltv_bps < call_ltv_bps AND call_ltv_bps < liquidation_ltv_bps)
);

CREATE TABLE crypto_loan_collateral (      -- which pledges secure which loan
  crypto_loan_id        UUID NOT NULL REFERENCES crypto_loans (id),
  collateral_pledge_id  UUID NOT NULL REFERENCES collateral_pledges (id),
  PRIMARY KEY (crypto_loan_id, collateral_pledge_id)
);

ALTER TABLE margin_calls ADD COLUMN crypto_loan_id UUID REFERENCES crypto_loans (id);
```

![The crypto loan state machine. A row of states: requested, active and repaid, with the path from requested through active to repaid accented, its edges labeled funded and repaid, and repaid a terminal state. Below active, margin_call, reached by a dashed edge labeled LTV over call line; a dashed back edge from margin_call returns to active labeled cured: collateral or repayment. From margin_call, a dashed edge labeled not cured or LTV over liquidation line leads to liquidating, which leads to the terminal liquidated state labeled debt and fee repaid, excess returned.](/diagrams/ida-crypto-loan-states.svg "A loan should end repaid; a margin call returns it to active when cured, and liquidation sells only what repays the debt and fee. The liquidation line fires from active too, without a call, when the price gaps through both thresholds.")

The risk engine runs on every mark change: recompute each active loan's LTV from accrued debt and the collateral's mark, open a `margin_calls` row when it crosses the call line, start liquidation when it crosses the liquidation line or the cure period ends, and post each step as journal entries (interest accrual to the loan, collateral sold from the pledge wallet, proceeds to the loan, fee to the firm, excess back to the client). The LTV computation in integer cents and basis points:

```go tab="Go"
// LTVBps returns debt over collateral value in basis points, rounded up so a
// loan at the threshold counts as over it.
func LTVBps(debtCents, collateralCents int64) int64 {
	if collateralCents <= 0 {
		return math.MaxInt64
	}
	return (debtCents*10_000 + collateralCents - 1) / collateralCents
}

func Action(ltv int64, loan Loan) string {
	switch {
	case ltv >= loan.LiquidationLTVBps:
		return "liquidate"
	case ltv >= loan.CallLTVBps:
		return "margin_call"
	default:
		return "none"
	}
}
```

```rust tab="Rust"
/// Debt over collateral value in basis points, rounded up so a loan at the
/// threshold counts as over it.
pub fn ltv_bps(debt_cents: i128, collateral_cents: i128) -> i128 {
    if collateral_cents <= 0 {
        return i128::MAX;
    }
    (debt_cents * 10_000 + collateral_cents - 1) / collateral_cents
}

pub fn action(ltv: i128, loan: &Loan) -> &'static str {
    if ltv >= loan.liquidation_ltv_bps {
        "liquidate"
    } else if ltv >= loan.call_ltv_bps {
        "margin_call"
    } else {
        "none"
    }
}
```

Concentration is a pre-trade check like any other: before a loan is approved, the sum of open principal across every account in the borrower's `counterparty_group` plus the new loan must stay under the group limit, and a related party of the lender is its own group with a limit of zero unless the board says otherwise.

## Auditing

What a lender's auditor, a regulator or a bankruptcy examiner reconstructs:

- **Every loan's LTV history**, with the marks used, each call and its cure or failure, and each liquidation's sales and prices.
- **Where every pledge was held** on each day, under which control agreement, and whether it was reused.
- **Concentration by counterparty group** at every approval, and related-party exposures.
- **Customer consent** for any customer asset that funded a loan.

## What This Means for the System You Build

- Recompute LTV from accrued debt on every mark change, from a multi-venue mark, and let the liquidation line fire without waiting for a call.
- Sell only what repays debt and fees, in slices the market can absorb, and return the excess.
- Hold collateral at a third party or in segregated custody, and record whether reuse is allowed per pledge.
- Enforce concentration limits by counterparty group before every loan, with related parties limited to zero by default.
- Never fund loans with customer custody assets without the customer's consent per loan.
- Settle OTC and prime trades on the custodian's ledger, delivery versus payment.

## References

**Regulators and guidance**

- [NYDFS: Updated Guidance on Custodial Structures (September 30, 2025)](https://www.dfs.ny.gov/industry-guidance/industry-letters/il20250930-updated-guidance-custodial-structures), customer assets not used to secure obligations or extend credit absent approval

**Filings**

- [BitGo Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1740604/000174060426000020/btgo-form10xk.htm), BitGo Prime, agency-only execution, over-collateralized lending, lending fees, segregated collateral and no rehypothecation
- [Coinbase Global: Form 10-Q for the third quarter of 2026](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000122/coin-20260930.htm), loan receivables, the 100% to 250% collateral range, customer collateral not recognized and crypto asset borrowings
- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), Prime, financing and custody through Coinbase Custody Trust Company
- [Galaxy Digital: Form 10-Q for the second quarter of 2026](https://www.sec.gov/Archives/edgar/data/1859392/000185939226000091/glxy-20260630.htm), loans receivable, digital asset loans receivable, collateral payable and digital assets borrowed
- [iShares Bitcoin Trust: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1980994/000143774926006058/bit20251231_10k.htm), Trade Credits from Coinbase Credit, their terms and the lien

**Courts and enforcement**

- [New York Attorney General: Suit against Gemini, Genesis and DCG (October 19, 2023)](https://ag.ny.gov/press-release/2023/attorney-general-james-sues-cryptocurrency-companies-gemini-genesis-and-dcg), investors and losses, Three Arrows and Babel defaults, the DCG note, concentration in Alameda and undersecured loans
- [New York Attorney General: Settlement worth $2 billion with Genesis (May 20, 2024)](https://ag.ny.gov/press-release/2024/attorney-general-james-secures-settlement-worth-2-billion-crypto-firm-genesis), the settlement and the New York ban
- [New York Attorney General: $50 million from Gemini (June 14, 2024)](https://ag.ny.gov/press-release/2024/attorney-general-james-recovers-50-million-crypto-firm-gemini-defrauded), in-kind return to Earn investors

**Vendor documentation**

- [Copper](https://copper.co/), ClearLoop protected collateral and monthly notional
