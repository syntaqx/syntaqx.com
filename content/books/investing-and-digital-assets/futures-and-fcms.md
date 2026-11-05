+++
title = "Futures & FCMs"
description = "How retail futures work: DCMs, clearing houses, FCMs and introducing brokers, daily settlement and variation margin, Part 1.20 segregation, crypto futures."
category = "Investing & Digital Assets Industry"
order = 2523
part = "Trading and Markets"
tags = ["investing", "futures", "fcm", "cftc", "margin", "segregation", "crypto"]
+++

A futures contract is settled every day. A stock trade settles once, a business day after the trade; a futures position is marked to the clearing house's settlement price at the end of every business day, and the day's gain or loss moves in cash between the winners and the losers before the next day starts. Nobody waits for expiry to find out whether a counterparty can pay. The cost of that design is that a futures broker's customers can owe money every afternoon, and the broker owes it to the clearing house whether or not the customer has paid.

The broker in the middle is a futures commission merchant (FCM), and its central duty is the one MF Global broke in 2011: customer money is segregated, computed every business day, and never used for anyone else ([2011: MF Global](/books/investing-and-digital-assets/crises-and-the-rules#2011-mf-global)). This chapter covers the parties (DCMs, clearing houses, FCMs, introducing brokers, NFA), margin and daily settlement with three days of variation margin and a margin call worked on a micro contract, customer segregation under 17 CFR 1.20, 1.22, 1.32 and 30.7 with a segregation computation worked through, the disclosures an FCM owes, retail futures at Robinhood, Coinbase, Interactive Brokers and NinjaTrader, and crypto futures in the US, including perpetual-style contracts on registered venues. Registration as a map is in [Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses#which-registration-each-activity-needs); event contracts, which FCMs also carry, are Event Contracts & Prediction Markets; offshore perpetuals and liquidation engines are Perpetuals & Crypto Derivatives; securities margin is Margin & Short Selling.

## How the Platforms Do It

Retail futures as each firm describes it in its filings and public pages, as of November 2026:

| Firm | Entities | What it offers | Notes |
| --- | --- | --- | --- |
| **Coinbase** | Coinbase Financial Markets (FCM); Coinbase Derivatives Exchange (DCM) | "Dated futures, Perpetual-style futures," with "35+ futures (crypto, commodities, equity indices)" | The FCM began offering event contracts in December 2025; nano bitcoin and ether contracts and nano perpetual-style futures appear on other brokers' margin tables |
| **Interactive Brokers** | IB LLC, subject to the CEA and the CFTC's capital rule (1.17); owns ForecastEx, a DCM and DCO | Futures on exchanges worldwide; US activity "entirely self-cleared" | Clearing member of CME Clearing, ICE Clear U.S., Cboe Clear U.S. and Nodal Clear; real-time margin with automatic liquidation |
| **NinjaTrader** (a Payward brand, alongside Kraken) | NinjaTrader Clearing, an FCM and NFA member; Kraken Derivatives US among its affiliates | CME, Coinbase Derivatives and Bitnomial contracts | Publishes day, initial and maintenance margins per contract; day margin until 15 minutes before the session close |
| **Robinhood** | Robinhood Derivatives, an FCM and NFA member, also registered for cleared swaps; Rothera, a joint venture with Susquehanna that owns 90% of MIAXdx, renamed Rothera Exchange and Clearing | Futures on "equity indices, energy, currencies, cryptocurrencies, metals, and other commodities," options on futures, event contracts | "No pattern day trading rules"; "Commissions and other fees apply for each futures contract traded" |

Two patterns. **The futures side is always a separate entity.** Each brand puts its FCM in its own company with its own capital, its own segregated accounts and its own regulators, next to the broker-dealer and the crypto entity ([One Company, Many Entities](/books/investing-and-digital-assets/regulators-and-licenses#one-company-many-entities)). **Brokers are buying the exchange.** Coinbase runs its own DCM, IBKR owns ForecastEx, Robinhood co-owns an exchange and clearing house, and NinjaTrader's FCM now sits in the same group as Kraken; owning the venue captures the exchange fee and controls the listing calendar.

## The Parties

| Party | What it is | Regulated by | Key rule |
| --- | --- | --- | --- |
| **Designated contract market (DCM)** | The exchange: lists contracts, runs the book, enforces trading rules | CFTC, under 17 CFR Part 38 | Impartial access for members and trading participants (38.151); a new contract is self-certified (40.2) or approved (40.3) |
| **Derivatives clearing organization (DCO)** | The clearing house: becomes the buyer to every seller and the seller to every buyer, sets margin, settles daily | CFTC, under Part 39 | Settles with each clearing member "at least once each business day" and can settle intraday (39.14) |
| **Futures commission merchant (FCM)** | Takes customers' orders and money; a clearing FCM is a member of the DCO | CFTC; must be an NFA member | Registration under 7 USC 6d; segregation (1.20 to 1.32); capital of at least $1 million (1.17) |
| **Introducing broker (IB)** | Solicits and takes orders but holds no customer money; clears through an FCM | CFTC; NFA member | Adjusted net capital of $45,000 or NFA's figure, or a guarantee from an FCM instead (1.17(a)(1)(iii), (a)(2)(ii)) |
| **NFA** | The futures industry's self-regulatory organization | Registered futures association under the CEA | "All registered FCMs must be NFA Members"; FCMs file Form 7-R, principals and APs Form 8-R |

An FCM's capital floor is the greatest of $1,000,000 ($20 million if it's also a swap dealer), 8% of the total risk margin requirement on its customer and noncustomer positions, the amount NFA requires, and, for a firm that is also a broker-dealer, the SEC's Rule 15c3-1 amount. An FCM that falls below it "must transfer all customer accounts and immediately cease doing business," unless it can come back into compliance within up to 10 business days. Capital is the cushion; segregation is what protects the customers when the cushion fails.

A retail futures customer's path: an order goes to the FCM (or through an IB to its clearing FCM), the FCM sends it to the DCM, a fill is given up to the DCO, and from then on the DCO holds the position against the FCM, and the FCM holds it against its customer. The customer never faces the clearing house; the FCM does.

## Margin and Daily Settlement

Futures margin is a performance bond, not a loan. Nobody borrows to buy a futures contract, because nothing is bought; both sides post collateral against what they might lose before the next settlement:

- **Initial margin** is what a new position requires, set by the clearing house for clearing members and usually higher at the FCM for its customers.
- **Maintenance margin** is the floor below which the account is called. When equity falls below maintenance, the call is to bring it back up, and in my illustration below the FCM calls back to the initial level, a common house policy.
- **Variation margin** is the day's gain or loss, paid in cash. The DCO computes each position's change from yesterday's settlement price to today's and moves the cash between clearing members; each FCM then credits and debits its customers.
- **Day margin** is an FCM's own, lower requirement for positions opened and closed within the session. NinjaTrader applies it from the open until "15 minutes prior to the session close," after which a position held into the next session must meet initial margin.

As of August 31, 2026, NinjaTrader's table showed the Micro E-mini S&P 500 (MES) at $50.00 day margin, $2,863.17 initial and $2,602.88 maintenance; the full-size E-mini at $500.00, $28,631.65 and $26,028.77, ten times the micro. The MES contract is $5 times the S&P 500 index, with a 0.25-point tick worth $1.25, trading on CME Globex from Sunday 5:00 pm to Friday 4:00 pm Central with a daily hour's halt from 4:00 pm Monday to Thursday, and expiring quarterly in a cash settlement.

### Worked numbers: three days of variation margin

A customer deposits $3,500 and buys one MES at 6,800.00, a notional of 6,800 × $5 = $34,000 on $3,500 of collateral. Settlement prices for the next three days:

| Day | Settlement | Change (points) | Variation margin (× $5) | Account equity | Against $2,602.88 maintenance |
| --- | --- | --- | --- | --- | --- |
| Trade | 6,800.00 (entry) | | | $3,500.00 | |
| 1 | 6,760.00 | −40.00 | −$200.00 | $3,300.00 | Above |
| 2 | 6,690.00 | −70.00 | −$350.00 | $2,950.00 | Above |
| 3 | 6,600.00 | −90.00 | −$450.00 | $2,500.00 | **Below**: call |

The three payments total −$1,000, the same as (6,600 − 6,800) × $5: daily settlement pays the eventual loss in installments, so at any moment the position's whole loss has already moved. Each afternoon the DCO collected the day's loss from the FCM, and the FCM debited the customer's account; the cash went to whichever FCMs' customers were short.

**The margin call.** On day 3 equity of $2,500.00 is $102.88 below maintenance. Calling back to initial, the customer owes $2,863.17 − $2,500.00 = **$363.17**. Until it arrives the FCM is carrying the shortfall, and the regulation makes it carry it with its own money: an FCM must hold residual interest in the segregated account at least equal to its customers' undermargined amounts by the Residual Interest Deadline, 6:00 pm Eastern on the settlement date (17 CFR 1.22(c)). If the call isn't met, the FCM liquidates; NinjaTrader's policy is that if "an account does not meet the margin requirement at all times during the trade," the whole position "may be liquidated," with a liquidation fee. Interactive Brokers doesn't call at all: if equity falls below the requirement, "we will automatically liquidate positions on a real-time basis."

**The intraday version.** A day trader with $500 opens one MES on $50 of day margin. At 15 minutes before the close the day rate ends and the position needs $2,863.17 of initial margin. With $500 in the account it's $2,363.17 short, and the FCM closes it rather than carry it into the next session. Day margin is credit the FCM extends inside one session, and it ends on the FCM's clock.

## Customer Segregation

The Commodity Exchange Act requires an FCM to treat customers' money as theirs (7 USC 6d), and the CFTC's rules turn that into a daily computation:

- **Separate accounting and naming (1.20(a)).** The FCM separately accounts for all futures customer funds and holds them in accounts titled to show they hold "futures customer funds" segregated under the Act. Each depository (a bank, a DCO, another FCM) signs a written acknowledgment in the form the rule prescribes before the account is used, filed within three business days, and promises to let the CFTC and the FCM's designated self-regulatory organization see the account (1.20(d)). Funds at a bank must be "immediately available for withdrawal upon the demand" of the FCM (1.20(h)).
- **No commingling (1.20(e)).** Customers' funds may be pooled with each other "for convenience," never with the FCM's own money, and never used to secure or extend credit to the FCM. Futures customer funds also stay apart from foreign futures (30.7) funds and cleared swaps funds.
- **One customer's money is never another's (1.20(f), 1.22(a)).** "No futures commission merchant shall use, or permit the use of, the futures customer funds of one futures customer" to margin or settle anyone else's trades. A customer in deficit is the FCM's problem, not the other customers'.
- **The amount required (1.20(i)).** Each customer's net liquidating equity is their cash and collateral plus or minus open trade gains and losses, adjusted for charges and transfers; a positive result is a credit balance. The FCM must hold at least the total of its customers' credit balances, with no offset from customers in deficit except where the deficit is secured by readily marketable securities in that customer's own account, after haircuts (1.20(i)(5), 1.32(b)).
- **Residual interest (1.22, 1.23).** The FCM may put its own money into the segregated account, and must hold enough of it to cover undermargined customers by the 6:00 pm deadline. It sets a **targeted residual interest** in written policy (1.23(c)) and may withdraw only after the prior business day's computation, and only down to what it actually has. A withdrawal of more than 25% of residual interest needs written pre-approval from the CEO, CFO or another listed senior principal and immediate notice to the CFTC and its DSRO (1.23(d)).
- **The daily computation (1.32).** "As of the close of each business day, on a currency-by-currency basis," the FCM computes funds in segregation, the amount required and its residual interest, and files the statement with the CFTC and its DSRO "by noon the following business day." Twice a month (the 15th and month-end) it also reports every depository holding customer funds, by 11:59 pm the next business day.
- **Foreign futures (30.7).** Customers trading on non-US exchanges are a separate pool, the 30.7 secured amount, with its own accounts, acknowledgments and daily statement, limits on how much may sit abroad, and the same 25% withdrawal rule.

The rules after MF Global (78 FR 68506, November 14, 2013, effective January 13, 2014) are what made these computations daily, filed and public; the Residual Interest Deadline in 1.22 phased in from November 14, 2014.

### Worked numbers: one day's segregation computation

My illustration, an FCM with three futures customers at the close of a business day:

| Customer | Net liquidating equity | Counts toward required |
| --- | --- | --- |
| A | +$30,000 | $30,000 |
| B | +$50,000 | $50,000 |
| C | −$4,000 (unsecured deficit) | $0 |
| **Required in segregation** | | **$80,000** |

The FCM holds $89,000 in segregated accounts, $85,000 at its DCO as margin and $4,000 at a bank. Its residual interest is $89,000 − $80,000 = **$9,000**. Customer C's $4,000 deficit can't reduce A's or B's entitlement, so the required amount ignores it; the FCM has in effect funded C from its own money already, because the DCO collected C's losses the day they happened. If C pays tomorrow, residual interest rises; if C never pays, it's the FCM's loss.

Suppose the FCM's targeted residual interest is $10,000. It's $1,000 under target and "should deposit its own funds" to restore it by the next business day's close, or revisit the target (1.23(e)). Any withdrawal of firm money from the account before the next computation above $2,250 (25% of $9,000) needs a senior officer's signature and an immediate notice. And by noon tomorrow the statement showing all of this is filed with the CFTC and the DSRO.

## What an FCM Must Tell Customers

- **Risk disclosure before the account opens (1.55(a), (b)).** A separate written statement, acknowledged with a signature and date, warning among other things that the customer "may sustain a total loss of the funds that you deposit." SIPC "does not protect commodity futures contracts (unless held in a special portfolio margining account)," so the protection is segregation.
- **Firm-specific disclosure document (1.55(i), (k)).** Before taking funds, a document covering the firm's business, material risks, affiliates, its DSRO, how customer funds are segregated and financial data including "total equity, regulatory capital, and net worth," updated at least annually and posted on the FCM's website (1.55(j)).
- **Segregation statements in public (1.55(o)).** The daily segregation statements for the most recent 12 months, net capital summaries and financial statements, posted for anyone to read.

These are `disclosures` rows, and the public segregation statements are generated from `segregation_computations` (below), so what the website shows is exactly what was filed.

## Crypto Futures in the US

What changed for US crypto futures in 2025 and 2026 is the products and the hours. Coinbase Derivatives lists dated and perpetual-style futures on a DCM; NinjaTrader's August 2026 margin table shows Coinbase Derivatives nano bitcoin and ether futures (day margin $25, initial $379.50 for nano bitcoin), nano perpetual-style bitcoin and ether, and a list of US-dollar perpetuals on Bitnomial in assets from AAVE to XRP. A perpetual-style contract has no expiry and uses a funding payment to tie its price to spot (Perpetuals & Crypto Derivatives covers the mechanics); on a DCM it is still cleared, margined and segregated like any future.

The CFTC's posture moved in steps, as of November 2026:

- **Perpetual contracts on DCMs.** A policy statement adopted May 29, 2026 (91 FR 33160, June 3, 2026) accompanied an order letting a DCM list a futures contract on the spot price of bitcoin, and said that for perpetuals on other asset classes the case-by-case review of Regulation 40.3 fits.
- **24/7 futures.** A request for comment (91 FR 38335, June 25, 2026) asked how margin calls and settlement work overnight, on weekends and on holidays when Fedwire and CHIPS don't operate, and whether 24/7 contracts need extra initial margin before weekends. The comment period ran to August 26, 2026 (91 FR 47158), which also sought comment on a 24/7 oil contract NYMEX self-certified on July 8, 2026 and the Commission stayed on July 9.
- **Crypto market rules.** The CFTC published "Regulation Crypto Asset Transactions and Regulation Crypto Asset Markets" on October 13, 2026; Securities, Commodities & Crypto Market Structure covers it.

For the FCM the hard part of 24/7 crypto futures is the rulebook's business day. Daily settlement, the 6:00 pm residual interest deadline and the noon segregation filing are all defined on business days, while the contract's price moves all weekend. Weekend losses accrue against margin that can't be topped up by wire until Monday, which is why the CFTC asked about weekend buffers and why FCMs offering these contracts liquidate in real time rather than call.

## How to Build It

The core model has `instruments` (with `future` and `event_contract` types), `accounts` (with the `futures` and `event_contracts` capabilities) and `legal_entities` (with `fcm` and `dcm` kinds) ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)). Futures add the contract terms, the daily variation settlement per position and the segregation computation per entity and pool:

```sql
CREATE TABLE futures_contracts (           -- terms for an instrument of type 'future'
  instrument_id       UUID PRIMARY KEY REFERENCES instruments (id),
  venue_id            UUID NOT NULL REFERENCES venues (id),       -- the DCM
  clearing_venue_id   UUID NOT NULL REFERENCES venues (id),       -- the DCO
  root_symbol         TEXT NOT NULL,         -- 'MES'
  underlying          TEXT NOT NULL,         -- 'S&P 500 index', 'BTC spot price'
  multiplier          NUMERIC(38, 18) NOT NULL,   -- 5 for MES; 0.01 BTC for a nano
  tick_size           NUMERIC(38, 18) NOT NULL,   -- 0.25
  quote_instrument_id UUID NOT NULL REFERENCES instruments (id),  -- USD
  settlement_method   TEXT NOT NULL CHECK (settlement_method IN ('cash', 'physical')),
  expires_at          TIMESTAMPTZ,           -- null for perpetual-style
  funding_interval    INTERVAL,              -- perpetual-style only
  pool                TEXT NOT NULL CHECK (pool IN ('futures_customer', 'foreign_futures_30_7',
                        'cleared_swaps')),    -- which segregation pool its customers sit in
  CHECK ((expires_at IS NULL) = (funding_interval IS NOT NULL))
);

CREATE TABLE settlement_prices (           -- the DCO's daily settlement, as published
  instrument_id       UUID NOT NULL REFERENCES futures_contracts (instrument_id),
  business_date       DATE NOT NULL,
  price               NUMERIC(38, 18) NOT NULL,
  published_at        TIMESTAMPTZ NOT NULL,
  source_ref          TEXT NOT NULL,
  PRIMARY KEY (instrument_id, business_date)
);

CREATE TABLE variation_settlements (       -- one position's daily mark, posted to the ledger
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  instrument_id       UUID NOT NULL REFERENCES futures_contracts (instrument_id),
  business_date       DATE NOT NULL,
  contracts           NUMERIC(78, 0) NOT NULL,   -- signed: long positive, short negative
  prior_price         NUMERIC(38, 18) NOT NULL,  -- yesterday's settlement, or the fill price
  settlement_price    NUMERIC(38, 18) NOT NULL,
  amount              BIGINT NOT NULL,       -- minor units: (settle - prior) x multiplier x contracts
  journal_entry_id    UUID NOT NULL REFERENCES journal_entries (id),
  UNIQUE (account_id, instrument_id, business_date)
);

CREATE TABLE segregation_computations (    -- the 1.32 / 30.7 daily statement, per entity, pool, currency
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),   -- the FCM
  pool                TEXT NOT NULL CHECK (pool IN ('futures_customer', 'foreign_futures_30_7',
                        'cleared_swaps')),
  currency_instrument_id UUID NOT NULL REFERENCES instruments (id),
  business_date       DATE NOT NULL,
  funds_held          BIGINT NOT NULL,       -- in segregated accounts at every depository
  required            BIGINT NOT NULL,       -- sum of credit balances, after permitted offsets
  residual_interest   BIGINT GENERATED ALWAYS AS (funds_held - required) STORED,
  undermargined       BIGINT NOT NULL,       -- 1.22(c) amount to cover by 6 pm ET
  targeted_residual   BIGINT NOT NULL,       -- from the FCM's written policy
  computed_at         TIMESTAMPTZ NOT NULL,
  filed_at            TIMESTAMPTZ,           -- due by noon the next business day
  UNIQUE (legal_entity_id, pool, currency_instrument_id, business_date)
);

CREATE TABLE residual_withdrawals (        -- firm money out of a segregated pool (1.23)
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  computation_id      UUID NOT NULL REFERENCES segregation_computations (id),  -- the prior day's
  amount              BIGINT NOT NULL CHECK (amount > 0),
  approved_by         UUID REFERENCES parties (id),    -- required above 25% of residual interest
  notice_sent_at      TIMESTAMPTZ,           -- CFTC and DSRO, immediately after approval
  transfer_id         UUID NOT NULL REFERENCES transfers (id)
);
```

Four rules the schema enforces or the jobs check:

- **Variation settles through the ledger, every business day.** Each `variation_settlements` row is one journal entry between the customer's line and the FCM's settlement account with the DCO; the position's cash balance is never adjusted in place.
- **Segregation is computed from customer lines, per pool and currency.** `required` is the sum of positive net liquidating equities from the ledger's customer lines in that pool; deficits don't net against it. `funds_held` comes from the daily reconciliation against each depository's statement ([The Core Data Model](/books/investing-and-digital-assets/investing-business#extended-by)).
- **No withdrawal without yesterday's computation.** A `residual_withdrawals` row references the prior day's computation; above 25% of its residual interest, `approved_by` and `notice_sent_at` must be set before the transfer is released.
- **Undermargined accounts drive the 6:00 pm deposit.** The FCM's treasury moves its own funds into the pool before the deadline in the amount of `undermargined`, whether or not customers have paid their calls.

The daily mark, in integer minor units:

```go tab="Go"
// VariationMargin returns the day's settlement for one position in cents.
// Prices are decimals; contracts is signed (long positive, short negative).
func VariationMargin(prior, settle, multiplier decimal.Decimal, contracts int64) int64 {
	pnl := settle.Sub(prior).Mul(multiplier).Mul(decimal.NewFromInt(contracts))
	return pnl.Shift(2).Round(0).IntPart() // USD to cents; ticks make this exact for MES
}
```

```rust tab="Rust"
/// Returns the day's settlement for one position in cents.
/// Prices are decimals; contracts is signed (long positive, short negative).
pub fn variation_margin(prior: Decimal, settle: Decimal, multiplier: Decimal, contracts: i64) -> i64 {
    let pnl = (settle - prior) * multiplier * Decimal::from(contracts);
    (pnl * Decimal::from(100)).round().to_i64().expect("fits in i64") // USD to cents
}
```

For the worked example, `VariationMargin(6760, 6690, 5, 1)` is −35,000 cents, day 2's −$350.00.

## Auditing

- **Every daily statement as filed.** Each segregation and 30.7 computation with its inputs (customer lines, depository balances), the time computed and the time filed, and the public copy posted under 1.55(o), retained under 1.31.
- **Every depository acknowledgment.** The signed letter for every segregated account, when it was filed and when it was renewed after a change of name or account number.
- **Every residual interest withdrawal.** The prior day's computation it relied on, the approver above 25%, the notice and the transfer.
- **Every settlement price and mark.** The DCO's price as published and each position's variation entry, so a customer's statement can be rebuilt from prices and positions alone.
- **Every margin call and liquidation.** The deficit, the call, the deadline, the deposit or the liquidation and its fills, and the deposit of firm funds that covered the deficit by 6:00 pm.
- **Every disclosure.** The risk statement acknowledgment and the firm disclosure document version each customer had before funding.

## What This Means for the System You Build

- **Put futures in their own legal entity,** with its own ledger accounts, capital computation and segregated pools.
- **Settle variation through journal entries every business day** from the DCO's published price.
- **Compute segregation from the ledger daily,** per pool and currency, with deficits never netted against other customers, and file by noon.
- **Fund undermargined accounts with firm money by 6:00 pm ET** and treat the customer's call as a separate receivable.
- **Gate every firm withdrawal from a pool** on yesterday's computation and the 25% approval.
- **Make day margin end on a clock** you store per product, and liquidate or call when it does.
- **Generate the public segregation statements from the same computation** you file.
- **Plan 24/7 contracts around business-day rules:** real-time liquidation or weekend buffers, because no wire arrives on Saturday.

## References

**Law and regulation**

- [7 USC 6d](https://www.law.cornell.edu/uscode/text/7/6d), FCM registration and the separate accounting and non-commingling of customer funds
- [17 CFR 1.17](https://www.law.cornell.edu/cfr/text/17/1.17), FCM adjusted net capital (the greatest of $1,000,000 or $20,000,000 for a swap dealer, 8% of risk margin, NFA's amount and Rule 15c3-1), introducing broker capital of $45,000 or a guarantee, and transfer of accounts on a deficiency
- [17 CFR 1.20](https://www.law.cornell.edu/cfr/text/17/1.20), separate accounting, account naming, written acknowledgments, immediate availability, commingling limits, each customer's funds for that customer, and the required amount from net liquidating equity
- [17 CFR 1.22](https://www.law.cornell.edu/cfr/text/17/1.22), the ban on using one customer's funds for another, undermargined amounts and the 6:00 pm Eastern Residual Interest Deadline
- [17 CFR 1.23](https://www.law.cornell.edu/cfr/text/17/1.23), residual interest, targeted residual interest, withdrawals after the prior day's computation, and the 25% approval and notice
- [17 CFR 1.32](https://www.law.cornell.edu/cfr/text/17/1.32), the daily computation by currency, filing by noon the next business day, and twice-monthly depository reports
- [17 CFR 1.55](https://www.law.cornell.edu/cfr/text/17/1.55), the risk disclosure statement, the firm-specific disclosure document and its contents, website posting, and public segregation statements for 12 months
- [17 CFR 30.7](https://www.law.cornell.edu/cfr/text/17/30.7), the foreign futures secured amount, its accounts, acknowledgments, limits abroad, residual interest and daily statement
- [17 CFR 38.151](https://www.law.cornell.edu/cfr/text/17/38.151), DCM access requirements and impartial access
- [17 CFR 39.14](https://www.law.cornell.edu/cfr/text/17/39.14), DCO settlement with each clearing member at least once each business day, intraday settlement and settlement finality

**Regulators and guidance**

- [NFA: Futures Commission Merchant registration](https://www.nfa.futures.org/registration-membership/who-has-to-register/fcm.html), what an FCM is, NFA membership for every FCM, Forms 7-R and 8-R
- [CFTC: Enhancing protections afforded customers and customer funds held by futures commission merchants and derivatives clearing organizations (78 FR 68506, November 14, 2013)](https://www.federalregister.gov/api/v1/documents/2013-26665.json), the post-MF Global customer protection rule
- [CFTC: Policy Statement Concerning the Listing of Perpetual Contracts (91 FR 33160, June 3, 2026)](https://www.federalregister.gov/api/v1/documents/2026-11020.json), adopted May 29, 2026 with an order for a DCM to list a futures contract on the spot price of bitcoin, and case-by-case review under 40.3 for other perpetuals
- [CFTC: Request for Comment on the Extension of Standard Futures Contracts to 24/7 Trading (91 FR 38335, June 25, 2026)](https://www.federalregister.gov/documents/full_text/html/2026/06/25/2026-12784.html), margin and settlement when payment systems are closed, weekend margin buffers and staffing
- [CFTC: Comment period extension (91 FR 47158, July 28, 2026)](https://www.federalregister.gov/api/v1/documents/2026-15216.json), comments to August 26, 2026 and the NYMEX 24/7 oil contract listed July 8 and stayed July 9, 2026
- [Federal Register: CFTC documents on perpetual contracts, 2025-2026](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=perpetual&conditions[agencies][]=commodity-futures-trading-commission&conditions[publication_date][gte]=2025-01-01&order=newest&per_page=10), including the October 13, 2026 crypto asset markets notice

**Filings**

- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), Coinbase Derivatives Exchange as a DCM with dated and perpetual-style futures, and Coinbase Financial Markets as an FCM offering event contracts from December 2025
- [Interactive Brokers Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1381197/000138119726000062/ibkr-20251231.htm), self-clearing and its US clearing memberships, Regulation 1.17, ForecastEx as a DCM and DCO, and real-time margin and liquidation
- [Robinhood Markets: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000023/hood-20251231.htm), futures asset classes, no pattern day trading rules, per-contract commissions, and Rothera's acquisition of MIAXdx

**Vendor documentation**

- [NinjaTrader](https://ninjatrader.com/), NinjaTrader Clearing as a CFTC-registered FCM and NFA member, its affiliates including Kraken Derivatives US, and the Payward brand family
- [NinjaTrader: Margins (as of August 31, 2026)](https://ninjatrader.com/pricing/margins/), day, initial and maintenance margins for MES, ES, micro and nano crypto futures, perpetual-style futures and Bitnomial perpetuals
- [NinjaTrader: Margin policy and position management](https://ninjatrader.com/pricing/margins-position-management/), day margin until 15 minutes before the close, liquidation when margin isn't met, and liquidation fees
- [MetroTrade: Micro E-mini S&P 500 (MES) contract specifications](https://help.metrotrade.com/kb/micro-e-mini-sp-500-futures-mes-contract-specifications), $5 times the index, the 0.25-point tick worth $1.25, Globex hours and quarterly cash settlement
