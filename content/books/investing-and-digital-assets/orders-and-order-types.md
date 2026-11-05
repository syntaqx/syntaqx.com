+++
title = "Orders & Order Types"
description = "Market, limit, stop and trailing orders, time in force, extended hours, notional orders, the OMS state machine, FIX messages and cancel/replace races."
category = "Investing & Digital Assets Industry"
order = 2514
part = "Trading and Markets"
tags = ["investing", "trading", "orders", "oms", "fix", "state-machines"]
+++

An order is a customer's instruction with conditions attached: buy or sell this much, at no worse than this price, only after this trigger, until this time. Every condition is a promise the broker or exchange has to keep exactly, through a session boundary, a halt, a partial fill, a dropped connection and a customer who changes their mind while the order is already filling somewhere else. The order management system (OMS) is the part of the platform that holds those promises. It accepts the instruction, checks it against the account, sends it to a venue, receives fills and cancels from that venue, and keeps the one record of what the order is now and how it got there. Most of the money a customer can lose to the platform's software is lost here: a stop that fired on a bad print, a market order that filled far from the quote, a replace that doubled a position because the original had already filled.

This chapter covers the order types and what triggers each, time in force, extended-hours and notional orders, the OMS state machine, the FIX messages brokers and venues exchange, the cancel/replace race worked through, and idempotency for orders. Where the order goes once it leaves the OMS is [US Equity Market Structure](/books/investing-and-digital-assets/equity-market-structure) and [Order Routing, PFOF & Best Execution](/books/investing-and-digital-assets/routing-and-best-execution); how a venue matches it is [Order Books & Matching Engines](/books/investing-and-digital-assets/order-books-and-matching). This chapter extends `orders` and `order_events` from [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) with `order_legs`, `order_replacements` and `fix_sessions`.

## How the Platforms Do It

What three public order interfaces document, as of November 2026:

| Platform | Order types | Time in force | Statuses and replace rules |
| --- | --- | --- | --- |
| **Alpaca** (broker API) | Market, limit, stop, stop limit, trailing stop (dollar or percent trail), bracket, OCO, OTO; market-on-open and on-close through `opg` and `cls` | `day`, `gtc` (canceled 90 days after creation), `opg`, `cls`, `ioc`, `fok`; crypto `gtc` and `ioc` only | `new`, `accepted`, `pending_new`, `partially_filled`, `filled`, `done_for_day`, `canceled`, `expired`, `replaced`, `pending_cancel`, `pending_replace` and rarer states; a cancel request is rejected while a replace is pending; notional orders can't be replaced |
| **Coinbase Exchange** (FIX 5.0 SP2) | Market, limit, stop limit, take-profit/stop-loss; post-only through `ExecInst=A` | GTC, IOC, FOK, GTD (expires within one second after `ExpireTime`) | Raising quantity or changing price loses queue priority, lowering quantity keeps it; filled quantity carries into the replacement, which keeps the `OrderID`; a triggered stop can't be modified |
| **Robinhood** (retail app) | Share and dollar-based orders; its Rule 606 report treats fractional, dollar-based, recurring, 24 Hour Market and adviser orders as "not held" | Not sourced here | FINRA's March 2025 order found its disclosures about collaring market orders, by converting them to limit orders, "inaccurate or incomplete" |

Three patterns run through them. The **type vocabulary is shared** (market, limit, stop, stop limit, trailing) because FIX defined it decades ago, but the trigger rules behind each word are each platform's own and have to be read in its documentation. **Time in force is where equities and crypto differ most:** a stock order lives in sessions and auctions, a crypto order in a market that never closes, so `day`, `opg` and `cls` mean nothing on a crypto book. And **replace is never simply "edit":** every platform publishes rules for what a modification does to queue priority, filled quantity and identifiers, and the OMS has to follow the venue's rules, not its own.

## Order Types

**Market.** Buy or sell now at whatever the market offers. A market order trades with certainty of execution and no certainty of price, which is why platforms add protection the customer may not see: a collar converts the market order into a limit order some distance from the quote, so it can't fill through a thin book. A collar is a material term. FINRA's March 7, 2025 order against Robinhood Financial and Robinhood Securities ($26 million in fines and $3.75 million of restitution in total) found inaccurate or incomplete disclosures about collared market orders; some customers whose collared orders were canceled re-entered them and filled at worse prices, and those customers got the restitution. My rule: if the OMS changes an order's type or price, the customer is told before submission and the change is an `order_events` row, not a transformation hidden inside the router.

**Limit.** Buy at the limit price or lower, sell at the limit or higher. Regulation NMS defines a *marketable* limit order as a buy priced at or above the national best offer when the order is received (or a sell at or below the national best bid): it can trade at once, and the routing and execution quality rules treat it like a market order. A buy limit at $50.05 when the NBBO is $50.00 by $50.04 is marketable; at $50.03 it rests. The OMS should classify the order at receipt against the quote it saw, and store that quote, because the Rule 605 and 606 reports in [Order Routing, PFOF & Best Execution](/books/investing-and-digital-assets/routing-and-best-execution) bucket orders by exactly this classification.

**Stop and stop limit.** A stop is dormant until the market reaches the stop price, then becomes a market order; a stop limit becomes a limit order. What "reaches" means is a platform rule. Alpaca elects stops on trades on the consolidated tape, not on quotes, and only on a trade that is not outside the NBBO, so a single off-quote print doesn't fire them. Coinbase's FIX interface triggers a stop limit when the market price moves up or down to or through `StopPx`, with an optional `TriggerPriceDirection` (tag 1109) that defaults from where the stop sits relative to the current price.

Worked numbers, my own: a customer holds 200 shares bought at $40 and places a sell stop at $38. The stock closes at $39.10, news breaks overnight, and the first regular-session trade prints at $33.50. The stop elects on that trade and the market order fills at about $33.50, not $38: the loss is about $6.50 a share, $1,300, against the $400 the customer thought they had capped. A sell stop limit at $38 with a $37.50 limit would not have filled at all, and would still be working while the price fell further. Neither outcome is a malfunction; both are what the types mean, and a customer-facing ticket has to say so in plain words.

**Trailing stop.** The stop price follows the market by a fixed amount or percentage from its best level since entry (the high-water mark for a sell). Alpaca supports `trail_price` or `trail_percent`, tracks the high-water mark, converts to a market order when triggered, and lets the trail be changed before the trigger but not switched between dollar and percent. A sell trail of 5% entered at $100 has its stop at $95; if the stock rises to $120 the stop is $114; if it then falls to $114 the order becomes a market order. The OMS has to persist the high-water mark: a trailing stop rebuilt after a restart from the entry price alone would trigger at $95, $19 a share late.

**Conditional and multi-leg orders.** A bracket is an entry with a take-profit and a stop-loss; one-cancels-other (OCO) links two exits so a fill on one cancels the other; one-triggers-other (OTO) attaches one exit to an entry. Alpaca cancels the rest of the group when any leg is canceled and allows only one exit to fill. These are several orders with one lifecycle between them, and the OMS has to cancel the sibling atomically with the fill it reacts to, because a fill on the take-profit and a fill on the stop in the same second leave the customer short. Options spreads are multi-leg orders of another kind, priced as a package, and [Options](/books/investing-and-digital-assets/options-trading) covers them.

## Time in Force

| Value | Meaning | What the OMS must do |
| --- | --- | --- |
| `day` | Valid for the session it is live in | Expire what's left at session end; Alpaca cancels unfilled day orders after the closing auction |
| `gtc` | Good until canceled | Carry it across days, adjust prices for corporate actions, and enforce the platform's age limit (Alpaca cancels at 90 days) |
| `gtd` | Good until a stated time | Expire at the time; Coinbase expires within one second after `ExpireTime` |
| `ioc` | Immediate or cancel | Fill what can fill at once and cancel the rest; never rest |
| `fok` | Fill or kill | Fill the whole quantity at once or none |
| `opg` | Opening auction only | Reject or queue outside the entry window; Alpaca rejects `opg` orders submitted after 9:28 a.m. until 7:00 p.m. ET |
| `cls` | Closing auction only | Alpaca rejects `cls` orders between 3:50 and 7:00 p.m. ET, matching NYSE's 3:50 p.m. cutoff for market-on-close and limit-on-close entries |

Expiry is a state transition driven by a clock, and the clock belongs to a venue calendar, not the server's time zone: the 3:50 p.m. cutoff is Eastern Time on an exchange trading day, and a half-day session moves it. The calendar is data with effective dates ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)), and [Extended Hours & 24-Hour Trading](/books/investing-and-digital-assets/extended-and-overnight-trading) covers the session calendars.

## Extended Hours and Notional Orders

**Extended hours.** Outside 9:30 a.m. to 4:00 p.m. ET, liquidity is thin and quotes are wide, so brokers restrict what can trade. Alpaca accepts only limit orders with `day` or `gtc` and `extended_hours=true`, in an overnight session from 8:00 p.m. to 4:00 a.m. Sunday to Friday, pre-market from 4:00 to 9:30 a.m. and after-hours from 4:00 to 8:00 p.m. The OMS needs the session an order is eligible for, not just a flag, because a `day` limit entered at 9:00 p.m. could mean the overnight session or the next regular one, and the customer has to know which. [Extended Hours & 24-Hour Trading](/books/investing-and-digital-assets/extended-and-overnight-trading#23-5-on-exchanges) covers the overnight venues and the 23-hour exchange sessions.

**Notional and fractional orders.** A dollar-based order ("buy $100 of this") has no share quantity until it fills. The core `orders` table already allows exactly one of `quantity` or `notional`. Platforms constrain these orders heavily: Alpaca supports only `day` for fractional orders and can't replace a notional order at all (cancel and resubmit instead); Robinhood Financial's Rule 606 report treats fractional and dollar-based orders as "not held," orders where the customer gave the broker discretion over price and time, and excludes them from its routing statistics, while Robinhood Securities may fill the fractional part as principal. That makes "not held" a routing and disclosure attribute set at entry, and [Fractional Shares & Recurring Investing](/books/investing-and-digital-assets/fractional-and-recurring) covers how the fraction is created.

## The OMS Lifecycle and State Machine

The core model's statuses (`new`, `accepted`, `routed`, `partially_filled`, `filled`, `canceled`, `replaced`, `rejected`, `expired`) are what a customer and a regulator see. Underneath them, the OMS has to represent requests in flight: a cancel or a replace that has been sent but not answered. The venue, not the OMS, decides whether a cancel succeeded, so between request and answer the order is in a pending state where fills can still arrive.

![Order states: new, accepted, routed, partially_filled and filled in a row, with that path accented and filled a terminal state. A dashed exit from accepted down to the terminal rejected state when risk checks or the venue reject the order. From routed, cancel requested leads down to cancel_pending, which returns to routed when the venue rejects the cancel and ends in the terminal canceled state when the venue confirms. From partially_filled, replace requested leads down to replace_pending, which ends in the terminal replaced state when the venue confirms.](/diagrams/ida-order-states.svg "Only the venue ends an order. Cancels and replaces apply to routed and partially filled orders alike, a fill can overtake a pending request, expiry ends either live state at its time in force, and replaced ends one order and starts its successor.")

Rules that hold in every OMS I would build:

- **Only the venue moves an order to a terminal state.** `canceled`, `filled` and `expired` come from execution reports; a customer's cancel makes the order `cancel_pending` and nothing more. Alpaca shows exactly this with `pending_cancel`, and keeps GTC orders in it after its 90-day job until the venue confirms.
- **Fills are accepted in every live state,** including `cancel_pending` and `replace_pending`. A fill can never be rejected because the OMS thought the order was being canceled; it happened at the venue and it is the customer's position.
- **Quantities are cumulative.** `CumQty` and `LeavesQty` on every execution report are the venue's running totals, so the OMS checks its own sum of fills against them and treats a gap as a missing message to recover, not a number to overwrite ([Explicit State Machines](/docs/money/payment-states#explicit-state-machines)).
- **Every transition is an event.** `order_events` is append-only with a sequence per order, and the current status is the last event's `to_status`; a status column updated in place loses the history that surveillance, the audit trail and complaints need.

## FIX Basics

The Financial Information eXchange protocol is how brokers, wholesalers, exchanges and many crypto venues send orders to each other. A session layer handles logon, heartbeats and sequence numbers; the application layer carries the orders. The messages an OMS uses every second:

| Message | MsgType (35) | Carries |
| --- | --- | --- |
| NewOrderSingle | `D` | `ClOrdID` (11), side (54), order type (40), quantity (38), price (44), stop price (99), time in force (59) |
| ExecutionReport | `8` | `ExecID` (17), `ExecType` (150), `OrdStatus` (39), `LeavesQty` (151), `CumQty` (14), `LastPx` (31), `LastQty` (32), `AvgPx` (6) |
| OrderCancelRequest | `F` | The order to cancel, by its `ClOrdID` chain |
| OrderCancelReplaceRequest | `G` | A new `ClOrdID`, `OrigClOrdID` (41) naming the previous order in the chain, and the full new terms |
| OrderCancelReject | `9` | Why a cancel or replace failed, `CxlRejResponseTo` (434) and the order's status after the rejection |

`ExecType` says what happened (`0` new, `4` canceled, `5` replaced, `6` pending cancel, `8` rejected, `F` trade, `H` trade cancel and others); `OrdStatus` says where the order chain now stands. A trade correction or cancel (`G`, `H`) is how a venue busts or adjusts a fill after the fact, and the OMS has to reverse the execution and its journal entry, never edit them.

Two rules in the FIX specification shape everything below. In a replace, `OrigClOrdID` is "ClOrdID(11) of the previous non rejected order (NOT the initial order of the day)", so a chain of replaces is a linked list the OMS has to walk. And `OrderQty` on a replace is the total intended quantity including what has already executed, not the quantity still to go. OrderCancelReject is the answer when the venue can't honor a cancel or replace, and filled orders can't be reduced or repriced.

Crypto venues use the same messages with their own rules. Coinbase Exchange runs FIX 5.0 SP2 over FIXT.1.1, keeps the parent `OrderID` across modifications, carries partially filled quantity into the replacement, requires the replace on the same connection as the original, and returns OrderCancelReject with `CxlRejResponseTo=2` when a replace fails. Its cancel-on-disconnect (tag 8013) cancels a session's or a whole profile's orders when the connection drops, with the warning that orders sent but not yet acknowledged are not guaranteed to be canceled.

## Cancel/Replace Races

The customer, the OMS and the venue each see the order at a different moment, and a request crosses a fill in flight more often than anyone expects on a busy book. Worked numbers, my own:

A customer has a limit order to buy 500 shares at $50.00 resting at a venue. At 10:00:00.000 they ask to raise the price to $50.02 for the same 500 shares. The OMS sends OrderCancelReplaceRequest at 10:00:00.002 with `OrderQty=500`, `Price=50.02`. At 10:00:00.003 the venue fills 300 shares at $50.00 against the original. The venue receives the replace at 10:00:00.004.

| Time | Venue's view | OMS's view |
| --- | --- | --- |
| .000 | 500 resting at $50.00 | `routed`, leaves 500 |
| .002 | unchanged | `replace_pending` (requested 500 total at $50.02) |
| .003 | fill 300 at $50.00, leaves 200 | still `replace_pending`; the fill report is in flight |
| .004 | applies the replace: total 500 with 300 done, so 200 rest at $50.02 and lose time priority | |
| .005 | | receives the fill (`ExecType=F`, `CumQty=300`, `LeavesQty=200`) and then the replace (`ExecType=5`, `CumQty=300`, `LeavesQty=200`) |

The customer ends with 300 shares bought at $50.00 ($15,000) and 200 working at $50.02, which is what they meant: 500 in total. Two other designs get it wrong:

- **An OMS that sends the remaining quantity** (`OrderQty=200` because it believed 200 were left after an earlier fill, or 500 meaning "500 more") is doing arithmetic the venue doesn't do. Under FIX's total-quantity rule, a replace for 500 after 300 filled leaves 200; a replace for 800 meaning "500 more" would buy 800. The OMS must always send the total, computed from its own cumulative fills plus the customer's intended remainder, and show the customer the result in totals.
- **An OMS that cancels and then sends a new order** to emulate a replace is exposed twice. If the cancel arrives after a full fill, the venue rejects it because the order has already filled, the new order is already out, and the customer has bought 1,000 shares. A cancel-then-new emulation must wait for the cancel's confirmation before sending the new order, and accept that the order is off the market in between.

The race in the other direction is the same shape: a cancel that crosses the final fill comes back as OrderCancelReject with the order `filled`, and the OMS moves from `cancel_pending` to `filled`, never to `canceled`. The customer saw "canceling" and must now see "filled", with the confirm. Alpaca's choice to reject a cancel while a replace is pending removes one class of race by refusing the second request until the first is answered, at the cost of a customer who taps cancel twice and gets an error.

## Idempotency for Orders

A customer taps buy, the network drops, the app retries. Without a key, that is two orders. The core `orders` table carries `client_order_id` unique per account, the client generates it before the first attempt, and every retry carries the same one, so a duplicate submission returns the existing order instead of creating another ([Idempotency](/docs/requests/idempotency)). The same applies downstream: the OMS assigns each venue order its own `ClOrdID`, which must be unique on that FIX session, and a resend after a reconnect reuses it so the venue rejects the duplicate. Upstream keys and venue keys are different identifiers with a stored mapping between them, because one customer order can become several venue orders (a replace chain, or child orders split across venues). The cases the generic rule doesn't cover are in [Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api): an execution report delivered twice is detected by `ExecID` per venue, which the core `executions` table already makes unique.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) (`orders` with its `client_order_id`, `order_events`, `executions` unique by venue and execution ID). The order needs to know its session eligibility, its not-held status, its parent if it is a leg or child, and its quote at receipt; replaces need their own chain; and FIX sessions need their sequence state:

```sql
ALTER TABLE orders
  ADD COLUMN session_eligibility TEXT NOT NULL DEFAULT 'regular'
    CHECK (session_eligibility IN ('regular', 'extended', 'overnight', 'all', 'continuous')),
  ADD COLUMN not_held           BOOLEAN NOT NULL DEFAULT FALSE,  -- discretion over price and time
  ADD COLUMN order_class        TEXT NOT NULL DEFAULT 'simple'
    CHECK (order_class IN ('simple', 'bracket', 'oco', 'oto', 'multi_leg')),
  ADD COLUMN parent_order_id    UUID REFERENCES orders (id),     -- group or parent of a child order
  ADD COLUMN trail_amount       NUMERIC(38, 18),                 -- trailing stops: price or percent
  ADD COLUMN trail_unit         TEXT CHECK (trail_unit IN ('price', 'percent')),
  ADD COLUMN high_water_mark    NUMERIC(38, 18),                 -- persisted, never recomputed
  ADD COLUMN expires_at         TIMESTAMPTZ,                     -- gtd, or a gtc age limit
  ADD COLUMN nbb_at_receipt     NUMERIC(38, 18),                 -- the quote the order was classified on
  ADD COLUMN nbo_at_receipt     NUMERIC(38, 18),
  ADD COLUMN marketable_at_receipt BOOLEAN,
  ADD COLUMN cum_quantity       NUMERIC(78, 0) NOT NULL DEFAULT 0,  -- from executions, checked against venue
  DROP CONSTRAINT orders_status_check,
  ADD CONSTRAINT orders_status_check CHECK (status IN ('new', 'accepted', 'routed',
    'partially_filled', 'filled', 'cancel_pending', 'replace_pending', 'canceled', 'replaced',
    'rejected', 'expired'));

CREATE TABLE order_legs (                  -- the legs of a multi-leg or grouped order
  order_id            UUID NOT NULL REFERENCES orders (id),
  leg_no              SMALLINT NOT NULL,
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  side                TEXT NOT NULL CHECK (side IN ('buy', 'sell', 'sell_short')),
  ratio_quantity      INT NOT NULL CHECK (ratio_quantity > 0),
  role                TEXT NOT NULL CHECK (role IN ('entry', 'take_profit', 'stop_loss', 'spread_leg')),
  PRIMARY KEY (order_id, leg_no)
);

CREATE TABLE order_replacements (          -- each cancel/replace request and how it ended
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id            UUID NOT NULL REFERENCES orders (id),      -- the order being replaced
  successor_order_id  UUID REFERENCES orders (id),               -- set when the venue accepts
  kind                TEXT NOT NULL CHECK (kind IN ('cancel', 'replace')),
  venue_cl_ord_id     TEXT NOT NULL,         -- the new ClOrdID sent
  orig_cl_ord_id      TEXT NOT NULL,         -- the previous non-rejected ClOrdID in the chain
  requested_total_qty NUMERIC(78, 0),        -- FIX OrderQty: total including executed
  requested_price     NUMERIC(38, 18),
  cum_qty_when_sent   NUMERIC(78, 0) NOT NULL,  -- what the OMS believed had filled
  outcome             TEXT NOT NULL DEFAULT 'pending' CHECK (outcome IN ('pending', 'accepted',
                        'rejected_filled', 'rejected_unknown', 'rejected_other')),
  cum_qty_at_venue    NUMERIC(78, 0),        -- from the venue's answer
  requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at         TIMESTAMPTZ,
  UNIQUE (venue_cl_ord_id)
);

CREATE TABLE fix_sessions (                -- one row per FIX session with a venue or client
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  venue_id            UUID NOT NULL REFERENCES venues (id),
  sender_comp_id      TEXT NOT NULL,
  target_comp_id      TEXT NOT NULL,
  begin_string        TEXT NOT NULL,         -- 'FIXT.1.1', 'FIX.4.2', ...
  default_appl_ver    TEXT,                  -- '9' for FIX 5.0 SP2
  next_out_seq        BIGINT NOT NULL DEFAULT 1,
  next_in_seq         BIGINT NOT NULL DEFAULT 1,
  cancel_on_disconnect TEXT CHECK (cancel_on_disconnect IN ('none', 'session', 'profile')),
  schedule            JSONB NOT NULL,        -- logon and logout times, weekly resets
  status              TEXT NOT NULL CHECK (status IN ('logged_out', 'logging_on', 'active',
                        'resending', 'disabled')),
  UNIQUE (sender_comp_id, target_comp_id, venue_id)
);
```

Applying an execution report is the one function every OMS gets wrong at least once. It takes the venue's cumulative totals as authoritative, accepts fills in any live state, and refuses every report but a fill on a terminal order:

```go tab="Go"
type ExecReport struct {
	ExecID    string
	ExecType  byte  // '0' new, '4' canceled, '5' replaced, '8' rejected, 'F' trade
	CumQty    int64 // venue's running total, smallest units
	LeavesQty int64
	LastQty   int64 // set on 'F'
}

type Order struct {
	Status string
	CumQty int64
	Seen   map[string]bool // ExecIDs already applied
}

var terminal = map[string]bool{"filled": true, "canceled": true, "replaced": true,
	"rejected": true, "expired": true}

// Apply returns an error when the report reveals a gap the OMS must recover.
func (o *Order) Apply(r ExecReport) error {
	if o.Seen[r.ExecID] {
		return nil // duplicate delivery
	}
	if terminal[o.Status] && r.ExecType != 'F' {
		return fmt.Errorf("report %s on terminal order", r.ExecID)
	}
	if r.ExecType == 'F' && o.CumQty+r.LastQty != r.CumQty {
		return fmt.Errorf("fill gap: have %d + %d, venue says %d", o.CumQty, r.LastQty, r.CumQty)
	}
	o.Seen[r.ExecID] = true
	o.CumQty = r.CumQty
	switch {
	case r.ExecType == '4':
		o.Status = "canceled"
	case r.ExecType == '5':
		o.Status = "replaced" // the successor order carries on
	case r.ExecType == '8':
		o.Status = "rejected"
	case r.ExecType == 'F' && r.LeavesQty == 0:
		o.Status = "filled"
	case r.ExecType == 'F' && o.Status != "cancel_pending" && o.Status != "replace_pending":
		o.Status = "partially_filled" // a pending request stays pending
	}
	return nil
}
```

```rust tab="Rust"
use std::collections::HashSet;

pub struct ExecReport { pub exec_id: String, pub exec_type: u8, pub cum_qty: i64,
    pub leaves_qty: i64, pub last_qty: i64 }

pub struct Order { pub status: &'static str, pub cum_qty: i64, pub seen: HashSet<String> }

const TERMINAL: [&str; 5] = ["filled", "canceled", "replaced", "rejected", "expired"];

impl Order {
    /// Err when the report reveals a gap the OMS must recover.
    pub fn apply(&mut self, r: &ExecReport) -> Result<(), String> {
        if self.seen.contains(&r.exec_id) {
            return Ok(()); // duplicate delivery
        }
        if TERMINAL.contains(&self.status) && r.exec_type != b'F' {
            return Err(format!("report {} on terminal order", r.exec_id));
        }
        if r.exec_type == b'F' && self.cum_qty + r.last_qty != r.cum_qty {
            return Err(format!("fill gap: have {} + {}, venue says {}",
                self.cum_qty, r.last_qty, r.cum_qty));
        }
        self.seen.insert(r.exec_id.clone());
        self.cum_qty = r.cum_qty;
        let pending = matches!(self.status, "cancel_pending" | "replace_pending");
        self.status = match r.exec_type {
            b'4' => "canceled",
            b'5' => "replaced", // the successor order carries on
            b'8' => "rejected",
            b'F' if r.leaves_qty == 0 => "filled",
            b'F' if !pending => "partially_filled",
            _ => self.status, // a pending request stays pending
        };
        Ok(())
    }
}
```

A fill on a terminal order is allowed through on purpose: a late fill after a cancel the OMS believed in is the venue's truth, and the check that matters is the cumulative quantity, which raises the gap for a person to resolve.

Design notes:

- **Store the quote at receipt on the order.** Marketability, the Rule 605 bucket, collar decisions and price improvement all depend on the NBBO the OMS saw when the order arrived, and reconstructing it later from market data is slower and sometimes impossible.
- **A replace chain is two orders and a link.** `order_replacements` records what was asked, what the OMS believed had filled, and what the venue answered; the successor order is a new `orders` row with its own events, and statements show the chain as one customer instruction.
- **Persist trigger state.** High-water marks, triggered flags and bracket group state live in rows, written in the same transaction as the event that changed them, so a restart can't re-arm a trailing stop at its entry price.
- **Session state is data.** FIX sequence numbers survive restarts in `fix_sessions`, because a session that logs on with sequence 1 after a crash either loses messages or gets disconnected.
- **Emit events on every transition:** `order.accepted`, `order.cancel_requested`, `order.replace_rejected`, `order.filled` and the rest, through the outbox, so notifications, risk, surveillance and the CAT reporting in [Books, Records & the Audit Trail](/books/investing-and-digital-assets/books-records-and-cat) read the same sequence ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every order's full chain.** Each order, its events in sequence, every cancel and replace request with what the OMS believed and what the venue answered, and every child order with its parent, because a complaint about a double fill is answered from the chain.
- **The terms the customer saw.** The order ticket as presented, including any collar, conversion or session choice, as a `disclosures` row or an event detail, so a dispute about "I placed a market order" can be settled.
- **Every trigger and why it fired.** For stops and trailing stops, the trade or quote that elected the order and the high-water mark at the time.
- **Every FIX message, retained.** Raw inbound and outbound messages per session with sequence numbers, because the broker-dealer records rules in [Books, Records & the Audit Trail](/books/investing-and-digital-assets/books-records-and-cat) and venue disputes both reach for them.
- **Breaks between the OMS and the venue.** Every cumulative-quantity gap, its recovery and the person who resolved it.

## What This Means for the System You Build

- **Treat order types as platform rules, not words:** document and test what triggers each stop, what a collar does, and what each time in force does at each session boundary.
- **Classify every order at receipt against the stored NBBO,** because routing, reporting and price improvement all start there.
- **Let only the venue end an order,** keep pending states for requests in flight, and accept fills in every live state.
- **Send totals on a replace,** never remainders, and never emulate a replace with a cancel and a new order you haven't waited for.
- **Use one idempotency key per customer order and one `ClOrdID` per venue order,** with the mapping stored.
- **Persist trigger state and FIX sequence numbers** so a restart changes nothing the customer can see.

## References

**Law and regulation**

- [17 CFR 242.600](https://www.law.cornell.edu/cfr/text/17/242.600), Regulation NMS definitions, including the marketable limit order, the national best bid and offer and regular trading hours

**Regulators and guidance**

- [FINRA: FINRA orders Robinhood Financial to pay $3.75 million in restitution (March 7, 2025)](https://www.finra.org/media-center/newsreleases/2025/finra-orders-robinhood-financial-pay-375-million-restitution), the $26 million in fines and the findings on collared market order disclosures

**Filings**

- [Robinhood Financial: Rule 606 report, second quarter 2026](https://cdn.finra.org/606/2026/165998_606_NMS_2026_Q2_V1.pdf), not-held treatment of fractional, dollar-based, recurring, 24 Hour Market and adviser orders, and principal fills of fractions

**Standards and protocols**

- [FIX Trading Community: ExecutionReport](https://orchimate.org/fixtrading/fix-latest/messages/ExecutionReport), MsgType 8, ExecType values, CumQty, LeavesQty, LastPx and LastQty, and NewOrderSingle as MsgType D
- [FIX Trading Community: OrderCancelReplaceRequest](https://orchimate.org/fixtrading/fix-latest/messages/OrderCancelReplaceRequest), MsgType G, OrigClOrdID as the previous non-rejected order and OrderQty as the total including executed quantity
- [FIX Trading Community: OrderCancelReject](https://orchimate.org/fixtrading/fix-latest/messages/OrderCancelReject), MsgType 9 in answer to cancel (F) and replace (G) requests, and filled orders that can't be reduced or repriced

**Vendor documentation**

- [Alpaca: Orders at Alpaca](https://docs.alpaca.markets/docs/orders-at-alpaca), order types, stop election on consolidated trades within the NBBO, trailing stops, brackets, time in force and its cutoffs, extended-hours sessions, statuses, replace limits and notional orders
- [Coinbase Developer Platform: Exchange FIX order entry](https://docs.cdp.coinbase.com/exchange/fix-api/order-entry-messages/order-entry-messages5.md), FIX 5.0 SP2, order types and time in force, stop triggers, replace rules on priority and filled quantity, OrderCancelReject codes, cancel-on-disconnect and resend
- [NYSE: Closing auction insider's guide](https://www.nyse.com/article/nyse-closing-auction-insiders-guide), the 3:50 p.m. cutoff for market-on-close and limit-on-close orders
