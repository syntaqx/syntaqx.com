+++
title = "Extended Hours & 24-Hour Trading"
nav_title = "24-Hour Trading"
description = "Pre-market, after-hours and overnight stock trading: Blue Ocean and other ATSs, 23/5 exchange sessions from December 2026, and the plumbing behind them."
category = "Investing & Digital Assets Industry"
order = 2522
part = "Trading and Markets"
tags = ["investing", "market-structure", "extended-hours", "overnight-trading", "clearing", "operations"]
+++

US stocks have traded outside 9:30 to 4:00 for a long time, but only part of the day. Exchanges run a pre-market session from 4:00 am and an after-hours session to 8:00 pm Eastern, and a handful of alternative trading systems have filled the night: Blue Ocean, Bruce, IBKR Eos and MOON, matching orders from brokers whose customers are awake in Asia or simply awake. Robinhood calls itself "the first U.S. broker to offer around-the-clock trading of individual stocks, 24 hours a day, 5 days a week"; Interactive Brokers offers more than 10,000 US stocks and ETFs "nearly 24 hours a day, five days a week." What the night has lacked is the infrastructure the day takes for granted: no consolidated quote from the SIPs, no exchange, no LULD bands, and one venue per broker. When that one venue failed on August 5, 2024, overnight trading on the brokers that used it simply stopped.

That changes on December 6, 2026, the date the industry set for 23/5 trading on exchanges. Five exchanges (24X, Nasdaq, NYSE Arca, Cboe EDGX and MEMX) have SEC approval for overnight sessions, and around them the SIPs, NSCC, FINRA's trade reporting facilities, the Consolidated Audit Trail and the LULD plan have all moved their clocks. The hardest change for a broker is the smallest-looking one: the trade date now rolls at 8:00 pm Eastern, not midnight. This chapter covers the sessions as they are, the overnight ATSs and the Blue Ocean outage, the exchange approvals and every plan change behind them, a full week's timeline with the clearing cutoffs, crypto's 24/7 market as the comparison, and what it takes to run a broker that never closes. Order types, time in force and session eligibility are [Orders & Order Types](/books/investing-and-digital-assets/orders-and-order-types#extended-hours-and-notional-orders); the venues, the NBBO and the SIPs are [US Equity Market Structure](/books/investing-and-digital-assets/equity-market-structure#sips-and-direct-feeds); LULD in regular hours and circuit breakers are [Pre-Trade Risk, Halts & Volatility](/books/investing-and-digital-assets/pre-trade-risk-and-halts#limit-up-limit-down).

## How the Platforms Do It

Overnight trading as each firm describes it, as of November 2026, before exchange overnight sessions begin:

| Firm | What it offers | Venue | Rules it states |
| --- | --- | --- | --- |
| **Alpaca** (brokerage API) | Overnight 8:00 pm to 4:00 am ET, Sunday to Friday, for all NMS securities its asset list marks `overnight_tradable` | Blue Ocean ATS, with a Blue Ocean data feed (`feed=boats`) sold monthly | Limit orders only; `day` or `gtc`; trade date from execution time, settlement T+1; no day-trading buying power overnight, 2x margin at most |
| **Interactive Brokers** | More than 10,000 US stocks and ETFs "nearly 24 hours a day, five days a week," aimed at customers in Asia | Its own ATS, which SmartRouting checks for resting interest first | Real-time margin across products and automatic real-time liquidation |
| **Robinhood** | 24 Hour Market: individual stocks and ETFs around the clock, five days a week | Overnight venues not named in the section of the 10-K I read | The 24 Hour Market was the product halted on August 5, 2024 |

The shared shape is clear even where details differ. **Limit orders only**, because there is no consolidated quote to protect a market order. **One venue at a time**, because the overnight ATSs aren't linked to each other the way exchanges are by Reg NMS. **Trade date by execution time**, so an order filled at 9 pm Monday is a Tuesday trade. All three survive the move to exchanges: the five exchanges will also accept only limit orders overnight.

## The Sessions Today

A US trading day, before December 6, 2026, has three exchange sessions and one ATS session:

| Session | Hours (ET) | Who runs it | What's different |
| --- | --- | --- | --- |
| **Pre-market** | 4:00 am to 9:30 am | Exchanges and ATSs | Thin books, wide spreads, no opening auction yet |
| **Core** | 9:30 am to 4:00 pm | Everyone | The NBBO, LULD, auctions at open and close, market makers' quoting obligations |
| **After-hours** | 4:00 pm to 8:00 pm | Exchanges (24X's post-market runs to 7:00 pm) and ATSs | Earnings news lands here |
| **Overnight** | 8:00 pm to 4:00 am, Sunday to Thursday nights | ATSs only | No SIP, no exchange, no LULD bands |

Market makers on 24X must quote only during regular trading hours, and the SEC's order notes they "would have no such obligations during the Pre-Market, Post-Market or 24X Market Sessions." Outside the core session, liquidity is whatever shows up.

FINRA Rule 2265 makes a broker that offers extended-hours trading give customers a risk disclosure first, posted on its website if trading or account opening is online. It names six risks: lower liquidity, higher volatility, changing prices, unlinked markets, news announcements and wider spreads. The exchanges' own rules (24X Rule 3.21, Cboe EDGX Rule 3.21, MEMX Rule 3.21, NYSE Arca Rule 7.34-E(T)(d)(3), Nasdaq Equity 2, Section 20) require similar disclosures. Best execution (FINRA Rule 5310) applies overnight with no special carve-out; FINRA's Regulatory Notice 26-15 asked for comment on whether extended hours need more guidance, and FINRA hadn't proposed a rule change as of the September 2026 review I read. Supervision under Rule 3110 has to cover the new hours too, which in practice means staffing surveillance, market access, compliance, technology and security through the night.

The `disclosures` table holds the 2265 statement with its version and delivery ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)); the order system checks for it before it accepts an order flagged for extended hours.

## Overnight ATSs and the 2024 Halt

The SEC staff's memo of September 10, 2026, with data through August, put overnight volume at about 0.9% of total NMS share volume on an average trade date, up about 359% from a year earlier. It's small and growing fast, and in 2024 nearly all of it ran through one venue per broker.

On Monday, August 5, 2024, global markets fell hard: Japan's Nikkei 225 fell 12.4% and the S&P 500 dropped 4% in early trading. In the overnight session before the US open, Blue Ocean, the ATS behind Robinhood's 24 Hour Market, failed. Robinhood's customers saw the 24 Hour Market as "unavailable," some overnight trades were canceled, and Blue Ocean reopened for the August 7 session at 8 pm. Its CEO said "Blue Ocean had a technology issue," that its platform was "scaled to handle roughly about 50 million different messages on any given night," and that a database had failed under the volume, about 80% of which came from trades originating in Asia.

The lesson for a broker isn't about one vendor. **A session with one venue has no failover.** In the core session a router that loses an exchange sends the order elsewhere; overnight in 2024 there was nowhere else to send it. **Canceled trades are a ledger event.** A fill the venue later cancels has to reverse cleanly: the journal entry, the position, the buying power the customer already used to place another order, the confirmation already sent ([Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions#buying-power)). **The night is when Asia trades,** so a broker serving customers there sees its peak when its US staff are asleep.

## 23/5 on Exchanges

Five exchanges have conditional SEC approval to trade NMS stocks overnight, as of November 2026:

| Exchange | Approval | Federal Register |
| --- | --- | --- |
| **24X National Exchange** | Registration order, Release 34-101777, November 27, 2024 | 89 FR 97092 (December 6, 2024) |
| **Nasdaq** | Release 34-105199, April 10, 2026 | 91 FR 20222 (April 15, 2026) |
| **NYSE Arca** | Release 34-105532, May 21, 2026 | 91 FR 31509 (May 27, 2026) |
| **Cboe EDGX** | Release 34-105587, May 29, 2026 | 91 FR 33238 (June 3, 2026) |
| **MEMX** | Release 34-106310, September 9, 2026 | 91 FR 58185 (September 14, 2026) |

24X was the template. The SEC approved its registration as a national securities exchange with a "24X Market Session" from 8 pm to 4 am, Sunday through Thursday nights before a US business day; its second amendment dropped weekend and holiday trading from the original plan. The approval came with a condition that every later exchange shares: "The Equity Data Plans do not operate during the time period that will cover the 24X Market Session," so under its Rule 1.5(c) 24X won't start that session until the SIPs "have established a mechanism to collect, consolidate, process and disseminate quotation and transaction information" and have told it they're ready. During the session "the only order type that may be submitted is a Limit Order"; market and pegged orders aren't eligible. For erroneous trades it relies on its clearly erroneous rule (Rule 11.14), as the other four exchanges will rely on theirs (Cboe EDGX 11.15, MEMX 11.15, Nasdaq 11890, NYSE Arca 7.10-E).

The common session, as proposed: overnight from 8:00 pm to 4:00 am ET Sunday through Thursday, with a mandatory one-hour pause from 8:00 to 9:00 pm Monday through Thursday. Exchange representatives reaffirmed the December 6, 2026 start at the SEC's roundtable on September 17, 2026; as of the late-September review I read, overnight exchange trading hadn't started because the SIPs weren't yet live for it.

## What Had to Change Around the Exchanges

An exchange session is only useful if the plumbing behind it runs too. Each piece needed its own filing and approval:

| System | Change | Authority | From |
| --- | --- | --- | --- |
| **SIPs** (CTA/CQ and UTP plans) | Operate 9:00 pm ET Sunday to 8:00 pm ET Friday, with a one-hour technical pause 8:00 to 9:00 pm Monday to Thursday | Releases 34-105779 and 34-105780, approved June 26, 2026 | December 6, 2026 |
| **NSCC** | Clearing hours 8:00 pm ET Sunday through 8:00 pm ET Friday | Release 34-105565, May 27, 2026 (91 FR 32491) | Live June 29, 2026 |
| **FINRA TRFs** | From 4:00 am to 8:00 pm weekdays, to 9:00 pm Sunday through 8:00 pm Friday, with the same 8 to 9 pm pause | Release 34-105922, July 15, 2026 (91 FR 45299) | December 6, 2026 |
| **CAT** | Industry member "Trade Date" redefined from midnight-to-midnight to 8:00 pm ET the preceding calendar day through 8:00 pm the same day; weekends and holidays still aren't trade dates; reporting deadlines unchanged | CAT Alert 2026-02, September 23, 2026 | December 6, 2026 |
| **LULD** | Static overnight price bands, 9:00 pm to 4:00 am | Release 34-106042, August 5, 2026 (91 FR 51515) | Expected December 6, 2026 |
| **Market-wide circuit breakers** | Thresholds unchanged (7%, 13%, 20%); after a Level 3 halt, trading resumes no earlier than 4:00 am the next day | Exchange and FINRA rule filings | Several already effective |
| **Corporate-action halts** | Mandatory halt from 8:00 pm the evening before a covered action's market effective date, through the overnight session, reopening at 8:00 am; every exchange must follow the primary's halt | Releases 34-105860 (Nasdaq), 34-105862 (NYSE Arca), July 8, 2026; 34-106323 (Cboe BZX), September 10, 2026 | With overnight trading |

Three of these change what a broker's systems compute.

**The trade date.** Under the CAT definition and the TRF hours, an execution after 8:00 pm belongs to the next trade date. Alpaca's documentation already works this way for its Blue Ocean flow ("a 9:00 PM ET Monday trade has a Tuesday trade date and settles Wednesday") and says trade dates "would roll at 8:00 PM" under the new FINRA rules. Every system that groups by trade date (confirms, the stock record, CAT reporting, wash sale windows, day-trade counting, statements) has to take it from the execution timestamp through one function, not from the calendar date of the timestamp.

**Overnight LULD bands.** In the overnight session the bands are static for the whole session. Reference prices are the official closing price and the consolidated last round-lot sale as of 7:45 pm, adjusted for corporate actions; the lower band is 20% below the lower reference and the upper band 20% above the higher one, with minimum band widths of $1.00 for stocks that closed under $1.00 and $3.00 for the rest; leveraged ETPs scale the 20% and the minimums by their leverage. Hitting a band doesn't trigger a pause; trading centers must have policies to prevent trades and displayed prices outside the bands, and the primary exchange may declare a regulatory halt, after which the stock doesn't reopen overnight.

**Corporate-action halts.** The covered actions are symbol changes, CUSIP changes, large dividends, splits, de-SPAC transactions, spinoffs, security type changes, mergers and similar share exchanges, and anything else the primary market thinks needs a halt. The point is to stop trading while the security's identity or price basis changes underneath it, so the night before a split no one trades the old shares at the old price after the books have been adjusted ([Corporate Actions & Asset Events](/books/investing-and-digital-assets/corporate-actions#splits-and-reverse-splits)).

### Worked numbers: overnight bands

A stock closes at $50.00 and its last consolidated round-lot sale at 7:45 pm is $51.00. The lower reference is $50.00, so the lower band is $50.00 × 0.80 = $40.00; the upper reference is $51.00, so the upper band is $51.00 × 1.20 = $61.20. The band widths ($10.00 and $10.20) exceed the $3.00 minimum, so they stand. A limit buy at $62.00 entered overnight can rest, but it can't execute above $61.20, and a broker's pre-trade check should say so before sending it.

A stock that closes at $4.00 with a 7:45 pm sale of $4.00 has 20% bands of $0.80 each way, under the $3.00 minimum; the minimum applies, and the bands are $1.00 and $7.00. For a low-priced stock the minimum, not the percentage, is the band.

## A Week Without a Close

The worked timeline for the first week of exchange overnight trading, Sunday, December 6 through Friday, December 11, 2026, all times Eastern:

| When | What happens | What the broker does |
| --- | --- | --- |
| Sunday 8:00 pm | NSCC's week opens (live since June 29); the exchanges' overnight session is approved to start | Load the week's calendars, overnight-eligible list and halts |
| Sunday 9:00 pm | SIPs and TRFs start; overnight LULD bands apply | Overnight orders can route to exchanges and ATSs with a consolidated quote |
| Monday 4:00 am | Overnight session ends; pre-market starts | Bands switch to the regular-hours regime |
| Monday 9:30 am to 4:00 pm | Core session | Opening and closing auctions; market orders allowed |
| Monday 4:00 pm to 8:00 pm | After-hours | Limit orders only on most venues |
| Monday 7:45 pm | Reference price for tonight's overnight bands is set | Snapshot bands for tonight; sync the overnight-eligible list (Alpaca updates `overnight_tradable` from 7:05 to 7:45 pm and recommends syncing at 7:55 pm) |
| Monday 8:00 pm | Trade date rolls to Tuesday; SIPs, TRFs and exchanges pause; corporate-action halts for Tuesday's actions begin | Close Monday's books: day orders expire, Monday's confirms, stock record and CAT trade date close; re-check buying power for orders that carry into the night |
| Monday 8:00 to 9:00 pm | Exchange maintenance pause | Alpaca re-routes exchange-bound overnight orders to ATSs where they are operating |
| Monday 9:00 pm | Overnight session resumes on exchanges | Fills now carry Tuesday's trade date and settle Wednesday |
| Thursday 10:00 pm | An overnight fill | Trade date Friday, settles Monday, December 14 |
| Friday 7:30 pm | An after-hours fill | Trade date Friday, settles Monday |
| Friday 8:00 pm | SIPs, TRFs and NSCC stop until Sunday 8:00 pm; no Friday overnight session | Weekend: corporate-action processing, statements, releases |

Holidays cut nights out. Alpaca's rule for its overnight flow is that the overnight session immediately before a full market holiday doesn't run. Christmas falls on Friday, December 25, 2026: an execution on Wednesday night, December 23 at 9:30 pm has trade date Thursday, December 24, and settles on the next business day, Monday, December 28, because T+1 counts business days ([Business Dates, Business Days and Holidays](/docs/fundamentals/time#business-dates-business-days-and-holidays)). There's no overnight session on Thursday night.

The 8:00 pm roll is the broker's new end of day, and it arrives while trading continues an hour later. Anything a firm used to run "after the close" (expiring day orders, computing the day's margin, posting the day's fees, building CAT files) now runs in a one-hour window or against a live book. Margin is the sharpest case: Alpaca rejects orders at 8:00 pm for insufficient buying power and doesn't apply day-trading buying power overnight, capping margin at 2x.

## Crypto's 24/7 as the Comparison

Crypto venues already never close, so a broker that runs both has a 24/7 matching engine and ledger in house already ([How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture#the-components)). Three things make crypto's 24/7 easier than equities' 23/5:

- **Settlement is the trade.** A crypto exchange matches against prefunded balances in its own ledger; there's no NSCC, no T+1 and no trade date to roll. Equities overnight still settle through NSCC and DTC on business days, so the trade date and the settlement calendar have to agree.
- **No consolidated quote.** Each crypto venue is its own market, and best execution across them is a routing problem ([Order Routing, PFOF & Best Execution](/books/investing-and-digital-assets/routing-and-best-execution#crypto-best-execution)). Equities overnight needed the SIPs to run before exchanges could open, because Reg NMS and LULD are built on a consolidated quote.
- **The fiat edge still closes.** A crypto exchange runs all weekend, but Fedwire and ACH don't, so dollar deposits and withdrawals queue until Monday. The CFTC's request for comment on extending standard futures to 24/7 trading (91 FR 38335, June 25, 2026, comments extended to August 26, 2026 at 91 FR 47158) asks the same question for futures: how margin calls and settlement work "when traditional payment systems do not operate." It also asks whether 24/7 contracts should carry "an additional initial-margin buffer in advance of weekend or extended-holiday closures." [Futures & FCMs](/books/investing-and-digital-assets/futures-and-fcms#crypto-futures-in-the-us) covers the futures side.

## Operating a Broker That Never Closes

Most of a broker's operating calendar assumes a night. Taking the night away moves each piece:

- **End of day becomes 8:00 pm, and the pause is short.** The batch work that defined a business day (expirations, margin, fees, books and records) has to finish in an hour or run incrementally against a live book. My default is to make each of them a computation over a closed trade date that can run while the next one trades, keyed by trade date, never by wall clock.
- **Releases and maintenance need a window that isn't there.** The weekend is the only full stop for equities; anything that touches order entry deploys on the weekend or behind a flag that can switch a session off without a deploy ([Background Jobs](/docs/architecture/background-jobs)).
- **Every session is a product setting.** Which instruments trade overnight, which order types each session accepts, whether margin and short sales are allowed overnight: each is data per session, checked before the order leaves, because the venues reject what they don't accept and a rejection at 2 am is a support ticket in the morning.
- **Halts arrive on a schedule.** Corporate-action halts start at 8:00 pm the night before the action, and a halted stock stays halted overnight. Orders for it are accepted and held (Alpaca returns `accepted` and holds them) or rejected; either way the customer needs to see why.
- **Market data is a separate entitlement.** Before the SIPs run overnight, the night's quotes come from each ATS; Alpaca sells a Blue Ocean feed separately, with indicative quotes in real time and trades delayed 15 minutes. After December 6 the SIPs carry the night, and the entitlement and display rules follow ([Market Data](/books/investing-and-digital-assets/market-data#entitlements-delayed-data-and-display-rules)).
- **Support and surveillance staff the night.** Rule 3110 supervision, Rule 15c3-5 market access controls and best execution reviews all run on the same clock as trading.
- **A venue outage needs a plan, not a retry.** With one ATS, an outage means the session is gone; with five exchanges and several ATSs, routing can fail over, and the system needs a rule for what to do with orders resting on a venue that disappears.

## How to Build It

The core model has `venues` and `orders` ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)). US Equity Market Structure already generates `venue_sessions`, one row per venue, session and trade date, and Orders & Order Types gives each order its `session_eligibility` ([How to Build It](/books/investing-and-digital-assets/equity-market-structure#how-to-build-it)). This chapter adds the rules those rows are generated from (each venue session's days, hours, order types and dependencies), the calendar that defines a trade date as a pair of instants, the trade date on every execution, and the nightly overnight list:

```sql
CREATE TABLE trading_sessions (            -- one venue's session, effective-dated
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  venue_id            UUID NOT NULL REFERENCES venues (id),
  session             TEXT NOT NULL CHECK (session IN ('pre_market', 'core', 'post_market',
                        'overnight', 'continuous')),   -- 'continuous' for 24/7 crypto venues
  days                SMALLINT[] NOT NULL,   -- ISO weekdays the session starts on (7 = Sunday)
  opens_at            TIME NOT NULL,         -- local time in tz
  closes_at           TIME NOT NULL,         -- may be earlier than opens_at: crosses midnight
  tz                  TEXT NOT NULL DEFAULT 'America/New_York',
  order_types         TEXT[] NOT NULL,       -- '{limit}' overnight
  time_in_force       TEXT[] NOT NULL,       -- '{day,gtc}'
  margin_allowed      BOOLEAN NOT NULL,
  short_sale_allowed  BOOLEAN NOT NULL,
  requires_disclosure TEXT,                  -- 'finra_2265' for extended hours
  depends_on          TEXT[] NOT NULL DEFAULT '{}',  -- '{sip}' for exchange overnight
  valid_during        TSTZRANGE NOT NULL,
  EXCLUDE USING gist (venue_id WITH =, session WITH =, valid_during WITH &&)
);

CREATE TABLE session_calendars (           -- trade dates per market, with holidays and pauses
  market              TEXT NOT NULL,         -- 'us_equities', 'us_options', 'cme_globex'
  trade_date          DATE NOT NULL,
  starts_at           TIMESTAMPTZ NOT NULL,  -- 8:00 pm ET the prior calendar day for US equities
  ends_at             TIMESTAMPTZ NOT NULL,  -- 8:00 pm ET on trade_date
  settles_on          DATE NOT NULL,         -- T+1 business day
  overnight_runs      BOOLEAN NOT NULL,      -- false the night before a full holiday
  early_close_at      TIMESTAMPTZ,
  pauses              TSTZRANGE[] NOT NULL DEFAULT '{}',  -- 8-9 pm Monday to Thursday
  source_ref          TEXT NOT NULL,         -- the plan or exchange notice
  PRIMARY KEY (market, trade_date),
  CHECK (starts_at < ends_at)
);

ALTER TABLE venue_sessions ADD COLUMN trading_session_id UUID REFERENCES trading_sessions (id);
ALTER TABLE executions ADD COLUMN trade_date DATE;   -- from session_calendars, never from executed_at::date

CREATE TABLE overnight_eligibility (       -- the nightly list, as synced from each venue
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  venue_id            UUID NOT NULL REFERENCES venues (id),
  trade_date          DATE NOT NULL,
  eligible            BOOLEAN NOT NULL,
  halted              BOOLEAN NOT NULL DEFAULT FALSE,
  lower_band          NUMERIC(38, 18),       -- static overnight LULD bands
  upper_band          NUMERIC(38, 18),
  synced_at           TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (instrument_id, venue_id, trade_date)
);
```

Three choices carry the design:

- **The trade date is looked up, not computed from a timestamp's date.** `session_calendars` holds each trade date's start and end instants; an execution's trade date is the row whose range contains `executed_at`. The same lookup serves confirms, CAT, the stock record, wash sale windows and statements, and a holiday or an early close is a row, not a code change.
- **Sessions are effective-dated rows,** so December 6 is a new row for each exchange's overnight session rather than a deploy, and a question about what a session allowed on a past night is a query ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **The overnight list is a dated snapshot.** Eligibility, halts and bands change every evening; storing them per trade date explains every overnight rejection afterwards.

The trade-date function, the one place that knows about 8:00 pm:

```go tab="Go"
// TradeDate returns the US equities trade date an execution belongs to.
// Calendar rows hold [starts_at, ends_at) for each trade date, from the
// exchange and plan calendars; weekends and holidays have no row.
func TradeDate(cal []CalendarDay, executedAt time.Time) (time.Time, error) {
	i := sort.Search(len(cal), func(i int) bool { return cal[i].EndsAt.After(executedAt) })
	if i == len(cal) || executedAt.Before(cal[i].StartsAt) {
		return time.Time{}, fmt.Errorf("no trade date covers %s", executedAt.Format(time.RFC3339))
	}
	return cal[i].TradeDate, nil
}
```

```rust tab="Rust"
/// Returns the US equities trade date an execution belongs to.
/// Calendar rows hold [starts_at, ends_at) for each trade date, from the
/// exchange and plan calendars; weekends and holidays have no row.
pub fn trade_date(cal: &[CalendarDay], executed_at: DateTime<Utc>) -> Result<NaiveDate, String> {
    let i = cal.partition_point(|d| d.ends_at <= executed_at);
    match cal.get(i) {
        Some(d) if d.starts_at <= executed_at => Ok(d.trade_date),
        _ => Err(format!("no trade date covers {}", executed_at.to_rfc3339())),
    }
}
```

An execution that falls in no trade date (a weekend fill from a misconfigured venue) is an error to investigate, never a fill to assign to the nearest day.

## Auditing

- **What session each order traded in.** Every order with its session, the session row's version, the venue and the trade date assigned, so a best execution review can compare overnight fills with the quotes that existed then.
- **The risk disclosure before the first extended-hours order.** The Rule 2265 statement as delivered, with its version and time, joined to the account's first extended-hours order.
- **Every overnight list and band snapshot.** Which instruments were eligible, halted or banded each night, and when the list was synced, because "why was my order rejected at 2 am" is answered from it.
- **Every venue cancellation.** Trades a venue canceled after the fact (as on August 5, 2024) with the reversal entries and the customer notices they produced.
- **CAT trade dates that match the books.** A daily check that each execution's trade date in the CAT submission, the confirm and the stock record is the same date.

## What This Means for the System You Build

- **Derive the trade date from a calendar of instants,** with the 8:00 pm roll, holidays and pauses as rows, and use the one function everywhere.
- **Make sessions data:** hours, order types, time in force, margin and short-sale rules per venue session, effective-dated, checked before routing.
- **Accept only limit orders outside the core session** and price-check them against the night's static bands.
- **Deliver and record the Rule 2265 disclosure** before the first extended-hours order.
- **Move end-of-day work to a closed trade date,** so it runs during the 8 to 9 pm pause or while the next trade date trades.
- **Plan for a venue that disappears mid-session,** with failover rules and clean reversals for canceled fills.
- **Snapshot the nightly eligibility list, halts and bands** per trade date.
- **Staff surveillance, support and market access controls for the hours you trade.**

## References

**Law and regulation**

- [SEC: In the Matter of the Application of 24X National Exchange LLC for Registration as a National Securities Exchange; Findings, Opinion, and Order of the Commission (Release 34-101777, 89 FR 97092, December 6, 2024)](https://www.federalregister.gov/documents/full_text/html/2024/12/06/2024-28551.html), the 24X Market Session from 8 pm to 4 am Sunday through Thursday, the SIP readiness condition (Rule 1.5(c)), limit orders only overnight, the removal of weekend and holiday trading, market maker obligations in regular hours only, and the clearly erroneous rule
- [Federal Register: 24X National Exchange documents, 2024](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%2224X+National+Exchange%22&conditions[publication_date][gte]=2024-01-01&conditions[publication_date][lte]=2025-03-01&order=oldest&per_page=20), the application notices, proceedings and the registration order

**Regulators and guidance**

- [CAT NMS Plan: CAT Alert 2026-02, 23x5 trading CAT reporting requirements (September 23, 2026)](https://www.catnmsplan.com/cat-alerts/cat-alert-2026-02-23x5-trading-cat-reporting-requirements), the revised Trade Date tied to the December 6, 2026 overnight session and no change to reporting deadlines
- [CFTC: Request for Comment on the Extension of Standard Futures Contracts to 24/7 Trading (91 FR 38335, June 25, 2026)](https://www.federalregister.gov/documents/full_text/html/2026/06/25/2026-12784.html), margin calls and settlement when payment systems are closed, and weekend initial margin buffers
- [CFTC: Comment period extension (91 FR 47158, July 28, 2026)](https://www.federalregister.gov/api/v1/documents/2026-15216.json), comments extended to August 26, 2026

**In practice**

- [WilmerHale: 23x5 Trading Comes to US Exchanges (September 29, 2026)](https://www.wilmerhale.com/en/insights/client-alerts/20260929-23x5-trading-comes-to-us-exchanges-what-firms-should-know-before-launch), the five exchange approvals with release and Federal Register numbers, the session and pause, the SIP, NSCC and TRF approvals and hours, the CAT trade date, overnight LULD bands, circuit breakers, corporate-action halts, clearly erroneous rules, the overnight ATSs, the SEC staff memo's 0.9% and 359%, FINRA Rules 5310, 2265 and 3110 and Regulatory Notice 26-15, and the December 6, 2026 launch reaffirmed September 17, 2026
- [WEAR-TV: Blue Ocean CEO denies Robinhood outage was meant to quell volatile market (August 6, 2024)](https://weartv.com/news/nation-world/blue-ocean-ceo-denies-robinhood-outage-was-meant-to-quell-volatile-market-unrelated-stock-market-crypto-wall-street-economy-stocks-prices-tech-silicon-valley), the August 5, 2024 halt of Robinhood's 24 Hour Market, canceled overnight trades, the CEO's statements on the technology issue, capacity and Asian volume, the reopening on August 7, and that day's market moves

**Filings**

- [Robinhood Markets: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000023/hood-20251231.htm), around-the-clock trading of individual stocks and ETFs five days a week
- [Interactive Brokers Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1381197/000138119726000062/ibkr-20251231.htm), overnight trading of more than 10,000 US stocks and ETFs, its ATS, and real-time margin and liquidation

**Vendor documentation**

- [Alpaca: 24/5 trading](https://docs.alpaca.markets/docs/245-trading), Blue Ocean as the overnight venue and feed, limit orders only, trade date by execution time and T+1, holidays, overnight halts, buying power, the `overnight_tradable` sync schedule, and the December 6, 2026 plans including the 8 pm trade date roll
- [Alpaca: Orders at Alpaca](https://docs.alpaca.markets/docs/orders-at-alpaca), the overnight, pre-market and after-hours windows and the `extended_hours` flag with limit orders and `day` or `gtc`
