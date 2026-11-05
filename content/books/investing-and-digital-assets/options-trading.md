+++
title = "Options"
description = "Listed options: series and symbols, approval levels, the ODD, payoffs and margin, exercise and assignment, early assignment, expiration day, 0DTE and spreads."
category = "Investing & Digital Assets Industry"
order = 2519
part = "Trading and Markets"
tags = ["investing", "options", "occ", "exercise", "assignment", "expiration", "finra-2360", "multi-leg"]
+++

An option is a contract for the right, not the obligation, to buy (a call) or sell (a put) 100 shares of a stock at a fixed price until a fixed date. For a retail broker it is the most profitable product per customer action and the one with the most moving parts after the trade: a position that can turn into a stock position overnight without the customer doing anything, an expiration day when every open contract must be decided by a clock, a short leg that can be assigned the night before a dividend, and order flow that pays per contract. Robinhood earned $399 million from options in the third quarter of 2026 on 905 million contracts, more than its equities and crypto transaction revenue combined, and Cboe reported that zero-days-to-expiration contracts were 56% of US index option volume in the same quarter.

The listed market is standardized. Every US listed option is cleared by the Options Clearing Corporation (OCC), the clearing agency for every US options exchange (16 of them when the SEC staff described it in 2021), which stands between buyer and seller, so a customer's counterparty is never the person on the other side of the trade. Terms (underlying, strike, expiration, style, multiplier) are fixed by the exchanges; the customer chooses only which series, which side and how many. The rules that bind the broker are FINRA Rule 2360 (approval, disclosure, exercise and allocation of assignments), SEC Rule 9b-1 (the Options Disclosure Document), and the margin rules in FINRA Rule 4210, whose stock side is in [Margin & Short Selling](/books/investing-and-digital-assets/margin-and-short-selling).

This chapter covers series and symbols, approval levels, payoffs and requirements with worked numbers, exercise and assignment, early assignment around a dividend, expiration day and 0DTE, multi-leg orders, options order flow, and what January 2021 taught. Account approval itself is in [Opening Accounts](/books/investing-and-digital-assets/opening-accounts#capabilities-and-approvals); futures and options on futures are in [Futures & FCMs](/books/investing-and-digital-assets/futures-and-fcms), and crypto options venues in [Perpetuals & Crypto Derivatives](/books/investing-and-digital-assets/perpetuals-and-crypto-derivatives), both later in this book.

## How the Platforms Do It

What brokers publish about options handling, as of November 2026:

| Platform | Levels | Automatic exercise | Can't fund an exercise | Assignment and early assignment |
| --- | --- | --- | --- | --- |
| **Alpaca** (Trading and Broker API) | 0 disabled; 1 covered calls and cash-secured puts; 2 adds buying calls and puts; 3 adds call and put spreads; each needs "sufficient options buying power" | In-the-money contracts exercised at expiry if in the money "by at least $0.01 USD"; do-not-exercise through support | Sells out the position "within 1 hour before expiry" | Assignments not sent on websocket events; the client polls the REST API; exercise requests between the close and midnight rejected |
| **Robinhood** | Level 2 and Level 3, Level 3 only in the margin account ([Opening Accounts](/books/investing-and-digital-assets/opening-accounts#capabilities-and-approvals)) | Attempts to exercise contracts "$0.01 or more in-the-money"; do-not-exercise requests until 5 PM ET | "May attempt to sell the contract" in the last 30 minutes before the close on expiration day, or earlier in some market conditions | Early assignment "may result in decreased buying power"; OCC notifies after the close, so a long leg can be exercised the next trading day at the earliest; positions with dividend risk may be closed the trading day before the ex-date |
| **FINRA Rule 2360** (the baseline every broker builds on) | No numeric levels; approval by a qualified principal | Exercise-by-exception under OCC Rule 805 for expiring equity options | Not addressed; a firm policy | Allocation of assignments to customers by first-in first-out or an approved automated random method |

Three patterns hold across them. **Levels are the broker's invention.** FINRA requires an approval and lists what to ask; the ladder from covered calls to spreads is each firm's, and the order path checks the account's level against the strategy, not just the instrument. **Expiration is a process the broker runs, not an event the market sends.** Both brokers decide before the close whether a customer can afford what an in-the-money option will turn into, and sell it if not. **Assignment arrives out of band and late.** The customer learns of it the next morning, from a file, and the broker has to have reserved for it.

## Contracts, Series and Symbols

Options are listed by **class** (all options on one underlying) and **series** (one type, strike and expiration within the class): "ABC June $50 calls" is a series. Prices are quoted per share, so a $2.00 quote on a contract for 100 shares costs $200 in premium. A broker's instrument for an option is the series, and its symbol is the compact OCC form APIs use: Alpaca's example `AAPL240119C00100000` is the AAPL January 19, 2024 $100 call, read as root `AAPL`, expiration `240119` (YYMMDD), type `C` and strike `00100000` in thousandths of a dollar.

Three properties of a series drive everything downstream:

- **Style.** American-style options (US equity options) can be exercised on any business day before expiration, so a short position can be assigned on any of them. European-style options, which include the cash-settled index options, can be exercised only at expiration.
- **Settlement.** Equity options settle physically: exercise delivers 100 shares per contract. Index options settle in cash: exercise pays the difference between the index and the strike times the multiplier.
- **Adjustments.** A split, merger or special dividend changes a series' deliverable rather than replacing it; the 100-share contract becomes, say, 150 shares or 100 shares plus cash, under a new root. The series' identity survives, its terms don't, and positions, symbols and requirements must follow the [Corporate Actions & Asset Events](/books/investing-and-digital-assets/corporate-actions#mergers-and-elections) record that changed them.

Options can't be internalized the way stocks are. OCC generally clears only standardized listed options that traded on an exchange, so the wholesalers that buy retail options flow act as consolidators: they choose the exchange on which the customer's order executes, often one where they are likely to trade with it as principal.

## Approval and the Disclosure Document

Before a broker accepts an options order or approves the account, the customer must have the Options Disclosure Document ("Characteristics and Risks of Standardized Options"), the document Rule 9b-1 requires the options markets to file and every broker to deliver, with amendments sent promptly to every customer approved for the affected classes. FINRA Rule 2360(b)(11) ties delivery to approval: "at or prior to the time such customer's account is approved for trading options." The approval itself, its profile, its 15-day verification and agreement clocks and the separate statement for uncovered writing are modeled in [Opening Accounts](/books/investing-and-digital-assets/opening-accounts#capabilities-and-approvals), and this chapter reads the result: an account's `options_level` and the strategies that level permits.

The mapping from a strategy to the level it needs is a table, versioned like any policy:

| Strategy | Risk shape | Alpaca level |
| --- | --- | --- |
| Covered call (short call against 100 shares held) | Stock risk, upside capped | 1 |
| Cash-secured put (short put with the strike's cash reserved) | Must buy at the strike | 1 |
| Long call or long put | Premium at risk | 2 |
| Vertical spread (long and short of the same type and expiry) | Defined by the strikes | 3 |
| Uncovered (naked) call or put | Unlimited (calls) or strike less premium (puts) | Not offered |

The check runs on the order as a whole. A two-leg spread entered as one order is level 3; the same two legs entered separately are a level 2 long followed by a short call the account isn't approved to hold uncovered, and the second order must be rejected unless the first has filled and the system recognizes the pair.

## Payoffs and Requirements

FINRA Rule 4210(f)(2) sets the margin on options. Long options "must be paid for in full." A short uncovered equity option requires 100% of its current market value plus 20% of the underlying's value, reduced by any out-of-the-money amount, but never below the option's value plus 10% of the underlying's value for a call, or 10% of the put's aggregate exercise price for a put. A short option in a spread requires the lesser of that and the spread's maximum potential loss. Three worked positions, my own numbers, on a stock XYZ:

**A covered call.** The customer owns 100 XYZ bought at $50.00 and sells one 30-day $55 call at $1.50, collecting $150. The stock fully covers the call, so there is no requirement beyond holding the shares.

| XYZ at expiration | Stock P&L | Call | Total |
| ---: | ---: | --- | ---: |
| $45.00 | −$500 | Expires, keep $150 | **−$350** |
| $50.00 | $0 | Expires, keep $150 | **+$150** |
| $55.00 | +$500 | Expires at the money, keep $150 | **+$650** |
| $60.00 | +$500 (assigned at $55) | Assigned; shares delivered | **+$650** |

Break-even is $48.50 ($50.00 − $1.50). The maximum gain is $650, reached at $55 and capped there; the maximum loss is $4,850 if XYZ goes to zero. The call sold $500 of upside above $55 for $150 today.

**A debit vertical (bull call spread).** XYZ at $50. Buy the $50 call at $3.00, sell the $55 call at $1.20, same expiration: a net debit of $1.80, $180 for one spread.

- Maximum loss: **$180**, the debit, if XYZ is at or below $50 at expiration.
- Maximum gain: ($55 − $50 − $1.80) × 100 = **$320**, at or above $55.
- Break-even: $51.80.
- Requirement: the long call is paid in full and the short call's maximum potential loss against it is zero, so the account needs the $180 and nothing more.

**A credit vertical (bull put spread).** XYZ at $52. Sell the $50 put at $2.10, buy the $45 put at $0.80: a net credit of $1.30, $130 received.

- Uncovered, the short $50 put would require $210 + 20% × $5,200 − $200 out of the money = **$1,050**, above its floor of $210 + 10% × $5,000 = $710.
- In the spread, the requirement is the lesser of $1,050 and the maximum potential loss, the $5 width: **$500**. The $130 credit pays part of it, so the trade uses $370 of the customer's buying power.
- Maximum loss: ($5.00 − $1.30) × 100 = **$370**, below $45. Maximum gain: the $130 credit, above $50. Break-even: $48.70.

The spread's requirement equals its maximum loss, which is why a defined-risk spread is approved at a lower level than the uncovered put it contains: the long put is what makes the number finite. That holds only while both legs exist. If the short put is assigned early, the account holds 100 shares bought at $50 ($5,000) and a long put; until the put is exercised or the stock sold, the requirement is the stock's, not $500.

## Exercise and Assignment

A holder exercises by instruction to the broker, which sends it to OCC through its clearing member; OCC assigns the exercise to a clearing member with a short position in the series, and that member allocates it to one of its customers who is short. FINRA Rule 2360(b)(23)(C) requires the allocation to be "on a 'first in-first out' or automated random selection basis that has been approved by FINRA," fixed in advance and changed only with FINRA's approval. The customer can't choose to be assigned or not; the method decides.

At expiration the default is automatic. Expiring standardized equity options "are subject to the Exercise-by-Exception ('Ex-by-Ex') procedure" of OCC Rule 805, under which contracts in the money by specified amounts are exercised unless the holder instructs otherwise. Alpaca and Robinhood both state $0.01 in the money as the point at which they exercise. A holder who wants a different outcome files a contrary instruction: Rule 2360 gives holders until 5:30 p.m. ET on the business day of expiration to make a final exercise decision, and gives members until 7:30 p.m. ET to submit a Contrary Exercise Advice for customer accounts. Brokers set earlier internal cutoffs inside that window (Robinhood's do-not-exercise cutoff is 5 PM ET) so they can process them.

An exercise or assignment is a stock trade without an order. Exercising one $55 call buys 100 shares at $55 for $5,500; being assigned on it sells (or sells short) 100 shares at $55. The ledger posts it as a trade dated the exercise date, with the option position closed and the stock position opened at the strike, and the premium folds into the stock's cost basis or proceeds ([Cost Basis, Tax Lots & Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots#basis-and-holding-period) covers the lot treatment).

## Early Assignment and Dividends

An American-style short option can be assigned on any business day, but a holder rarely exercises early, because exercising throws away the option's time value: the premium above its intrinsic value, which a sale would capture. The common exception is a call the day before a stock goes ex-dividend. The owner of the stock on the ex-date gets the dividend; the owner of the call does not, and the stock price drops by about the dividend at the open.

**Worked numbers, my own.** XYZ is $60.00 and goes ex-dividend tomorrow for $1.00. The $55 call expiring in two weeks is bid at $5.15: intrinsic value $5.00, time value $0.15.

- **Sell the call today:** $5.15.
- **Hold it:** XYZ opens ex-dividend near $59.00, intrinsic value $4.00, and the call is worth roughly $4.10 to $4.20 with what time value remains.
- **Exercise today:** pay $55 for stock worth $60, which tomorrow is $59 of stock plus the $1.00 dividend. Value **$5.00**.

Exercising beats holding by about $0.85 ($5.00 against roughly $4.15), because the $1.00 dividend exceeds the $0.15 of time value given up. Selling at a $5.15 bid would do slightly better still, but a buyer at that price faces the same choice, so the holder's real alternatives are sell or exercise; holding through the ex-date is the one that loses. The simplified rule is that a call is at risk of early exercise when the dividend is larger than its remaining time value, which is why deep in-the-money calls near a dividend are the ones assigned.

Now the short side. A customer holds the $55/$60 call spread the other way: short the $55 call, long the $60 call. Assigned overnight on the $55 call, the account wakes up on the ex-date short 100 shares at $55 and owes the $1.00 dividend, $100, to the lender of the shares as a payment in lieu. The long $60 call can't be exercised until the next trading day at the earliest, since OCC's notice arrives after the close. The defined-risk spread became a short stock position with a long call against it, the short stock's margin requirement applies instead of the spread's, and an account that was fine at the close can open in a margin call. Robinhood's published practice is to close positions with dividend risk on the trading day before the ex-date when the dividend is large relative to the account; the system needs the ex-date calendar from [Corporate Actions & Asset Events](/books/investing-and-digital-assets/corporate-actions#record-ex-and-pay-dates) joined to every short call to find them.

## Expiration Day and 0DTE

Expiration is a batch job with deadlines, run per position:

![A long option on expiration day: open moves to pre_close_review on expiry day, then to evaluated at the close, then to the terminal state exercised when in the money, with that path accented. A dashed exit from pre_close_review down to the terminal state sold_out when the account can't fund the exercise, and a dashed exit from evaluated down to the terminal state expired when out of the money or under a do-not-exercise instruction.](/diagrams/ida-option-expiration.svg "The broker decides before the close whether an in-the-money long can be funded and sells it if not; after the close, exercise-by-exception or the customer's instruction decides. Robinhood sells in the last 30 minutes, Alpaca within the last hour.")

1. **Before the close: can each likely exercise be funded?** For every long in or near the money, compute what exercise would create: 100 shares per contract at the strike for a call, a short sale of 100 shares for a put the account doesn't own the stock for. If the account can't carry the result in cash or margin, sell the option before the close. Robinhood does this in the last 30 minutes, Alpaca within the last hour.
2. **Short positions at risk.** A short option near the money ("pin risk") may or may not be assigned, and the customer learns which the next morning. A short call in a cash account that would be assigned into a short stock position, or a short put into a purchase the account can't pay for, is closed or flagged the same way.
3. **After the close: evaluation.** Apply the exercise-by-exception threshold to the closing price, apply contrary instructions received before the cutoff, and submit to OCC.
4. **Next morning: post the results.** Exercises and assignments become stock trades and cash movements, positions roll, and any account left in deficit gets a call.

**Worked numbers, my own.** An account with $8,000 of cash and no margin holds 10 XYZ $55 calls expiring today, with XYZ at $58.00 at 3:00 p.m. Exercise would buy 1,000 shares for $55,000. The account can't pay, so the broker sells the 10 calls before the close at about their $3.00 intrinsic value, crediting roughly $3,000 to the account instead of delivering $58,000 of stock it would have had to liquidate on Monday at whatever price Monday opened at.

**Zero-days-to-expiration (0DTE)** options are series bought or sold on their expiration day. Cboe reported for the third quarter of 2026 that 0DTE index options averaged 3.4 million contracts a day, 56% of index option volume, against market-wide options volume of 70.6 million contracts a day. For a broker the product changes the operational window, not the rules: a 0DTE position's whole life fits between the open and the pre-close review, buying power and approval checks run on a contract that will be decided within hours, and cash settlement of index options removes the delivery question but not the pre-close risk of a large short position.

## Multi-Leg Orders

A spread, straddle or condor is one order with several legs, a ratio per leg and a net price (a debit or credit for the whole package). The order system has to keep it one thing:

- **One order, one approval check, one requirement.** The level and buying power checks run on the package; legs inherit them.
- **Fill as a package or not at all.** Exchanges offer complex order books and auctions where the package trades at a net price; legging in (filling one leg and then the other) exposes the customer to the price moving between them and to holding a short leg alone, which the approval may not allow.
- **Order types narrow.** Alpaca limits stop and stop-limit orders to single-leg options orders and requires `day` or `gtc` time in force with no extended hours on options.
- **Payment per contract differs.** Wholesalers pay a different schedule per contract for multi-leg orders than for single-leg ones, and some pay nothing on index options; [How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models#payment-for-order-flow) works the per-contract numbers.

The legs of a filled spread are stored as separate positions with a link, because they can be closed, assigned or adjusted separately, and the requirement has to be recomputed when one disappears.

## What 2020 and 2021 Taught

Options volume rose with commission-free retail trading. The SEC staff's report on January 2021 traced listed options from about 19.6 million contracts a day in December 2019 to over 30 million in the first quarter of 2020 and 34.3 million in December 2020, with one-contract trades rising to 14% of volume in 50 heavily traded stocks. In GameStop, options traded a median of about 16,000 contracts a day through most of 2020 and more than 2 million contracts, worth over $8 billion, on January 27, 2021. Three retail brokers, Robinhood, TD Ameritrade and E*Trade, were over 66% of individual accounts trading GME options.

Two lessons stuck. **Product limits are risk controls.** One broker described in the report cut its per-customer GME option limit from 5,000 contracts to 3,000, then 300, then 100 within two days while it raised GME margin requirements from 80% to 100%; the limit is a row in a table, not a code change ([Pre-Trade Risk, Halts & Volatility](/books/investing-and-digital-assets/pre-trade-risk-and-halts#clearing-deposits-and-the-january-2021-restrictions)). **Approval is supervised, not automated away.** FINRA's settlement with Robinhood Financial (AWC No. 2020066971201, accepted June 30, 2021) found that although its procedures gave registered options principals the job of approving options accounts, in practice it relied on "option account approval bots" with only limited oversight by principals. The bots read only a customer's latest answers, so customers rejected for options trading were often approved minutes later on contradictory information, and customers under 21 claiming three years' options experience were approved; the firm approved thousands of customers who didn't meet its own eligibility criteria, in violation of FINRA Rules 3110, 2360 and 2010. The durable rule is the one [Opening Accounts](/books/investing-and-digital-assets/opening-accounts#capabilities-and-approvals) models: every approval is made against a stored profile by an accountable principal, and the order path enforces the level that resulted.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `instruments` (with `instrument_type = 'option'` and the OCC symbol as `symbol`), `orders`, `positions`, `asset_events` and `journal_entries`, and against `capability_approvals` from [Opening Accounts](/books/investing-and-digital-assets/opening-accounts#capabilities-and-approvals). This chapter adds the series terms, the strategy table, exercise instructions, assignments and expiration runs. Multi-leg orders use `order_legs` from [Orders & Order Types](/books/investing-and-digital-assets/orders-and-order-types).

```sql
CREATE TABLE option_series (                -- the terms of one listed series
  instrument_id      UUID PRIMARY KEY REFERENCES instruments (id),
  underlying_id      UUID NOT NULL REFERENCES instruments (id),
  root               TEXT NOT NULL,             -- changes on an adjustment
  option_type        TEXT NOT NULL CHECK (option_type IN ('call', 'put')),
  strike             NUMERIC(18, 6) NOT NULL,
  expires_on         DATE NOT NULL,
  style              TEXT NOT NULL CHECK (style IN ('american', 'european')),
  settlement         TEXT NOT NULL CHECK (settlement IN ('physical', 'cash')),
  multiplier         INT NOT NULL DEFAULT 100,
  deliverable        JSONB NOT NULL,            -- {"shares": 100} or shares plus cash after an adjustment
  adjusted_by_event  UUID REFERENCES asset_events (id),
  UNIQUE (underlying_id, root, option_type, strike, expires_on)
);

CREATE TABLE option_strategies (            -- which level each strategy needs, versioned policy
  code               TEXT NOT NULL,             -- 'covered_call', 'cash_secured_put', 'long', 'vertical', 'uncovered'
  policy_version     TEXT NOT NULL,
  min_level          SMALLINT,                  -- NULL: not offered
  requires_margin    BOOLEAN NOT NULL,
  PRIMARY KEY (code, policy_version)
);

CREATE TABLE exercise_notices (             -- instructions from the customer or the firm
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  instrument_id      UUID NOT NULL REFERENCES option_series (instrument_id),
  contracts          INT NOT NULL CHECK (contracts > 0),
  kind               TEXT NOT NULL CHECK (kind IN ('exercise', 'do_not_exercise', 'ex_by_ex')),
  source             TEXT NOT NULL CHECK (source IN ('customer', 'firm', 'automatic')),
  received_at        TIMESTAMPTZ NOT NULL,
  cutoff_at          TIMESTAMPTZ NOT NULL,      -- the firm's cutoff it was judged against
  status             TEXT NOT NULL CHECK (status IN ('received', 'submitted', 'accepted',
                       'rejected', 'canceled')),
  submitted_at       TIMESTAMPTZ,               -- to OCC through the clearing member
  journal_entry_id   UUID REFERENCES journal_entries (id)  -- the stock trade it became
);

CREATE TABLE assignments (                  -- OCC assignments allocated to customer accounts
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id      UUID NOT NULL REFERENCES option_series (instrument_id),
  occ_ref            TEXT NOT NULL,             -- the assignment as reported by the clearing member
  assigned_on        DATE NOT NULL,             -- the exercise date
  contracts          INT NOT NULL CHECK (contracts > 0),
  account_id         UUID REFERENCES accounts (id),  -- NULL until allocated
  allocation_method  TEXT NOT NULL CHECK (allocation_method IN ('fifo', 'random')),
  allocation_seed    TEXT,                      -- reproduces a random draw
  journal_entry_id   UUID REFERENCES journal_entries (id),
  UNIQUE (occ_ref, account_id)
);

CREATE TABLE expiration_runs (              -- one run per expiration date, one row per position
  run_id             UUID NOT NULL,
  expires_on         DATE NOT NULL,
  account_id         UUID NOT NULL REFERENCES accounts (id),
  instrument_id      UUID NOT NULL REFERENCES option_series (instrument_id),
  contracts          INT NOT NULL,              -- signed: long positive, short negative
  underlying_price   NUMERIC(18, 6),            -- at the review, then at the close
  state              TEXT NOT NULL CHECK (state IN ('open', 'pre_close_review', 'evaluated',
                       'sold_out', 'exercised', 'assigned', 'expired')),
  required_to_carry  BIGINT,                    -- USD cents the exercise result needs
  available          BIGINT,                    -- USD cents of cash or margin it had
  closing_order_id   UUID REFERENCES orders (id),  -- the sell-out, if any
  decided_at         TIMESTAMPTZ,
  PRIMARY KEY (run_id, account_id, instrument_id)
);
```

Design notes:

- **The series row is the contract.** Strike, multiplier and deliverable live on `option_series`, and every requirement and exercise reads them from there, so an adjusted series (150 shares, a new root) computes correctly without special cases.
- **Exercise is a trade posted by the system.** An accepted `exercise_notices` row or an allocated `assignments` row posts one balanced entry: the option position closed, the stock position opened at the strike, cash moved, and the premium carried into the lot. The idempotency key is the notice or the OCC reference ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)).
- **The expiration run is a state machine with a clock** ([Explicit State Machines](/docs/money/payment-states#explicit-state-machines)): positions advance only forward, the sell-out decision stores what was required and what was available, and a rerun after a restart resumes from the stored states rather than recomputing decisions already acted on.
- **Random allocation is reproducible.** Store the method and the seed or the FIFO ordering so an examiner, or a customer asking "why me", can be shown the draw.
- **Dividend risk is a join.** Short calls joined to `asset_events` with an ex-date tomorrow and an in-the-money amount whose time value is below the dividend produce the list Robinhood-style practices act on.

## Auditing

Options records are examined by FINRA and the options exchanges, and disputes about expiration day are common. Keep:

- **Every approval and the level in force** at the time of each order, with the ODD delivery that preceded it.
- **Every exercise instruction,** with its receipt time, the cutoff it was judged against, and what was submitted to OCC.
- **Every assignment and its allocation:** the method, the seed or ordering, and the accounts that were eligible, so the allocation can be shown to be fair.
- **Every expiration run decision:** the price used, the requirement computed, what the account had, and the sell-out order if there was one.
- **Every multi-leg order** as a package, with its net price and leg fills.

## What This Means for the System You Build

- **Model the series, not the symbol:** strike, style, settlement, multiplier and deliverable, adjusted by corporate actions.
- **Check approval against the strategy of the whole order,** and treat legs entered separately as what they are.
- **Compute requirements from the rule, per leg and per package,** and recompute when a leg is assigned or closed.
- **Run expiration as a state machine** with a pre-close funding review, a cutoff for instructions, and a morning posting of exercises and assignments.
- **Allocate assignments by a fixed method** and store enough to reproduce each draw.
- **Join short calls to the dividend calendar** the day before every ex-date.
- **Keep product limits as data** that risk can tighten in minutes.

## References

**Law and regulation**

- [17 CFR 240.9b-1: Options disclosure document](https://www.law.cornell.edu/cfr/text/17/240.9b-1), the ODD's content, delivery before accepting an order or approving the account, and amendments to approved customers

**Regulators and guidance**

- [FINRA Rule 2360: Options](https://www.finra.org/rules-guidance/rulebooks/finra-rules/2360), ODD delivery at or before approval, exercise-by-exception under OCC Rule 805, the 5:30 p.m. ET final exercise decision and 7:30 p.m. ET Contrary Exercise Advice, and first-in first-out or random allocation of assignments
- [FINRA Rule 4210: Margin Requirements](https://www.finra.org/rules-guidance/rulebooks/finra-rules/4210), long options paid in full, the requirement on short uncovered options and on short options in spreads
- [SEC: Staff Report on Equity and Options Market Structure Conditions in Early 2021 (October 2021)](https://www.sec.gov/files/staff-report-equity-options-market-struction-conditions-early-2021.pdf), classes and series, 100-share contracts, OCC as clearing agency for 16 exchanges and only for exchange-traded options, options volume in 2020, GME options volume, the three brokers over 66% of accounts, and one broker's GME option limits

**Filings**

- [Robinhood Markets: Q3 2026 results (October 27, 2026)](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000164/q32026robinhoodexhibit991.htm), options revenue of $399 million (against $121 million equities and $120 million crypto) and 905 million contracts traded

**Courts and enforcement**

- [FINRA: Letter of Acceptance, Waiver and Consent No. 2020066971201, Robinhood Financial LLC (accepted June 30, 2021)](https://www.finra.org/sites/default/files/2021-06/robinhood-financial-awc-063021.pdf), options approval by "option account approval bots" with limited principal oversight, reapplication and under-21 findings, and the Rules 3110, 2360 and 2010 violations

**Vendor documentation**

- [Alpaca: Options trading](https://docs.alpaca.markets/docs/options-trading), levels 0 to 3, the example contract symbol, automatic exercise at $0.01 in the money, sell-out within one hour before expiry, assignments by REST only, order types and time in force for options (updated September 16, 2026)
- [Robinhood: Expiration, exercise, and assignment](https://robinhood.com/us/en/support/articles/expiration-exercise-and-assignment/), exercise at $0.01 in the money, selling in the last 30 minutes, the 5 PM ET do-not-exercise cutoff, early assignment and buying power, after-close notice from OCC, and dividend risk closes

**In practice**

- [Cboe: State of the options industry, Q3 2026 (October 19, 2026)](https://www.cboe.com/insights/posts/state-of-the-options-industry-q-3-2026-volume-growth-concentrated-in-index-and-etf-options), 0DTE index options at 3.4 million contracts a day and 56% of index volume, and 70.6 million contracts a day market-wide
