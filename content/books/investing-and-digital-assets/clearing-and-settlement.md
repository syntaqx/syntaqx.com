+++
title = "Clearing & Settlement"
description = "NSCC and CNS netting, DTC book entry, T+1 and same-day affirmation, the clearing fund and its VaR charges, fails and buy-ins, and crypto's prefunded contrast."
category = "Investing & Digital Assets Industry"
order = 2525
part = "Clearing and Settlement"
tags = ["investing", "clearing", "settlement", "nscc", "dtc", "t-plus-1", "clearing-fund", "crypto"]
+++

A trade is a promise made in microseconds and kept a business day later. Between the fill and the moment the shares and the cash change hands, the buyer's broker owes money it may not have collected, the seller's broker owes shares it may not hold, and either one can fail. Clearing is everything that happens to those promises in between: matching the two sides, guaranteeing them, netting thousands of them into a few, and collecting enough collateral from every member that one member's default doesn't become everyone's. Settlement is the delivery itself, a book entry at the depository that moves the security against the cash.

In US equities, one company does almost all of it. The National Securities Clearing Corporation (NSCC) clears, nets and guarantees broker-to-broker trades in stocks, ETFs and most corporate and municipal bonds; The Depository Trust Company (DTC) holds the securities and moves them by book entry; both are subsidiaries of DTCC. Listed options clear through the Options Clearing Corporation (OCC). A broker either joins these clearing agencies itself or pays a clearing firm that has, and either way the broker's systems have to produce, track and reconcile settlement obligations that are now due one business day after the trade. A crypto exchange does none of this for trades between its own customers, which settle in its ledger the instant they match, and that difference explains much of what is easy and what is dangerous about each.

This chapter opens the part on clearing and settlement. It covers NSCC's Continuous Net Settlement and novation, DTC, the T+1 cycle and the affirmation deadline, the clearing fund with worked numbers for a margin spike, self-clearing versus introducing brokers, fails and buy-ins, options through OCC, and how crypto settles by contrast. Customer Protection, Net Capital & SIPC, Books, Records & the Audit Trail, Market Surveillance & Manipulation and Brokerage as a Service follow; the ledger entries a trade posts are in [Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions#double-entry-in-many-units), and the trade's whole life is in [The Life of a Stock Trade](/books/investing-and-digital-assets/investing-business#the-life-of-a-stock-trade).

## How the Platforms Do It

How brokers and venues clear, from their filings and public documentation, as of November 2026:

| Firm | Model | What it says publicly |
| --- | --- | --- |
| **Alpaca** | Broker-dealer serving other apps through its Broker API, in fully disclosed, omnibus and RIA setups | Partners choose whether end customers are disclosed to Alpaca or held in one omnibus account; covered in Brokerage as a Service |
| **Apex Fintech Solutions** | Clearing and custody for other brokers and fintechs | Describes AscendOS as a "cloud-native, API-first clearing, custody, and trading platform", with $280 billion or more in assets under custody and 42 million or more brokerage accounts as of September 30, 2026 |
| **Interactive Brokers** | Self-clearing | "Our activities in the U.S. are entirely self-cleared"; a clearing member of OCC, DTCC, CME Clearing, ICE Clear U.S., Cboe Clear U.S. and Nodal Clear |
| **Robinhood** | Self-clearing for securities | Robinhood Financial introduces; Robinhood Securities clears and carries ([One Company, Many Entities](/books/investing-and-digital-assets/regulators-and-licenses#one-company-many-entities)) |
| **Coinbase, Kraken and other crypto exchanges** | Internal ledger settlement | Trades between customers are ledger entries, final when posted; chain settlement happens on deposit and withdrawal ([The Internal Ledger and the Chain](/books/investing-and-digital-assets/crypto-exchange-architecture#the-internal-ledger-and-the-chain)) |
| **NSCC** | Central counterparty for US equities | Nets each member's trades into "a single daily position per security and Member"; $5.55 trillion of value processed in one day, a 98.6% netting rate and $18.3 billion of average margin requirements, data as of the third quarter of 2026 |

Three patterns run through the table. **Clearing is a membership, and memberships are expensive,** so most brokers rent one: an introducing broker sends its trades to a clearing firm, which is the one NSCC knows. **The central counterparty changes the risk.** Once NSCC accepts a trade, a member's counterparty is NSCC, not the broker on the other side, which is why NSCC must hold collateral against every member. **Crypto venues skip the middle,** because they hold both sides' assets before the trade. That removes settlement risk and replaces it with custody risk, which the chapters on crypto custody cover.

## The Players: NSCC, DTC and OCC

**NSCC** is a registered clearing agency. For each trade between two members it validates the trade data, compares or accepts the locked-in trade from the venue, and at the point the trade is validated, becomes the counterparty to both sides: DTCC's words are that "NSCC becomes the legal counterparty to every trade," guaranteeing settlement once a transaction has passed its checks. That substitution is **novation**, and it's the reason a buyer whose seller's broker collapses overnight still gets its shares.

**DTC** is the central securities depository. Almost no US share is held in a customer's own name. DTC holds the securities (registered on issuers' books in its nominee's name), and each participant, a broker or bank, has an account at DTC showing how many of each security it holds. Settlement moves positions between those accounts and cash between participants' settlement accounts by book entry: "the actual transfer of securities and funds occurs at DTCC's subsidiary," The Depository Trust Company. The broker's [stock record](/books/investing-and-digital-assets/ledgers-and-positions#the-stock-record) says which customers own the shares in its DTC account.

**OCC** is the clearing agency for listed options. The SEC staff's report on January 2021 describes it as "the clearing agency for listed options for its 16 participant options exchanges," clearing for members' own accounts and for their clients, and also serving futures, security futures and securities lending markets. An option contract's counterparty is OCC, so exercise and assignment run through it: a long holder exercises at OCC, OCC assigns a short position at a clearing member, and the member assigns one of its customers (Options covers the assignment process). OCC's own site was not reachable for this chapter, so its rules and figures stay with the Options chapter.

## Continuous Net Settlement

Most broker-to-broker equity trades settle through **Continuous Net Settlement (CNS)**. Instead of settling each trade with its counterparty, NSCC nets every member's eligible trades in a security into one position per day, long or short, against NSCC itself. Open positions that fail to settle stay in the system: they are marked to market daily, re-netted with the next day's activity, and receive cash dividends, stock dividends and mandatory corporate actions while open. CNS allocates available shares from members with short positions to members with long positions at DTC, in priority order, during a night cycle and a day cycle.

**Worked numbers: one security, one day.** A member firm executes five trades in XYZ on Monday, November 2, 2026, for its customers and its own account. All settle through CNS on Tuesday, November 3.

| Trade | Side | Shares | Price | Contract amount |
| --- | --- | ---: | ---: | ---: |
| 1 | Buy | 12,000 | $50.00 | $600,000.00 |
| 2 | Sell | 8,000 | $50.10 | $400,800.00 |
| 3 | Buy | 3,000 | $49.95 | $149,850.00 |
| 4 | Sell | 5,000 | $50.05 | $250,250.00 |
| 5 | Sell | 4,000 | $50.20 | $200,800.00 |
| **Net** | **Short** | **2,000** | | **$102,000.00 to receive** |

Bought 15,000, sold 17,000: the firm owes NSCC 2,000 shares and is owed $102,000.00 for the security (sales of $851,850.00 less purchases of $749,850.00). Five settlements of 32,000 shares and $1,601,700.00 gross become one delivery of 2,000 shares, a 93.75% reduction in shares moved, and the firm's money for the day across every security nets to a single figure it pays or receives. This is how DTCC reaches a 98.6% netting rate across the market: most buys and sells cancel before anything moves. In practice CNS values each closing position at the current market price and settles the difference from contract amounts as money, so the per-trade contract amounts reconcile to the CNS money summary rather than appearing in it line by line; the reconciliation is the firm's job.

Two consequences for the firm's systems:

- **Per-trade obligations and the net position are different records.** The customer's confirm and ledger entries are per trade; NSCC's obligation is per security per day. The firm keeps both and reconciles one to the other every night, which is why the core model's `settlements` row can net many fills ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)).
- **A short CNS position is a firm problem before it's a customer problem.** If the firm can't deliver 2,000 shares Tuesday morning, CNS records a fail against the firm, not against the five customers. Which customer's sale caused it, and whether that sale was long or short, decides what the firm must do under Regulation SHO ([Fails and Buy-Ins](#fails-and-buy-ins)).

## T+1 and the Affirmation Deadline

Rule 15c6-1 forbids a broker-dealer from entering a contract for most securities that provides for payment and delivery "later than the first business day after the date of the contract": **T+1**. The SEC adopted it on February 15, 2023, with a compliance date of May 28, 2024 (Release 34-96930); exempted securities, government and municipal securities, commercial paper and bankers' acceptances are outside it, and a firm-commitment offering priced after 4:30 p.m. ET may settle on the second business day. [Crises & the Rules They Wrote](/books/investing-and-digital-assets/crises-and-the-rules#2021-meme-stocks-and-t-1) covers why: January 2021's margin calls were sized by two days of exposure.

The harder part of T+1 is institutional. An investment manager trading for many funds places one block order and tells the broker afterward how to split it (allocation); the broker confirms each allocation and the manager's custodian affirms it, so the custodian knows to deliver or receive. Rule 15c6-2 requires a broker-dealer in that process either to have written agreements with the other parties or to keep written policies and procedures designed to complete allocations, confirmations and affirmations "as soon as technologically practicable and no later than the end of the day on trade date." The policies must set target times on trade date, describe how discrepancies are found and fixed, and "measure, monitor, and document" completion rates. Advisers must keep records of the allocations, confirmations and affirmations, and central matching service providers must facilitate straight-through processing and report annually on it.

For a retail broker, T+1 is mostly a calendar: a settlement date per execution from the instrument's rule and the market calendar, never a constant ([Trade Date and Settlement Date](/books/investing-and-digital-assets/ledgers-and-positions#trade-date-and-settlement-date)). For a broker serving institutions, it's an operations pipeline with a deadline on the same evening as the trade, and the completion-rate measurement the rule asks for is a metric the firm must compute and keep.

## The Clearing Fund

A central counterparty is only as good as its ability to absorb a member's default. NSCC's protection is the **Clearing Fund**: each member's **Required Fund Deposit**, recalculated at least daily and collected intraday when risk rises, sized to cover the losses NSCC would take closing out that member's unsettled positions if it failed. The SEC staff summarized it: the largest part is usually the volatility component, which "estimates the future risk of the cleared portfolio over a given time horizon at a 99th percentile level of confidence," using "a parametric Value at Risk model based on historical price movements." NSCC's Procedure XV sets out the pieces:

- **Volatility charge.** For CNS positions, the higher of a parametric estimate (itself the higher of an exponentially weighted volatility and an evenly weighted one over a look-back of at least 253 days, plus a bid-ask spread charge by market cap group) and a haircut-based calculation, plus a **gap risk charge** when a portfolio is concentrated in one name. Procedure XV requires "not less than two standard deviations' volatility" under any model chosen.
- **Mark-to-market.** The difference between the contract value of a member's open positions and their current value. Rule 11 lets NSCC require extra mark-to-market payments on a volatile security before settlement date.
- **Intraday charges.** An Intraday Mark-to-Market Charge when the move meets or exceeds 80% of the member's volatility component, and an Intraday Volatility Charge when a member's volatility charge recomputed intraday exceeds the start-of-day figure by more than 100% and the amount would exceed $250,000.
- **Excess Capital Premium (ECP).** When a member's volatility charge divided by its net capital (the Excess Capital Ratio) exceeds 1.0, NSCC collects an extra "Excess Capital Premium" equal to the amount by which the volatility charge exceeds net capital, multiplied by that ratio, with the ratio capped at 2.0. Net capital comes from the member's latest FOCUS report. NSCC may waive it in exigent circumstances, by a documented decision of a managing director in its risk office.
- **Minimum.** Every member contributes at least $250,000, and the first 40% of its requirement (no less than $250,000) must be cash.

**Worked numbers: a VaR charge spike.** NSCC's parameters aren't public at this precision, so this uses a stylized parametric VaR of my own: position value times daily volatility times 2.326 (the 99th percentile of a normal distribution) times √3 (an assumed three-day close-out). A self-clearing retail broker has $500 million of net capital.

| | Quiet week | Meme-stock day |
| --- | ---: | ---: |
| Net unsettled long position in one stock | $300 million | $600 million (customers buying) |
| Daily volatility of the stock | 3% | 25% |
| Volatility charge: value × vol × 2.326 × √3 | $36.3 million | $604.3 million |
| Excess Capital Ratio: charge ÷ $500M net capital | 0.07 | 1.21 |
| Excess Capital Premium: (charge − net capital) × ratio | none | $126.1 million |
| **Volatility charge plus ECP** | **$36.3 million** | **$730.4 million** |

The deposit rose twentyfold in a day, and only part of that is the position doubling; most is the volatility. The ECP is the nonlinear part: a broker whose risk outruns its capital pays a premium that grows faster than the overshoot itself, because both factors rise together, until the ratio caps at 2.0. At $250 million of net capital the ratio would hit the cap and the ECP alone would be $708.6 million. The broker has a few hours to wire it.

That is what happened on January 27 and 28, 2021. NSCC made intraday calls on 36 members totaling $6.9 billion that day ($2.1 billion of intraday mark-to-market and a $4.8 billion special charge on 18 members), bringing total required margin to $25.5 billion. The next day NSCC waived the ECP for all members; absent the waiver, the SEC staff wrote, "one retail broker-dealer would have had an additional ECP charge of more than double its margin requirement of $1.4 billion." NSCC removed the waiver on February 2. NSCC has no power to stop members trading a symbol; the brokers who restricted buying did so themselves to cut the position that drove the charge (Pre-Trade Risk, Halts & Volatility covers the restrictions).

What a broker builds from this:

- **Its own estimate of the clearing deposit, intraday.** NSCC publishes calculators for members to estimate requirements on actual or hypothetical portfolios. A broker that self-clears runs the estimate on its live net positions every few minutes, alerts on the ratio of estimated charge to net capital, and stresses it with a volatility shock per concentrated name.
- **A funding plan with a clock.** Liquidity lines, cash on hand, and the ability to post eligible securities, sized to a stress case like the table's, with the treasury contact list that goes with it.
- **A lever on concentration.** The table's charge is driven by one name. Position limits per symbol, margin requirements raised on volatile names, and as a last resort buy restrictions are the levers; deciding them in advance, and recording who pulled which and when, is the difference between a policy and a panic.

## Self-Clearing and Introducing Brokers

A broker-dealer can clear in one of three ways:

- **Self-clearing.** The broker is a member of NSCC, DTC and OCC, carries customer accounts, holds customer assets, computes its own reserve and capital under the higher requirements for carrying firms, and posts its own clearing fund. Robinhood Securities and Interactive Brokers' US broker-dealer clear for themselves.
- **Fully disclosed introducing.** The introducing broker owns the customer relationship and sends trades to a clearing firm, which carries each customer's account in the customer's name, holds the assets, sends statements and posts the clearing deposit. FINRA Rule 4311 requires the carrying agreement to be approved by FINRA and to allocate, at a minimum, opening and approving accounts, accepting, transmitting and executing orders, extending credit, receiving and delivering funds and securities, confirmations, books and records, and monitoring of accounts; the carrying firm must take responsibility for safeguarding funds and securities and for customer statements.
- **Omnibus.** The introducing broker holds one account at the clearing firm for all its customers, and its own books say who owns what. The clearing firm sees one customer, so the introducing firm carries more of the duties.

Self-clearing buys control (of buying power rules, settlement timing, stock lending revenue, outage response) at the price of capital, the clearing fund and an operations team that never sleeps. Introducing buys speed to market at the price of control: when NSCC calls the clearing firm for more margin, the clearing firm can call the introducing broker, or restrict what its customers can buy. Brokerage as a Service covers the providers and how the obligations split.

## Fails and Buy-Ins

A **fail to deliver** is a short CNS position not delivered on settlement date; a **fail to receive** is the long position on the other side. In CNS the receiving member's counterparty is NSCC, so the fail sits between the delivering member and the system, marked to market and re-netted daily.

**Buy-ins in CNS.** NSCC's Rule 11 lets a member with a long position "demand immediate delivery" by submitting a **Buy-In Intent**. The member gets high priority in CNS allocation; if the position is still unfilled after the night allocation of the next day (N+1), NSCC issues **CNS Retransmittal Notices** that morning to members with short positions, oldest first, demanding delivery of specified quantities. An original Buy-In Intent expires on N+2, and if the shares still haven't come, the originating member executes the buy-in in the market under Procedure X and the cost lands on the members that failed.

**Regulation SHO close-out.** Separately from CNS, Rule 204 requires a clearing participant with a fail to deliver to close it out by borrowing or buying shares "by the beginning of regular trading hours on the settlement day following the settlement date." If the fail came from a long sale (the customer owned the shares but delivered late) or from bona fide market making, the deadline is the third consecutive settlement day after settlement date. A participant that misses the deadline is in the **penalty box**: neither it nor any broker clearing through it may sell that security short without first borrowing or arranging to borrow it, until the close-out purchase settles. Margin & Short Selling covers locates and the short side.

**Inside the broker,** a fail also triggers the customer protection rules: a customer's securities the firm failed to receive for more than 30 calendar days must be obtained "through a buy-in or otherwise" (Customer Protection, Net Capital & SIPC), and an aged fail moves through the reserve formula as a credit.

The settlement obligation's life as a state machine:

![The settlement obligation state machine. A row of states: pending, affirmed and settled, with the path between them accented and labeled matched, guaranteed and delivered at DTC; settled is a terminal state. A dashed exit labeled busted or not affirmed leads from pending down to the terminal canceled state. A dashed exit labeled short on settlement date leads from affirmed down to failed. From failed, a solid route labeled late delivery runs up to settled, a self-loop labeled marked to market, re-netted daily sits under it, and a dashed exit labeled buy-in executed leads right to the terminal bought_in state.](/diagrams/ida-settlement-states.svg "Most obligations go straight to settled. A fail stays open, marked and re-netted daily, until the shares arrive late or a buy-in or Regulation SHO close-out ends it.")

## Crypto by Contrast

A trade between two customers of the same crypto exchange has no clearing house, no settlement cycle and no fail. The exchange holds both customers' assets before the trade (prefunding), matches the orders, and moves the balances in its ledger in one transaction; the trade is final when it posts. The chain sees nothing until someone deposits or withdraws ([The Internal Ledger and the Chain](/books/investing-and-digital-assets/crypto-exchange-architecture#the-internal-ledger-and-the-chain)).

What that removes and what it adds:

- **No settlement risk between customers,** because nobody trades assets they don't already have on the platform. Margin and perpetual products bring the credit back, and the exchange's liquidation engine replaces the clearing fund (Perpetuals & Crypto Derivatives).
- **No central counterparty between venues.** An institution trading on several exchanges must prefund each one, and its exposure is to the exchange itself: the custodian, the matcher and, offshore, often the market maker are one firm. That concentration is what FTX's customers learned about. Off-exchange settlement networks, in which collateral stays at a custodian and venues settle net obligations on a schedule, are crypto's partial answer (Custody Platforms & Policy Engines).
- **On-chain settlement is final in a different sense.** A chain's finality rule decides when a transfer can't be undone, and a reorg can undo a deposit that looked settled. A securities settlement at DTC is final by rule; a chain settlement is final by consensus, after the confirmations the exchange decides to wait for.
- **Tokenized securities sit in between.** A tokenized stock or fund moved on chain still needs a legal record of ownership and, where the security is a DTC-eligible one, a path back to DTC; Tokenized Stocks & 24/7 Securities covers how that's being built.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model), where `settlements` already carries a trade date, settlement date, counterparty venue (the CCP), signed quantity and cash, status (`pending`, `affirmed`, `settled`, `failed`, `bought_in`, `canceled`) and `failed_since`. This chapter adds what goes to the clearing house, what comes back, the clearing fund, fails and buy-ins.

```sql
CREATE TABLE clearing_submissions (          -- each trade sent to the CCP, and its fate there
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  execution_id         UUID NOT NULL REFERENCES executions (id),
  ccp_venue_id         UUID NOT NULL REFERENCES venues (id),   -- NSCC, OCC
  clearing_firm        TEXT,                    -- null when self-clearing
  ccp_trade_ref        TEXT,                    -- the CCP's ID once accepted
  trade_date           DATE NOT NULL,
  settlement_date      DATE NOT NULL,           -- from the instrument's cycle and the calendar
  status               TEXT NOT NULL CHECK (status IN ('submitted', 'validated', 'rejected',
                         'guaranteed', 'canceled')),
  guaranteed_at        TIMESTAMPTZ,             -- novation: the CCP is now the counterparty
  affirmed_at          TIMESTAMPTZ,             -- institutional trades: 15c6-2 measures this
  settlement_id        UUID REFERENCES settlements (id),  -- the net obligation it rolled into
  UNIQUE (ccp_venue_id, ccp_trade_ref)
);

CREATE TABLE cns_positions (                 -- the CCP's view: one net position per security per day
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  instrument_id        UUID NOT NULL REFERENCES instruments (id),
  settlement_date      DATE NOT NULL,
  opening_fail_qty     NUMERIC(78, 0) NOT NULL DEFAULT 0,  -- signed: re-netted from prior days
  net_new_qty          NUMERIC(78, 0) NOT NULL,            -- signed: today's trades, netted
  closing_qty          NUMERIC(78, 0) NOT NULL,            -- what the CCP reports; positive long
  market_price         NUMERIC(38, 18) NOT NULL,           -- the CCP's current market price
  money_amount         BIGINT NOT NULL,                    -- signed USD cents for the security
  allocated_qty        NUMERIC(78, 0) NOT NULL DEFAULT 0,  -- delivered or received at DTC
  source_file          TEXT NOT NULL,                      -- the CCP report it was loaded from
  PRIMARY KEY (legal_entity_id, instrument_id, settlement_date)
);

CREATE TABLE clearing_fund_requirements (    -- every computation and call, the firm's and the CCP's
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  ccp_venue_id         UUID NOT NULL REFERENCES venues (id),
  source               TEXT NOT NULL CHECK (source IN ('ccp_call', 'internal_estimate')),
  computed_at          TIMESTAMPTZ NOT NULL,
  kind                 TEXT NOT NULL CHECK (kind IN ('start_of_day', 'intraday', 'special')),
  volatility_charge    BIGINT NOT NULL,          -- USD cents
  mark_to_market       BIGINT NOT NULL,
  excess_capital_premium BIGINT NOT NULL DEFAULT 0,
  other_charges        JSONB NOT NULL DEFAULT '{}',  -- gap risk, backtesting, liquidity, ...
  required_total       BIGINT NOT NULL,
  net_capital_used     BIGINT,                   -- the figure the ECP ratio divided by
  deposit_on_hand      BIGINT,
  due_by               TIMESTAMPTZ,              -- a call's deadline
  satisfied_at         TIMESTAMPTZ,
  waiver_ref           TEXT                      -- a documented CCP waiver, if any
);

CREATE TABLE settlement_fails (              -- each open fail and the clocks it starts
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  settlement_id        UUID NOT NULL REFERENCES settlements (id),
  direction            TEXT NOT NULL CHECK (direction IN ('to_deliver', 'to_receive')),
  quantity             NUMERIC(78, 0) NOT NULL CHECK (quantity > 0),
  cause                TEXT NOT NULL CHECK (cause IN ('customer_long_sale', 'customer_short_sale',
                         'market_making', 'firm', 'contra_party', 'unknown')),
  failed_on            DATE NOT NULL,            -- the settlement date that was missed
  closeout_due         TIMESTAMPTZ,              -- Rule 204: next settlement day's open, or third
  possession_due       DATE,                     -- 15c3-3(d): 30 calendar days for fails to receive
  resolved_on          DATE,
  resolution           TEXT CHECK (resolution IN ('delivered', 'received', 'borrowed',
                         'bought_in', 'canceled'))
);

CREATE TABLE buy_ins (                       -- buy-ins the firm starts and buy-ins against it
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  settlement_fail_id   UUID NOT NULL REFERENCES settlement_fails (id),
  role                 TEXT NOT NULL CHECK (role IN ('originator', 'retransmittal_recipient',
                         'reg_sho_closeout')),
  quantity             NUMERIC(78, 0) NOT NULL CHECK (quantity > 0),
  submitted_at         TIMESTAMPTZ NOT NULL,
  expires_on           DATE,                     -- an original Buy-In Intent: N+2
  executed_at          TIMESTAMPTZ,
  execution_id         UUID REFERENCES executions (id),  -- the purchase that closed it
  cost_difference      BIGINT,                   -- USD cents charged to the failing party
  status               TEXT NOT NULL CHECK (status IN ('submitted', 'retransmitted', 'satisfied',
                         'executed', 'expired', 'canceled'))
);
```

Every trade in a security must appear once in the CCP's view, so the nightly check sums per-trade obligations into what CNS reported:

```sql
WITH firm AS (
  SELECT s.legal_entity_id, s.instrument_id, s.settlement_date,
         SUM(s.deliver_quantity) AS firm_net_qty
  FROM settlements s
  WHERE s.counterparty_venue_id = :nscc
    AND s.settlement_date = :date
    AND s.status <> 'canceled'
  GROUP BY 1, 2, 3
)
SELECT COALESCE(o.instrument_id, c.instrument_id) AS instrument_id,
       COALESCE(o.firm_net_qty, 0) + COALESCE(c.opening_fail_qty, 0) AS expected_qty,
       COALESCE(c.closing_qty, 0) AS ccp_qty
FROM firm o
FULL JOIN cns_positions c
  ON c.legal_entity_id = o.legal_entity_id
 AND c.instrument_id = o.instrument_id
 AND c.settlement_date = o.settlement_date
WHERE COALESCE(o.firm_net_qty, 0) + COALESCE(c.opening_fail_qty, 0)
      <> COALESCE(c.closing_qty, 0);
-- every row is a recon_break against the CCP: a trade booked here that it rejected,
-- a trade it guaranteed that was never booked here, or a fail closed here and not there
```

Design notes:

- **Three records of one trade, reconciled nightly:** the customer's execution and ledger lines, the firm's net `settlements` row per security and date, and the CCP's `cns_positions` row from its report. Breaks go to `recon_breaks` against a `reconciliations` row with source `clearing_firm` or the CCP ([Reconciliation and Break](/books/investing-and-digital-assets/investing-business#the-core-data-model)).
- **Settlement dates come from a calendar service,** keyed by instrument and market, with holidays and early closes, because T+1 means "next business day" and the cycle differs by instrument.
- **The clearing fund estimate is a time series,** written every run with its inputs, next to the CCP's calls, so the firm can show its regulators and its board that it saw the call coming.
- **Fails carry their cause.** A fail from a customer's long sale has a different Regulation SHO deadline, a different customer conversation and a different reserve treatment than a fail from the firm's own short; deriving the cause later from the trade history is how deadlines are missed.
- **Emit events:** `clearing_submission.rejected`, `settlement.failed`, `buy_in.received`, `clearing_fund.call` and `clearing_fund.estimate_breach` go to operations, treasury and risk through the outbox ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

Clearing records are examined by FINRA and the SEC, sampled by the clearing house, and reconstructed after any default:

- **Every clearing submission** with its acceptance, rejection or guarantee time and the net obligation it joined, so any trade can be traced from fill to settlement.
- **Each night's CCP reports as received,** stored unchanged, with the reconciliation run against them and every break's cause and resolution.
- **Every clearing fund computation and call,** internal and external, with the inputs, the deposit on hand, when it was met and how it was funded.
- **Every fail** with its cause, close-out deadline and how it ended, and every buy-in sent or received with its cost.
- **Affirmation completion rates** against the targets in the firm's Rule 15c6-2 policies, measured and documented as the rule requires.
- **Decisions to restrict trading** when clearing costs spiked, with who decided, on what estimate and when, because regulators and customers will ask.

## What This Means for the System You Build

- **Compute the settlement date per execution** from the instrument and a market calendar; T+1 is a rule, not a constant.
- **Keep the per-trade view and the CCP's net view,** and reconcile them every night before positions are used for anything else.
- **Estimate your clearing deposit intraday** with a model you understand, alert on the ratio to net capital, and stress it per concentrated name.
- **Decide your levers before the call comes:** funding lines, per-symbol limits, margin changes and buy restrictions, with the authority to use each written down.
- **Track every fail with its cause and clocks** (Regulation SHO close-out, the 30-day possession deadline, buy-ins).
- **Measure same-day affirmation** if you serve institutions; the rule requires the metric.
- **On a crypto venue, know that prefunding moved the risk,** from settlement to custody and to the venue itself.

## References

**Law and regulation**

- [17 CFR 240.15c6-1: Settlement cycle](https://www.law.cornell.edu/cfr/text/17/240.15c6-1), "later than the first business day after the date of the contract", the exempted instruments and the T+2 exception for late-priced firm-commitment offerings
- [17 CFR 240.15c6-2: Same-day confirmation, allocation and affirmation](https://www.law.cornell.edu/cfr/text/17/240.15c6-2), agreements or written policies, "no later than the end of the day on trade date", target times and completion rates
- [17 CFR 242.204: Close-out requirement](https://www.law.cornell.edu/cfr/text/17/242.204), the next settlement day's open, the third settlement day for long sales and market making, the pre-borrow penalty
- [17 CFR 240.15c3-3: Customer protection, reserves and custody of securities](https://www.law.cornell.edu/cfr/text/17/240.15c3-3), (d)(2) the 30-day deadline for fails to receive

**Regulators and guidance**

- [SEC: Press release 2023-29 (February 15, 2023)](https://www.sec.gov/newsroom/press-releases/2023-29), T+1 adoption, the May 28, 2024 compliance date, same-day affirmation, adviser records and central matching service providers
- [SEC Staff Report on Equity and Options Market Structure Conditions in Early 2021 (October 14, 2021)](https://www.sec.gov/files/staff-report-equity-options-market-struction-conditions-early-2021.pdf), the Clearing Fund's 99th percentile parametric VaR, intraday and special charges, the ECP, the January 27, 2021 calls of $6.9 billion on 36 members, the January 28 waiver and the $1.4 billion requirement, OCC's 16 participant exchanges
- [FINRA Rule 4311: Carrying agreements](https://www.finra.org/rules-guidance/rulebooks/finra-rules/4311), FINRA approval and the functions each agreement must allocate

**Standards and protocols**

- [DTCC: Continuous Net Settlement](https://www.dtcc.com/clearing-services/equities-clearing-services/cns), one position per security per member, novation, fails marked to market and re-netted, book-entry settlement at DTC, $5.55 trillion in a day, 98.6% netting and $18.3 billion average margin (Q3 2026)
- [NSCC Rules & Procedures](https://files.dtcc.com/download/assets/nscc_rules.pdf/85bda02a369211f0a3ae820bd5ac0897), Rule 11 sections 6 and 7 (extra mark-to-market, Buy-In Intents), Procedure VII section J (CNS Retransmittal Notices, N+1 and N+2), Procedure XV (volatility charge, gap risk, intraday charges, the Excess Capital Premium formula and waiver, the $250,000 minimum and 40% cash)

**Filings**

- [Interactive Brokers: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1381197/000138119726000062/ibkr-20251231.htm), US activity "entirely self-cleared" and its clearing memberships

**Vendor documentation**

- [Apex Fintech Solutions](https://apexfintechsolutions.com/), AscendOS for clearing, custody and trading, $280 billion or more of assets under custody and 42 million or more accounts as of September 30, 2026
- [Alpaca: About Broker API](https://docs.alpaca.markets/docs/about-broker-api), fully disclosed, omnibus and RIA setups
