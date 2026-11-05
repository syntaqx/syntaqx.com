+++
title = "Pre-Trade Risk, Halts & Volatility"
nav_title = "Pre-Trade Risk & Halts"
description = "The market access rule, fat-finger and credit checks, kill switches, LULD bands, circuit breakers, halts, January 2021 buying limits and crypto price bands."
category = "Investing & Digital Assets Industry"
order = 2521
part = "Trading and Markets"
tags = ["investing", "pre-trade-risk", "market-access-rule", "15c3-5", "kill-switch", "luld", "circuit-breakers", "halts", "volatility"]
+++

Every order a broker sends is a promise the broker's own capital stands behind. If a customer's order is wrong (a price off by a factor of ten, a quantity with three extra zeros, the same order sent a thousand times by a retrying client) the market fills it, the clearing house holds the broker to it, and the loss lands on the firm. On August 1, 2012, Knight Capital's router sent more than 4 million orders in 45 minutes while trying to fill 212 customer orders, traded more than 397 million shares and lost more than $460 million. The SEC's first enforcement action under the market access rule followed.

Three layers of control stand between an order and a disorderly market. The **broker's pre-trade checks**, required by SEC Rule 15c3-5, reject orders that exceed credit or capital thresholds, look erroneous or break a regulatory restriction, and a kill switch stops a firm, a client or a strategy outright. The **market's single-stock controls**, the Limit Up-Limit Down plan, keep each NMS stock's trades inside price bands and pause it when they can't. The **market-wide circuit breakers** halt all US equity and options trading after a 7% or 13% fall in the S&P 500 and close it after 20%. A fourth control isn't a rule at all: when a clearing house raises a member's deposit, the member may stop customers from buying, as several brokers did in January 2021.

This chapter covers the market access rule, the checks themselves with worked numbers, kill switches, LULD bands for a Tier 1 stock, market-wide circuit breakers, trading halts and the short sale price test, clearing deposit spikes and the January 2021 restrictions, and the price bands and modes crypto venues use instead. The order lifecycle the checks sit in is in Orders & Order Types, and capacity, load shedding and outages in Peak Days, Outages & Resilience, both in this book.

## How the Platforms Do It

What venues and brokers publish about pre-trade controls and volatility handling, as of November 2026:

| Platform | Pre-trade controls published | Volatility and halt behavior |
| --- | --- | --- |
| **Binance** (spot API filters) | `PERCENT_PRICE` limits an order's price to a multiple up and down of an average of previous trade prices (the last price if the averaging window is 0), and `PERCENT_PRICE_BY_SIDE` sets different ranges for buys and sells; `PRICE_FILTER` (minimum, maximum, tick), `LOT_SIZE` (minimum, maximum, step), `MIN_NOTIONAL` and `NOTIONAL`, and `MAX_NUM_ORDERS` per symbol | No market-wide halt; the bands move with the market and an order outside them is rejected |
| **Coinbase Exchange** (API) | Rate limits: public REST 10 requests a second per IP (bursts to 15), private REST 15 per profile (bursts to 30), FIX 2 logons a second per key and 100 requests a second; cancel-on-disconnect at logon, for the session's or the whole profile's orders | Per-market modes; orders sent but not yet acknowledged "are not guaranteed to be canceled" on disconnect |
| **NYSE** (Rule 7.12 and its FAQ, February 2026) | Exchange-side order rules during a halt | Market-wide halts at 7%, 13% and 20% S&P 500 declines; during a halt, auction-eligible orders accepted, resting non-displayed orders canceled, IOC orders rejected, unexecuted market orders kept; reopening auctions no earlier than 15 minutes |
| **Robinhood** (2021, per the SEC staff report and its S-1) | Product limits by security: raised margin requirements, option contract limits, fractional purchases off | From January 28 to February 5, 2021, prevented purchases of specified securities after NSCC raised its deposit requirements; position-closing-only status for eight securities, then position limits on over 50 |

The pattern: **venues publish their checks as parameters,** because algorithmic clients need to know them; brokers' own checks are mostly unpublished, and the rule requires that they exist, not that they be disclosed. **Halts are a protocol both sides must implement:** the exchange stops matching and changes which orders it accepts, and the broker must decide what to do with the orders its customers keep sending. **The broker's most consequential control in a crisis was a product restriction,** not a price check, and it was driven by the clearing house's demands on the broker, not by the market's price.

## The Market Access Rule

Rule 15c3-5 applies to any broker-dealer with market access, meaning access to trading on an exchange or ATS as a member or subscriber, including when it lets a customer trade under its identifier. It requires risk management controls and supervisory procedures "reasonably designed" to:

- **Financial controls (c)(1):** "prevent the entry of orders that exceed appropriate pre-set credit or capital thresholds" for each customer and the firm, and reject "orders that exceed appropriate price or size parameters" or are otherwise erroneous, including orders that appear duplicative.
- **Regulatory controls (c)(2):** prevent orders that don't comply with regulatory requirements that must be met before entry, prevent trading by a person "restricted from trading those securities," and restrict access to pre-approved persons and accounts.
- **Control (d):** the controls must be "under the direct and exclusive control of the broker or dealer"; certain regulatory controls may be allocated by written contract to a broker-dealer customer closer to the end customer, after due diligence, with the firm still responsible.
- **Review (e):** review of the controls "no less frequently than annually," and an annual certification by the CEO.

Knight's order shows what each item means in practice. The SEC found Knight lacked controls comparing the orders leaving its router with those entered; relied on financial controls that couldn't stop orders breaching firm-wide capital thresholds; hadn't linked the account receiving the executions to automated exposure controls; lacked adequate controls and testing for code deployment and procedures for responding to incidents; reviewed its controls by inventorying them rather than asking how the router could fail; and ignored 97 automated emails flagging the error before the open. The defective function was code left in the router since 2005 and reactivated by a deployment. Knight paid a $12 million penalty and retained an independent consultant.

## Checks Before an Order Leaves

The checks run in the order path between acceptance and routing, synchronously, on every order and every replace. A typical set:

| Check | Rejects | Source of the parameter |
| --- | --- | --- |
| **Account and capability** | Restricted, frozen or closing-only accounts; instruments or strategies the account isn't approved for | `accounts.status`, approvals ([Opening Accounts](/books/investing-and-digital-assets/opening-accounts#capabilities-and-approvals)) |
| **Credit** | Notional above buying power; a short without a locate | Buying power ([Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions#buying-power)); locates ([Margin & Short Selling](/books/investing-and-digital-assets/margin-and-short-selling#short-selling-and-regulation-sho)) |
| **Price collar** | A limit price too far through the market; a market order in a stock with no quote | Firm parameter per price band, against the NBBO |
| **Size** | Quantity or notional above a per-order maximum; a quantity above a share of average daily volume | Firm parameter per account class and instrument |
| **Duplicate** | A reused client order ID; the same order repeated within a window | Idempotency key, rolling window ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)) |
| **Rate** | More than N orders a second from one account or session | Firm parameter ([Admission, Rate Limiting and Load Shedding](/docs/architecture/admission-control#admission-rate-limiting-and-load-shedding)) |
| **Restricted list** | Securities the firm or the person may not trade (insider lists, sanctions, position-closing-only) | Compliance lists, instrument restrictions |
| **Market state** | Orders the venue would reject: halted, paused, outside LULD bands, outside session | Halt and band feeds |
| **Firm aggregate** | Orders that would take the firm's gross or net exposure past its capital threshold | Firm parameter, updated intraday from fills |

**Worked numbers, my own parameters.** A cash account with $12,000 of buying power sends a buy of 1,000 XYZ with a limit of $25.00; the NBBO is $2.49 by $2.50. The firm's collar for stocks between $1 and $10 rejects limit buys more than 10% above the offer.

1. Collar: the limit is 900% above the $2.50 offer, above the $2.75 maximum. **Rejected,** with a reason the customer sees ("price far from market") and the check, parameter and quote stored.
2. The customer resends 1,000 at $2.55, 2% through the offer. Collar passes.
3. Credit: 1,000 × $2.55 = $2,550 reserved against $12,000. Passes; buying power for the next order is $9,450.
4. Size: the firm's maximum for this account class is $250,000 an order and 5% of average daily volume; XYZ trades 3 million shares a day, so 150,000 shares. Passes.
5. Duplicate: a retrying client sends the same client order ID again 300 ms later. Rejected as a duplicate; the original stands and the client gets the original's status, not a second order.
6. Market state: XYZ is a Tier 1 stock with a $2.50 reference price; between $0.75 and $3.00 its LULD parameter is 20%, so its bands are $2.00 and $3.00, and a $2.55 limit is inside them. Passes.

The collar is the check that would have caught the fat finger; the credit check alone wouldn't, if the account had $25,000. The duplicate check is the one most often missing in systems built from a web API outward, because the HTTP layer's idempotency key and the order system's duplicate window are different things and both are needed.

## Kill Switches

A kill switch stops order flow at a scope and cancels what is resting: one session, one account, one client of a broker, one strategy, one venue connection, or the whole firm. It is a pre-built, tested action, not an emergency code change ([Kill Switches](/docs/delivery/feature-flags#kill-switches)), and the market access rule's financial controls make some version mandatory, since a firm whose capital threshold is breached must be able to stop.

Three properties matter:

- **It acts below the component that is misbehaving.** Knight's problem was in the router, so a switch in the router's own logic wouldn't have helped; the cut has to be at the gateway to the venue or at the venue.
- **Cancel-on-disconnect is the venue-side backstop.** Coinbase Exchange's FIX logon can set it to cancel all of the session's orders, or all of the profile's, when the connection drops, and warns that orders not yet acknowledged "are not guaranteed to be canceled." A broker's own gateway should behave the same way toward its clients.
- **It is reversible only by a person,** with the reason, the scope and the orders canceled recorded, and re-enabled only after the cause is understood.

## Limit Up-Limit Down

The Limit Up-Limit Down (LULD) plan applies to every NMS stock except rights and warrants during regular hours, 9:30 a.m. to 4:00 p.m. ET. Each stock has a **reference price**, the arithmetic mean of eligible trades over the prior five minutes (the opening price to start the day), updated when a new mean is at least 1% away from the current reference, and **price bands** above and below it. Tier 1 is the S&P 500, the Russell 1000 and selected ETPs; Tier 2 is everything else.

| Tier and previous close | Percentage parameter |
| --- | --- |
| Tier 1, and Tier 2 at $3.00 or below: more than $3.00 | 5% |
| $0.75 up to and including $3.00 | 20% |
| Less than $0.75 | The lesser of $0.15 or 75% |
| Tier 2, more than $3.00 | 10% |

Bands are doubled for the last 25 minutes of the day for Tier 1 stocks and Tier 2 stocks at $3.00 or below. When the national best offer reaches the lower band (or the national best bid the upper), the stock enters a **limit state**; if the limit state isn't exited within 15 seconds, the listing exchange declares a **five-minute trading pause**, which may be extended, followed by a reopening auction. A pause in the last ten minutes doesn't reopen; the exchange runs the closing auction instead.

![LULD states for one stock: trading moves to limit_state when the quote is at the band; limit_state returns to trading if it exits within 15 seconds, or moves to paused after 15 seconds with no exit, with that path accented; paused moves to reopening after 5 minutes; reopening returns to trading when the reopening auction prints.](/diagrams/ida-luld-states.svg "Most limit states clear within 15 seconds; those that don't become a five-minute pause and a reopening auction. A pause in the last ten minutes of the day ends in the closing auction instead.")

**Worked numbers: bands for a Tier 1 stock.** The plan's own example: a Tier 1 stock with a $25.00 reference has bands of $23.75 and $26.25. My own, for other Tier 1 prices:

| Reference price | Parameter | Lower band | Upper band | After 3:35 p.m. (doubled) |
| ---: | --- | ---: | ---: | --- |
| $180.00 | 5% | $171.00 | $189.00 | $162.00 to $198.00 |
| $2.50 | 20% | $2.00 | $3.00 | $1.50 to $3.50 |
| $0.50 | Lesser of $0.15 or 75% ($0.375): $0.15 | $0.35 | $0.65 | $0.20 to $0.80 |

If the $180 stock's five-minute average falls to $178.00, 1.1% below the reference, the reference updates and the bands become $169.10 and $186.90; at $179.00, 0.6% away, they don't move. A broker's order system consumes the bands from the SIP and uses them two ways: as a pre-trade check (a limit buy above the upper band can't execute, and a market order during a limit state may not either), and as a customer message, because a customer whose market order sits unfilled during a pause needs to be told why.

The 2010 Flash Crash that produced LULD, and its rollout through 2013, are in [Crises & the Rules They Wrote](/books/investing-and-digital-assets/crises-and-the-rules#2010-the-flash-crash). Overnight sessions have their own static bands, covered in Extended Hours & 24-Hour Trading.

## Market-Wide Circuit Breakers

Market-wide circuit breakers (NYSE Rule 7.12 and its counterparts at every exchange) measure the S&P 500 against the prior day's close:

| Level | Decline | Halt |
| --- | --- | --- |
| 1 | 7% | 15 minutes, if before 3:25 p.m. ET; no halt at or after 3:25 |
| 2 | 13% | 15 minutes, if before 3:25 p.m. ET; no halt at or after 3:25 |
| 3 | 20% | Rest of the trading day; with 23/5 trading, until 4:00 a.m. ET or later the next trading day |

Levels 1 and 2 can each trigger only once a day: after a Level 1 halt, another 7% fall doesn't halt again unless the index reaches 13%. Level 3 can trigger at any time. The 23/5 change came in NYSE's filing of September 4, 2026 (Release No. 34-106380), effective on filing, which replaced "remainder of the trading day" with a halt until 4:00 a.m. ET on the following trading day, the earliest resumption in practice either way. FINRA Rule 6121 halts over-the-counter trading in NMS stocks when the primary listing market halts for a market decline.

**Worked numbers, my own.** The S&P 500 closed yesterday at 6,000.00. Level 1 is 5,580.00, Level 2 is 5,220.00 and Level 3 is 4,800.00. If the index touches 5,575 at 11:10 a.m., trading halts market-wide until at least 11:25, then reopens through auctions; if it touches 5,575 at 3:30 p.m., nothing halts. A broker's systems must react to the halt message, not to their own index calculation: stop routing, hold or reject new customer orders according to a written policy (NYSE accepts auction-eligible orders during the halt and rejects IOCs), keep resting market orders unless the customer cancels, tell customers in the app why nothing is filling, and recompute nothing that depends on a last-trade price that is now stale.

## Trading Halts

Single-stock halts are called by the listing market (news pending, a regulatory concern, an LULD pause, a corporate-action halt) and followed by every venue; the broker's job is the same as for a market-wide halt, at one symbol. The halt state per instrument comes from the SIP and the listing market's feeds and is mirrored in `instruments.status` (`halted`) and a halt history.

One volatility control applies to short sales only. Regulation SHO's **Rule 201** applies when a stock's price falls "by 10% or more from the covered security's closing price": for the rest of that day and the following day, trading centers must prevent short sales "at a price that is less than or equal to the current national best bid." A broker may mark a short sale "short exempt" if it identifies the order as priced above the current national best bid at submission. GME triggered it twice in January 2021, on January 15 and January 28. For the order system, a Rule 201 flag on the instrument changes which short orders it may send and how it marks them; the locate and close-out rules are in [Margin & Short Selling](/books/investing-and-digital-assets/margin-and-short-selling#short-selling-and-regulation-sho).

## Clearing Deposits and the January 2021 Restrictions

Brokers restricted trading in January 2021 not because the market halted (it didn't) but because the clearing house asked for money. NSCC's clearing fund includes a value-at-risk charge, intraday mark-to-market calls, special charges and an Excess Capital Premium when a member's risk exceeds its excess net capital. On January 27, 2021, NSCC made intraday calls on 36 members totaling $6.9 billion, $2.1 billion of mark-to-market and $4.8 billion of special charges on 18 members, bringing total required margin to $25.5 billion. On January 28 it waived the Excess Capital Premium for all members; without the waiver, one retail broker-dealer would have owed an additional charge of more than double its $1.4 billion requirement. NSCC's rules don't let it tell members to stop trading a symbol; the restrictions were the brokers' decisions.

The SEC staff report describes what they did:

- **Raised margin requirements** on the stock, from 80% to 100% over two days.
- **Cut option limits** per customer, from 5,000 contracts to 3,000, then 300, then 100.
- **Put securities in position-closing-only status:** on January 28, one broker restricted new purchases in eight securities; on January 29 it replaced that with position limits on a list that grew past 50 names, and stopped fractional purchases in them; it removed the limits on February 5. Robinhood's S-1 gives the same dates for its restrictions and attributes them to NSCC's increased deposit requirements.
- **Restricted correspondents:** a clearing firm told the brokers it cleared for to stop new purchases in three stocks, and lifted it that afternoon.
- **Ran out of capacity:** one firm's system reached its limit of unique order IDs on January 27 and restricted new GME and AMC purchases for the last hour and a half the next day.

The engineering lessons are concrete. **Restrictions are instrument-level product modes** (normal, position closing only, position-limited, no fractional, raised margin), set by risk in minutes and enforced by the same pre-trade checks as everything else. **The clearing deposit is an input to risk,** forecast intraday from the broker's own net buying by symbol, not a surprise in the morning; the [crises chapter](/books/investing-and-digital-assets/crises-and-the-rules#2021-meme-stocks-and-t-1) traces how the episode led to T+1, and Clearing & Settlement covers the deposit calculation. **Customers must be told,** at the point of the order, what is restricted and why; the staff report noted firms differed in how and when they did.

## Crypto Venues

Crypto has no market-wide circuit breaker and no LULD plan: every venue runs its own market, around the clock, and decides its own controls. They take three forms:

- **Price bands on orders.** Binance's `PERCENT_PRICE` filter bounds each order's price to multipliers of a recent average trade price, separately by side in `PERCENT_PRICE_BY_SIDE`; an order outside is rejected. Unlike LULD, the band moves continuously and nothing pauses.
- **Market modes.** A venue can move a pair to cancel-only, limit-only, post-only or halted, for a listing, an incident, a chain halt or a delisting, recorded as `market_modes` history in [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture#how-to-build-it). It is the crypto equivalent of a single-stock halt, declared by the operator instead of by a plan.
- **Client limits.** Rate limits and cancel-on-disconnect (Coinbase Exchange's are above), self-trade prevention and maximum open orders per symbol.

What crypto lacks is coordination: when one venue pauses, others keep trading, and its customers' liquidations and arbitrage move elsewhere. The liquidation side of a crypto volatility day, including the October 10, 2025 cascade, is in Perpetuals & Crypto Derivatives later in this book.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) (`orders` and `order_events`, `instruments` with status `halted` and `close_only`, `accounts`, `venues`, `cases`). This chapter adds the risk limits, a record of every check, halts, instrument restrictions and kill switch events. Crypto pairs keep `trading_pairs.mode` and `market_modes` from How a Crypto Exchange Works; a securities halt is a `trading_halts` row, and both map to the same "can this order route" question in the check below.

```sql
CREATE TABLE risk_limits (                  -- parameters for every check, versioned
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  scope              TEXT NOT NULL CHECK (scope IN ('firm', 'account_class', 'account',
                       'instrument', 'session')),
  scope_ref          TEXT,                       -- the account class, account ID, instrument or session
  check_code         TEXT NOT NULL,              -- 'price_collar', 'max_notional', 'max_qty_adv',
                                                 -- 'duplicate_window_ms', 'orders_per_second', 'firm_gross'
  value              NUMERIC(38, 6) NOT NULL,
  applies_when       JSONB NOT NULL DEFAULT '{}', -- price band, session, instrument type
  valid_during       TSTZRANGE NOT NULL,
  set_by             UUID NOT NULL,
  reason             TEXT NOT NULL
);

CREATE TABLE pretrade_checks (              -- every check on every order, pass or fail
  order_id           UUID NOT NULL REFERENCES orders (id),
  attempt            INT NOT NULL,               -- a replace is a new attempt
  check_code         TEXT NOT NULL,
  result             TEXT NOT NULL CHECK (result IN ('pass', 'reject', 'warn')),
  limit_id           UUID REFERENCES risk_limits (id),
  observed           JSONB NOT NULL,             -- the quote, buying power, count it compared
  checked_at         TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (order_id, attempt, check_code)
);

CREATE TABLE trading_halts (                -- securities halts, pauses and circuit breakers
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id      UUID REFERENCES instruments (id),  -- NULL: market-wide
  kind               TEXT NOT NULL CHECK (kind IN ('luld_pause', 'regulatory', 'news_pending',
                       'corporate_action', 'mwcb_level_1', 'mwcb_level_2', 'mwcb_level_3')),
  source_venue_id    UUID REFERENCES venues (id),       -- the listing market or SIP
  source_ref         TEXT NOT NULL,              -- the feed message that declared it
  halted_at          TIMESTAMPTZ NOT NULL,
  resumed_at         TIMESTAMPTZ,
  UNIQUE (source_ref)
);

CREATE TABLE instrument_restrictions (      -- the firm's own product modes per instrument
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  instrument_id      UUID NOT NULL REFERENCES instruments (id),
  mode               TEXT NOT NULL CHECK (mode IN ('position_closing_only', 'position_limit',
                       'no_fractional', 'raised_margin', 'option_contract_limit', 'short_sale_price_test')),
  value              NUMERIC(38, 6),             -- the limit, or the margin rate
  valid_during       TSTZRANGE NOT NULL,
  reason             TEXT NOT NULL,              -- 'clearing_deposit', 'volatility', 'rule_201'
  customer_message   TEXT NOT NULL,              -- what the app shows at the order
  case_id            UUID REFERENCES cases (id)
);

CREATE TABLE kill_switch_events (           -- every stop and every restart
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  scope              TEXT NOT NULL CHECK (scope IN ('firm', 'venue_connection', 'client',
                       'account', 'strategy', 'session')),
  scope_ref          TEXT NOT NULL,
  action             TEXT NOT NULL CHECK (action IN ('engage', 'release')),
  canceled_orders    INT,                        -- resting orders canceled on engage
  trigger            TEXT NOT NULL CHECK (trigger IN ('manual', 'limit_breach', 'disconnect')),
  actor_id           UUID,                       -- the person; NULL for an automatic engage
  reason             TEXT NOT NULL,
  occurred_at        TIMESTAMPTZ NOT NULL,
  case_id            UUID REFERENCES cases (id)
);
```

Design notes:

- **The check chain is a pure function** of the order, one consistent snapshot of the account, the instrument's state and the limits in force. It runs before routing and again on every replace, and each run writes its `pretrade_checks` rows in the same transaction as the order event.
- **Limits are data with validity ranges** and a reason, so risk can tighten an option contract limit or a collar for one symbol in minutes, and the firm can show which limit rejected which order on which day.
- **Halt state comes from the feed and is idempotent** on the feed's message; the order system reads it, it doesn't infer it from prices. Market-wide halts are rows with no instrument.
- **Restrictions are separate from halts.** A halt is the market's; a restriction is the firm's choice under its own risk, with a customer message and a case explaining it.
- **Kill switches are tested like releases** ([Staged Rollout and the Kill Switch](/docs/security/software-updates#staged-rollout-and-the-kill-switch)): exercised in production-like conditions on a schedule, with the time from engage to last cancel measured.

## Auditing

The market access rule makes these records mandatory as evidence that the controls exist and work. Keep:

- **Every risk limit version** with who set it, when and why, and the annual review and CEO certification that covered it.
- **Every pre-trade check result** for every order and replace, including passes, with the observed values, so a rejected order and an accepted one can both be explained.
- **Every halt, pause and circuit breaker** as received from the feed, with what the order system did with resting and new orders while it lasted.
- **Every instrument restriction** with its reason, the clearing or risk data that justified it, and the customer message shown.
- **Every kill switch engagement and release,** with the scope, the trigger, the orders canceled and the person who released it.
- **Incidents,** including deployments that touched the order path, linked to the cases they opened.

## What This Means for the System You Build

- **Put the checks between acceptance and routing,** synchronous, on every order and replace, under the firm's direct control.
- **Check price against the market, not just credit:** a collar per price band catches the fat finger buying power won't.
- **Make duplicates impossible twice:** an idempotency key at the API and a duplicate window in the order system.
- **Build kill switches below the thing that might fail,** at the venue gateway, with cancel-on-disconnect, and test them.
- **Consume LULD bands and halt messages from the feed** and use them both to reject and to explain.
- **React to circuit breakers by policy:** stop routing, decide what new orders do, keep resting orders, tell customers.
- **Model the firm's restrictions as instrument modes with messages,** driven by forecasts of clearing deposits, not discovered by them.
- **On crypto venues, publish band and rate parameters** and record every market mode change with its reason.

## References

**Law and regulation**

- [17 CFR 240.15c3-5: Risk management controls for brokers or dealers with market access](https://www.law.cornell.edu/cfr/text/17/240.15c3-5), credit and capital thresholds, erroneous and duplicative orders, regulatory controls, direct and exclusive control, annual review and CEO certification
- [17 CFR 242.201: Circuit breaker](https://www.law.cornell.edu/cfr/text/17/242.201), the 10% trigger, the rest of the day and the next, the national best bid test and short exempt marking

**Regulators and guidance**

- [Limit Up-Limit Down Plan](https://www.luldplan.com/), tiers, percentage parameters, the reference price and its 1% update, the band example, doubling in the last 25 minutes, the 15-second limit state, the five-minute pause and the last ten minutes
- [NYSE: Market-Wide Circuit Breakers FAQ (version 4.0, February 2026)](https://www.nyse.com/publicdocs/nyse/NYSE_MWCB_FAQ.pdf), the 7%, 13% and 20% levels, the 3:25 p.m. window, once-per-day Levels 1 and 2, order handling during a halt and the 15-minute minimum
- [SEC: NYSE Rule 7.12 amendment for Level 3 resumption under 23/5 trading (Release No. 34-106380, 91 FR 59278, September 18, 2026)](https://www.federalregister.gov/documents/full_text/html/2026/09/18/2026-19125.html), current Level 1 and 2 halts before 3:25 p.m., Level 3 for the rest of the day, and the change to 4:00 a.m. ET the next trading day
- [FINRA Rule 6121: Trading Halts Due to Extraordinary Market Volatility](https://www.finra.org/rules-guidance/rulebooks/finra-rules/6121), OTC halts during a market-wide decline and Level 3 halts until 4:00 a.m. ET
- [SEC: Limit Up-Limit Down and market-wide circuit breakers (Press Release 2012-107, June 1, 2012)](https://www.sec.gov/news/press/2012/2012-107.htm), the approval of both and the 15-minute halts
- [SEC: Staff Report on Equity and Options Market Structure Conditions in Early 2021 (October 2021)](https://www.sec.gov/files/staff-report-equity-options-market-struction-conditions-early-2021.pdf), NSCC's January 27 and 28 calls and waiver, broker restrictions, a clearing firm's instruction to correspondents, a capacity restriction, Robinhood's S-1 dates, and GME's two Rule 201 triggers

**Courts and enforcement**

- [SEC: Knight Capital charged with violating the market access rule (Press Release 2013-222, October 16, 2013)](https://www.sec.gov/news/press-release/2013-222), 4 million orders for 212 customer orders, 397 million shares, more than $460 million lost, the control failures found and the $12 million penalty

**Vendor documentation**

- [Binance: Spot API filters](https://developers.binance.com/docs/binance-spot-api-docs/filters), `PERCENT_PRICE`, `PERCENT_PRICE_BY_SIDE`, price, lot, notional and open-order filters
- [Coinbase Developer Platform: Exchange rate limits](https://docs.cdp.coinbase.com/exchange/introduction/rate-limits-overview.md), REST and FIX limits per IP, profile and key
- [Coinbase Developer Platform: Exchange FIX order entry](https://docs.cdp.coinbase.com/exchange/fix-api/order-entry-messages/order-entry-messages5.md), cancel-on-disconnect for session or profile orders and its caveat, and self-trade prevention
