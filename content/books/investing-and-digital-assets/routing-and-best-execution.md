+++
title = "Order Routing, PFOF & Best Execution"
nav_title = "Routing & Best Execution"
description = "FINRA 5310 and regular and rigorous review, Rule 606 and 605 reports read line by line, price improvement, smart order routers and crypto best execution."
category = "Investing & Digital Assets Industry"
order = 2516
part = "Trading and Markets"
tags = ["investing", "best-execution", "pfof", "rule-605", "rule-606", "routing"]
+++

A broker that sends an order somewhere owes the customer the best execution reasonably available there and then, and has to be able to prove it afterward, order by order or in a review rigorous enough to stand in for that. The broker chooses the venue, often gets paid by the venue it chooses, and is the only party that sees both the customer's price and its own revenue on the same fill. The rules respond in three ways: a conduct duty (FINRA Rule 5310) that the broker can't contract away, public disclosure of where orders go and what the broker was paid (Rule 606), and public statistics on how well they were filled (Rule 605). Each produces records a router has to write at the moment it decides, because none of them can be reconstructed accurately later.

This chapter covers the duty and the regular and rigorous review, a worked order's NBBO and price improvement, a Rule 606 report and a Rule 605 report read line by line, the 2024 amendments to Rule 605 now in force, the withdrawn proposals, how smart order routers decide, and best execution for crypto where there is no NBBO. The economics of payment for order flow are worked in [Payment for Order Flow](/books/investing-and-digital-assets/revenue-models#payment-for-order-flow); this chapter is about the routing and the proof. It extends `executions`, `venues` and `order_events` from [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) with `routing_rules`, `routing_decisions`, `execution_quality_samples`, `best_execution_reviews` and `routing_reports`.

## How the Platforms Do It

Routing models from public reports and pages, as of November 2026:

| Firm | Where retail orders go | What it is paid | What it publishes on quality |
| --- | --- | --- | --- |
| **Robinhood** (equities) | Non-directed orders to five wholesalers (April 2026, S&P 500: Virtu 35.27%, Citadel 27.38%, G1 14.00%, Jane Street 13.17%, HRT 5.28%), no exchanges | 12.35% of the NBBO spread in regular hours and 9% in extended hours, the same percentage for every non-exchange venue; $0.0006 a share overnight | Monthly Rule 605 reports for Robinhood Financial and Robinhood Securities, posted through S3 |
| **Robinhood** (crypto) | Market maker routing by default; optional exchange routing that "will evaluate multiple partner exchanges" for market and stop orders; limit orders generally to its affiliate Bitstamp | $0.95 per $100 of notional from its market maker as of June 15, 2026, inside the spread; no rebate from exchanges | A page describing the two routes, which says neither "guarantees better pricing execution" |
| **Fidelity** (equities) | Routed under an Order Flow Management Team that sets execution quality measures and monitors market centers | Its execution quality page doesn't say | 95.37% of shares price improved and 98.88% within the NBBO in the first quarter of 2026, 0.03 seconds average speed, $0.0056 average effective spread |
| **Charles Schwab** | Not read: its execution quality and routing pages refused automated access when this chapter was written | | |
<!-- source-gap: schwab-606-routing | missing | Charles Schwab's current Rule 606 venues, PFOF terms and execution quality statistics | closes with: Schwab's Q2 or Q3 2026 Rule 606 report and execution quality page, opened | checked: 2026-11-10 -->

Two patterns stand out. **Brokers that accept payment publish the formula, and the formula is uniform across venues** (Robinhood's 12.35% is the same for every wholesaler), because a payment that differed by venue would be an inducement to route by payment instead of quality. And **quality claims are made against the consolidated NBBO at receipt,** the benchmark Rule 605 fixes, so they are comparable across brokers in a way their marketing pages are not.

## The Duty

FINRA Rule 5310(a)(1) requires a member to "use reasonable diligence to ascertain the best market for the subject security and buy or sell in such market so that the resultant price to the customer is as favorable as possible under prevailing market conditions." The factors it lists are the character of the market (price, volatility, liquidity, pressure on communications), the size and type of transaction, the number of markets checked, the accessibility of the quotation, and the terms and conditions of the order. Around that core:

- **No interpositioning.** A firm may not put a third party between itself and the best market in a way that hurts the customer (5310(a)(2)).
- **Marketable orders fully and promptly.** Supplementary Material .01.
- **Customer-directed orders are the exception.** If a customer directs an order to a market, the firm needn't make its own determination, but must still process it promptly (.08).
- **Regular and rigorous review.** A firm that doesn't evaluate each order individually must review execution quality regularly and rigorously, at least quarterly, by security and by order type, comparing the quality it gets against what competing markets offer, on price improvement, price disimprovement, the likelihood of execution of limit orders, speed, size, transaction costs, customers' needs and expectations, and the existence of internalization or payment for order flow arrangements (.09). An introducing broker may rely on its clearing or executing firm's review only if the results and rationale are fully disclosed to it and it periodically reviews how that firm does it.

FINRA's Regulatory Notice 15-46 (November 2015) sharpened the review. A firm has to compare against competing markets it doesn't route to, since reviewing only current venues "would not satisfy the duty of best execution"; a broker that routes all its flow to another broker-dealer without independently reviewing the quality violates the duty; orders a firm internalizes need order-by-order analysis; of the firms that review more often than quarterly, most do it monthly; and order routing inducements, payment for order flow included, "cannot be allowed to interfere with a broker-dealer's duty of best execution."

The design consequence: the review is a data product. It needs every order's NBBO at receipt, every fill, every venue's comparable statistics, and the routing table in force when each order was routed, kept for every quarter the review covers.

## One Order, Worked

A customer buys 300 shares at market. The consolidated NBBO when the broker receives the order is $50.00 by $50.04. The wholesaler fills all 300 at $50.01, with the NBBO unchanged at execution. My numbers:

| Measure | How | Result |
| --- | --- | --- |
| Quoted spread | $50.04 − $50.00 | $0.04 a share |
| Midpoint | ($50.00 + $50.04) ÷ 2 | $50.02 |
| Price improvement per share | NBO − fill = $50.04 − $50.01 | $0.03 |
| Price improvement on the order | $0.03 × 300 | $9.00 |
| Effective spread | 2 × \|fill − midpoint\| = 2 × $0.01 | $0.02 a share |
| Effective over quoted (E/Q) | $0.02 ÷ $0.04 | 0.50 |
| Payment to the broker at 12.35% of the spread | $0.04 × 0.1235 × 300 | about $1.48 |

The customer got $9.00 of the value inside the spread and the broker $1.48, a split of about 86/14 between the customer and the broker (my arithmetic). The SEC's staff report on early 2021 described the SEC's December 2020 order against Robinhood as finding roughly a 20/80 split of that value, against the 80/20 that was typical. The split on each fill is exactly what a best execution review has to be able to show, and it needs three numbers stored at the time: the NBBO at receipt, the NBBO at execution (the payment formula uses execution, Rule 605 uses receipt), and the fill.

Two refinements every real measurement needs:

- **Disimprovement counts.** A fill at $50.05 is $0.01 of disimprovement on the same arithmetic, and a review that averages improvement only over improved fills hides it.
- **Odd lots and the round lot.** If a 60-share odd-lot offer sat at $50.03 at another venue, the customer's $50.01 still beat it, but a fill at $50.035 would show improvement against the NBBO and none against the best odd-lot order. Since the 2024 amendments added the best odd-lot order to odd-lot information, a review can measure against it as well ([Round Lots and Odd Lots](/books/investing-and-digital-assets/equity-market-structure#round-lots-and-odd-lots)).

## Reading a Rule 606 Report

Rule 606(a)(1) requires every broker-dealer to publish a quarterly report, by calendar month, on its non-directed orders: held orders in NMS stocks, in separate sections for S&P 500 stocks and other stocks, and customer orders in options. It must be public within one month after the quarter ends and stay posted for three years. Each section gives the split of orders by type and, for the top ten venues and any venue receiving 5% or more, the share routed there and the net payment for order flow, profit-sharing, fees and rebates, in dollars and per share, plus the material aspects of each relationship.

Robinhood Financial's report for the second quarter of 2026 (generated July 25, 2026), April 2026, S&P 500 stocks, line by line:

**The summary line.** Non-directed orders were 100.00% of all orders: customers didn't choose the venue. Of them, 43.88% were market orders, 12.69% marketable limit, 33.43% non-marketable limit and 10.01% other. More than half the flow is marketable (56.57%, my arithmetic), the part wholesalers pay most for.

**The venue rows:**

| Venue | Share of orders | Market orders: payment | Cents per 100 shares | Implied shares (my arithmetic) | Non-marketable limit: cents per 100 shares |
| --- | --- | --- | --- | --- | --- |
| Virtu Americas | 35.27% | $617,644.88 | 77.2470 | about 80.0 million | 142.0905 |
| Citadel Securities | 27.38% | $500,262.74 | 62.5715 | about 80.0 million | 119.1600 |
| G1 Execution Services | 14.00% | $530,588.82 | 84.2977 | about 62.9 million | 95.1176 |
| Jane Street Capital | 13.17% | $453,850.38 | 93.4673 | about 48.6 million | 150.4299 |
| Hudson River Trading | 5.28% | $167,862.79 | 68.0461 | about 24.7 million | 57.5060 |

How to read the columns:

- **Share of orders is by order count, payment is by shares.** Virtu got 35.27% of the orders but about the same number of market-order shares as Citadel with 27.38%; the dollars divided by the per-share rate give the shares (617,644.88 ÷ 0.0077247 ≈ 79.96 million), and they show average order size differs by venue.
- **These are 80% of the payments.** The material aspects text explains that Robinhood Financial routes to its affiliated clearing firm, Robinhood Securities, which routes to the market centers and passes 80% of the revenue to Robinhood Financial; "the amounts above accordingly represent 80% of the payments received." Grossed up, Virtu's market-order rate is about 96.56 cents per hundred shares to the group (77.2470 ÷ 0.8). Robinhood Securities' own report, which says it is paid only for routing on behalf of Robinhood Financial, lists Virtu at 96.31 cents; the reports don't explain the small difference.
- **The rate implies the spread.** At 12.35% of the spread, 96.56 cents per hundred shares is an average spread at execution of about 7.8 cents a share for Virtu's fills, and about 9.5 cents for Jane Street's (116.83 ÷ 100 ÷ 0.1235). The formula is uniform; the rates differ because each venue got different stocks at different times of day.
- **Non-marketable limit orders pay more per share.** Virtu paid 142.09 cents per hundred shares on non-marketable limit orders that executed, nearly double its market-order rate, because those fills tend to come in wider-spread conditions. A reader looking for whether limit orders rest on an exchange, where they could be seen by the whole market, finds here that they go to wholesalers too.
- **"Other orders" are not small.** 10.01% of non-directed orders were "other," which the rule uses for orders with special handling.
- **What is excluded matters as much as what's included.** The material aspects text says Robinhood Financial treats fractional, dollar-based, recommended-ETF-portfolio, 24 Hour Market, recurring and dividend reinvestment orders batched by Robinhood Securities' "order batcher engine," round-ups and adviser orders as "not held," and excludes them from these statistics. A broker whose customers mostly buy in dollars publishes a 606 report about a minority of its orders.
- **Options are a different market.** In the options section for the same month, market orders were 2.32% of non-directed orders and non-marketable limit orders 53.57%; Citadel Securities received 42.30% of them and paid $16,692,959.38 for marketable limit orders, at a rate of 33.7625 in a column the template labels cents per hundred shares, the per-contract payments that [Payment for Order Flow](/books/investing-and-digital-assets/revenue-models#payment-for-order-flow) works through.

Robinhood Securities' report adds the terms: payment is a fixed percentage of the spread at execution, the same for all non-exchange market centers; it "attests to the retail nature of the orders" on request; and it quotes the SEC examination staff's observation of "a potential tradeoff between (i) payments received by brokers and (ii) price improvement and/or execution quality," stating that it believes its payment doesn't interfere with best execution.

Rule 606(b) adds reports on request. A customer can ask where their orders went; and a customer placing not-held orders gets, within seven business days of asking, a report on the prior six months by venue, with shares routed, executed, fill rates, average fees or rebates to four decimal places and liquidity provided and removed, unless not-held orders were under 5% of the NMS stock shares the firm received from customers or the customer averaged under $1 million a month of them. Every routed child order therefore needs its parent, venue, fee and liquidity flag recorded per customer.

## Reading a Rule 605 Report

Rule 606 says where orders went; Rule 605 says how they were filled. The 2024 amendments (Release 34-99679, adopted March 6, 2024, 89 FR 26428) extended the reporting duty from market centers to brokers that introduce or carry 100,000 or more customer accounts trading NMS stocks, with separate reports where a firm is both; moved order size categories to notional value; added time-to-execution buckets starting under 100 microseconds, measured from receipt or, for non-marketable orders, from when they became executable; added realized spreads at 50 milliseconds through 5 minutes; and added a summary report in CSV. Compliance moved from December 14, 2025 to August 1, 2026 (Release 34-104147), and the April 1, 2026 exemptive order (Release 34-105136) carved out dividend reinvestment fractions, rewrote the halt, inactive-stock (five trades a day or fewer) and crossed-market (30 seconds or more) exemptions, and rescinded the manual-order exemption. Reports are due within one month after each month and stay public for three years.

Robinhood Financial's summary report for September 2026, S&P 500 stocks, market orders of $1,000 to under $5,000, one row:

| Field | Value | Read as |
| --- | --- | --- |
| `AvgOrderQty` | 13.877741 | About 13.9 shares per order |
| `AvgOrderSize` | 2313.77141 | About $2,314 per order |
| `ExctdOrderMidPtAvg` | 166.718372 | Average NBBO midpoint at receipt, $166.72 |
| `PctExctdAtQuotOrBetter` | 0.977667 | 97.77% of shares at or better than the quote |
| `PctExctdPI` | 0.899109 | 89.91% of shares price improved |
| `WghtdAvgPctPI` | 0.000234 | Price improvement 2.34 basis points of the midpoint, about $0.039 a share |
| `AvgPctQuotSprd` | 0.000577 | Quoted spread 5.77 bp, about $0.096 a share |
| `AvgEffctvSprdPct` | 0.000110 | Effective spread 1.10 bp, about $0.018 a share |
| `AvgEFQPct` | 0.190503 | E/Q of 0.19 |
| `AvgRealSprdPct15sec` | 0.0001 | Realized spread at 15 seconds, 1.0 bp |
| `WghtdAvgExctnTime` | 162.405643 | About 162 milliseconds from receipt to execution |

The dollar readings are mine (bp × $166.72). The fields check each other: half the quoted spread (2.885 bp) minus half the effective spread (0.55 bp) is 2.335 bp, the reported price improvement. On the average order of 13.9 shares, $0.039 a share is about $0.54. An E/Q of 0.19 means customers paid about a fifth of the quoted spread, the measure the SEC's 2022 data on wholesalers was built on. The realized spread at 15 seconds, nearly the whole effective spread, says the price barely moved against the filler afterward: the low adverse selection of retail flow that [Retail Flow](/books/investing-and-digital-assets/equity-market-structure#retail-flow) describes.

The same report's non-S&P 500 row for the same order size shows a different market: midpoint $4.97, 58.98% of shares price improved, E/Q 0.42 and 195 milliseconds. A review that compared only S&P 500 rows would miss where execution quality is weakest. The rule itself says the statistics "alone" don't show that a firm failed to get the most favorable terms reasonably available: a 605 row is evidence for the review, not the review.

## The Proposals That Were Withdrawn

In December 2022 the SEC proposed two rules that would have changed this chapter: the Order Competition Rule, requiring many retail orders to be exposed in qualified auctions before a wholesaler could internalize them, and Regulation Best Execution, an SEC-level best execution rule with stricter policies for conflicted transactions. The proposal's own analysis is the most detailed public picture of the market it would have changed: in the first quarter of 2022, the six largest wholesalers paid retail brokers $235 million for order flow, and the SEC estimated a competitive shortfall of about 1.08 basis points per dollar traded, about $1.5 billion a year. Both proposals were withdrawn on June 17, 2025 (90 FR 25531). As of November 2026 the US regime is FINRA 5310, Rules 605 and 606 and the disclosure on confirms; [Beyond the US](/books/investing-and-digital-assets/beyond-the-us) covers how other markets treat payment for order flow.

## Smart Order Routers

A smart order router decides, for each order or child order, where to send what. Its inputs are the NBBO and every venue's book from direct feeds, each venue's fees and rebates (now determinable at execution under Rule 610(d)), its own fill history per venue, order protection obligations, and the broker's routing policy. Interactive Brokers describes its SmartRouting as never relinquishing control of the order and rerouting dynamically; the wholesaler model is the opposite, a router whose main decision is which wholesaler gets each order.

Worked numbers, my own: a broker's router must buy 1,000 shares of a $20 stock, NBO $20.00, with a limit of $20.01.

| Venue | Offer | Shares | Take fee | All-in cost per share |
| --- | --- | --- | --- | --- |
| Exchange X | $20.00 | 400 | $0.0030 (today's cap) | $20.0030 |
| Exchange Y | $20.00 | 400 | $0.0010 | $20.0010 |
| ATS Z, midpoint peg | $19.995 (midpoint of $19.99 by $20.00) | unknown, maybe 300 | $0.0010 | $19.9960 |
| Exchange W | $20.01 | 500 | $0.0020 | $20.0120 |

A router that only looks at price sends 400 to X and 400 to Y and 200 to W at $20.01, for $20,004.00 all in. One that ranks by all-in cost pings the ATS first for the midpoint, takes what it finds there, then Y, then X, and only then W. If Z fills 300, the order costs $5,998.80 at Z (300 × $19.996) and $14,001.30 at Y and X (400 at $20.0010 and 300 at $20.0030), $20,000.10 in total, my arithmetic: $3.90 cheaper on $20,000, with the risk that the dark ping took time while the lit offers moved. Every one of those choices is a routing decision with a reason, and that is the record best execution reviews sample.

Four rules I would build any router on:

- **Record the decision, not just the destination:** the book it saw, the candidates it ranked, the rule that chose, and the child orders sent, per order.
- **Rank on all-in cost and fill probability,** with venue statistics from its own history, refreshed and versioned, never on rebate alone.
- **Order protection is a constraint, not a preference:** the router sweeps protected quotes it would trade through, with ISOs where it can, until Rule 611 changes ([Order Protection](/books/investing-and-digital-assets/equity-market-structure#order-protection)).
- **The routing table is rules as data** with effective dates, so a review can say which table routed each order ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).

## Crypto Best Execution

Crypto has no NBBO, no order protection rule, no Rule 605 and no SIP. The same asset trades on dozens of venues at once, each with its own book, fees and custody risk, and a platform that routes customer orders still owes a fair price under its licenses, its disclosures and, for broker-dealers selling crypto through partners, its general conduct obligations. Robinhood's crypto routing page shows the two models side by side:

- **Market maker routing** (the default): the customer trades at the market maker's bid or ask; the platform receives part of the notional inside the spread, $0.95 per $100 as of June 15, 2026. On a $100 buy with a 0.96% spread, the page says Robinhood receives $0.95 of it.
- **Exchange routing:** market and stop orders evaluate several partner exchanges for the best available price and pay a taker fee of 0.00% to 0.95% depending on 30-day volume; limit orders rest on the affiliate's book and pay the maker fee if they match; an order goes to another exchange if its price improvement is enough to offset a higher fee, and fails over if an exchange is down.

Worked numbers, my own, for a $1,000 market buy: under market maker routing with a 0.96% spread to the mid, the customer pays about $9.60 over the midpoint, of which $9.50 goes to the platform. Under exchange routing at an assumed 0.40% taker fee on an exchange whose best offer sits an assumed 0.02% above the mid, the customer pays about $4.00 in fee and $0.20 in spread, $4.20. The page itself says all-in costs "may be higher or lower" either way, and that is the honest statement: the comparison depends on the tier, the spread and the venue's depth at that moment. A crypto best execution program therefore needs its own benchmark, computed from the order books of the venues it can reach at receipt (a composite best bid and offer from direct venue feeds, as [Market Data](/books/investing-and-digital-assets/market-data) describes), and the same records as an equity review: the benchmark at receipt, the venue chosen and why, the fill and the fee, and the payment the platform received on it. Crypto Trading Products covers how a quote is built and hedged ([How a quote is built](/books/investing-and-digital-assets/crypto-trading-products#how-a-quote-is-built)).

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) and [How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models#how-to-build-it) (`order_flow_agreements` and `order_flow_payments` hold what venues pay; this chapter holds the routing and its proof):

```sql
CREATE TABLE routing_rules (               -- the routing table, versioned
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  asset_class         TEXT NOT NULL CHECK (asset_class IN ('nms_stock', 'option', 'crypto')),
  segment             JSONB NOT NULL,        -- order type, size band, session, S&P 500 or not, not held
  strategy            TEXT NOT NULL CHECK (strategy IN ('wholesaler_allocation', 'smart_route',
                        'exchange_direct', 'market_maker_rfq', 'internal')),
  venue_weights       JSONB NOT NULL,        -- candidates and allocation or ranking inputs
  version             INT NOT NULL,
  approved_by         UUID NOT NULL,         -- the best execution committee's decision
  valid_during        TSTZRANGE NOT NULL,
  EXCLUDE USING gist (legal_entity_id WITH =, asset_class WITH =, (segment::text) WITH =,
                      valid_during WITH &&)
);

CREATE TABLE routing_decisions (           -- one per order or child order sent
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id            UUID NOT NULL REFERENCES orders (id),
  child_order_id      UUID REFERENCES orders (id),
  routing_rule_id     UUID NOT NULL REFERENCES routing_rules (id),
  venue_id            UUID NOT NULL REFERENCES venues (id),
  quantity            NUMERIC(78, 0) NOT NULL,
  nbb                 NUMERIC(38, 18),       -- benchmark at the decision
  nbo                 NUMERIC(38, 18),
  benchmark_source    TEXT NOT NULL CHECK (benchmark_source IN ('sip', 'direct_feeds',
                        'crypto_composite', 'none')),
  is_iso              BOOLEAN NOT NULL DEFAULT FALSE,
  expected_fee        NUMERIC(38, 18),       -- per unit, determinable at execution
  candidates          JSONB NOT NULL,        -- venues ranked and why
  decided_at          TIMESTAMPTZ NOT NULL
);

CREATE TABLE execution_quality_samples (   -- per execution, the measurement
  execution_id        UUID PRIMARY KEY REFERENCES executions (id),
  routing_decision_id UUID REFERENCES routing_decisions (id),
  nbb_at_receipt      NUMERIC(38, 18),
  nbo_at_receipt      NUMERIC(38, 18),
  nbb_at_execution    NUMERIC(38, 18),
  nbo_at_execution    NUMERIC(38, 18),
  price_improvement   NUMERIC(38, 18) NOT NULL,  -- per unit vs the quote at receipt; negative is disimprovement
  effective_spread    NUMERIC(38, 18) NOT NULL,  -- 2 × |price − midpoint at receipt|
  quoted_spread       NUMERIC(38, 18),
  ms_to_execution     NUMERIC(12, 3) NOT NULL,
  payment_micros      BIGINT,                -- what the venue paid on this fill (order_flow_payments)
  rule_605_bucket     TEXT NOT NULL          -- order type and notional size band
);

CREATE TABLE best_execution_reviews (      -- the regular and rigorous review
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  period              DATERANGE NOT NULL,
  asset_class         TEXT NOT NULL,
  method              TEXT NOT NULL CHECK (method IN ('order_by_order', 'regular_rigorous')),
  venues_compared     JSONB NOT NULL,        -- including venues not routed to
  findings            JSONB NOT NULL,        -- by security and order type
  decisions           TEXT NOT NULL,         -- changes to routing_rules, or why none
  committee_minutes   TEXT NOT NULL,         -- document reference
  approved_at         TIMESTAMPTZ NOT NULL
);

CREATE TABLE routing_reports (             -- 605 and 606 as published
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  rule                TEXT NOT NULL CHECK (rule IN ('605_full', '605_summary', '606a', '606b1',
                        '606b3')),
  period              DATERANGE NOT NULL,
  account_id          UUID REFERENCES accounts (id),  -- 606(b) reports on request
  document_ref        TEXT NOT NULL,         -- the file as posted or sent
  generated_from      TEXT NOT NULL,         -- the query version that produced it
  published_at        TIMESTAMPTZ,
  due_at              TIMESTAMPTZ NOT NULL,  -- one month after period end; 7 business days for 606(b)(3)
  UNIQUE (legal_entity_id, rule, period, account_id)
);
```

The measurement runs per fill, in integer micro-dollars, so a quarter's statistics add up exactly ([Money & Amounts](/docs/money/amounts#integer-minor-units)):

```go tab="Go"
// Quality of one fill in micro-dollars per share (1e-6 USD), against the NBBO at
// receipt. Positive improvement is better for the customer; negative is disimprovement.
type Quality struct {
	ImprovementMicros     int64
	EffectiveSpreadMicros int64 // 2 × |price − midpoint|, in micro-dollars
}

func Measure(buy bool, priceMicros, nbbMicros, nboMicros int64) Quality {
	improvement := nboMicros - priceMicros // a buy is measured from the offer
	if !buy {
		improvement = priceMicros - nbbMicros // a sell from the bid
	}
	diff2 := 2*priceMicros - (nbbMicros + nboMicros) // 2 × (price − midpoint), exact
	if diff2 < 0 {
		diff2 = -diff2
	}
	return Quality{ImprovementMicros: improvement, EffectiveSpreadMicros: diff2}
}

// Buy at $50.01 against $50.00 by $50.04:
// Measure(true, 50_010_000, 50_000_000, 50_040_000) == {30_000, 20_000}
```

```rust tab="Rust"
/// Quality of one fill in micro-dollars per share (1e-6 USD), against the NBBO at
/// receipt. Positive improvement is better for the customer; negative is disimprovement.
#[derive(Debug, PartialEq)]
pub struct Quality { pub improvement_micros: i64, pub effective_spread_micros: i64 }

pub fn measure(buy: bool, price: i64, nbb: i64, nbo: i64) -> Quality {
    let improvement = if buy { nbo - price } else { price - nbb };
    // 2 × |price − midpoint| without halving, so it stays an exact integer
    let effective = (2 * price - (nbb + nbo)).abs();
    Quality { improvement_micros: improvement, effective_spread_micros: effective }
}

// Buy at $50.01 against $50.00 by $50.04:
// measure(true, 50_010_000, 50_000_000, 50_040_000) == Quality { 30_000, 20_000 }
```

Design notes:

- **Capture the benchmark at decision time.** `routing_decisions` and `execution_quality_samples` store the quotes the router and the measurement used; rebuilding them later from market data gives a different answer whenever feeds disagree.
- **One measurement, three consumers.** The 605 report, the 606 report and the best execution review read the same samples and the same payments, so a published figure can be traced to its fills.
- **The review changes the routing table or says why not.** `best_execution_reviews.decisions` links to the `routing_rules` versions it produced, which is what an examiner asks for first.
- **Reports are generated, versioned and kept as published,** with the query version that produced them, since each must stay posted for three years and be reproducible.

## Auditing

- **Every routing decision with its inputs,** the rule version, the benchmark and its source, and the candidates rejected.
- **Every fill's quality and payment side by side,** so the split between customer and broker on any fill can be shown.
- **Every review and what it changed,** with the venues compared, including those not routed to, and the committee's minutes.
- **Every published report as published,** with the data behind it, for three years, and every 606(b) request with its response date.
- **Every payment and fee arrangement in force,** with the material aspects disclosed, matched to the 606 report's text.

## What This Means for the System You Build

- **Record each routing decision with the quote it saw,** the rule that chose and the candidates it rejected.
- **Measure every fill against the NBBO at receipt** in integer units, improvement and disimprovement alike, and store the payment received on the same fill.
- **Build the regular and rigorous review as a data product** that compares against venues you don't use and ends in a routing table change or a reason.
- **Generate Rule 605 and 606 reports from the same samples** and keep them as published.
- **Give crypto routing a benchmark of your own,** from the venues you can reach, because there is no NBBO to borrow.

## References

**Law and regulation**

- [17 CFR 242.605](https://www.law.cornell.edu/cfr/text/17/242.605), amended Rule 605: who reports, the 100,000-account threshold, notional size bands, time-to-execution buckets, realized spreads, the summary report and its fields, timing and posting
- [17 CFR 242.606](https://www.law.cornell.edu/cfr/text/17/242.606), the quarterly routing report, its sections and payment columns, timing and posting, and the reports on request including not-held orders and their thresholds
- [FINRA Rule 5310](https://www.finra.org/rules-guidance/rulebooks/finra-rules/5310), best execution, its factors, interpositioning, directed orders and the regular and rigorous review

**Regulators and guidance**

- [FINRA: Regulatory Notice 15-46 (November 2015)](https://www.finra.org/rules-guidance/notices/15-46), comparing against markets not routed to, routing to another broker-dealer, internalized orders, review frequency and order routing inducements
- [SEC: Exemptive order on amended Rule 605 (Release 34-105136, 91 FR 17313, April 6, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-04-06/html/2026-06569.htm), the adopting release, the August 1, 2026 compliance date and the revised exemptions
- [SEC: Extension of compliance date for amended Rule 605 (Release 34-104147, 90 FR 47552, October 2, 2025)](https://www.federalregister.gov/api/v1/documents/2025-19316.json), compliance moved from December 14, 2025 to August 1, 2026
- [SEC: Order Competition Rule, proposed rule (88 FR 128, January 3, 2023)](https://www.govinfo.gov/content/pkg/FR-2023-01-03/html/2022-27617.htm), first quarter 2022 payments by the six largest wholesalers and the estimated competitive shortfall
- [SEC: Withdrawal of Proposed Regulatory Actions (90 FR 25531, June 17, 2025)](https://www.federalregister.gov/api/v1/documents/2025-11110.json), withdrawal of the Order Competition Rule and Regulation Best Execution
- [SEC: Staff Report on Equity and Options Market Structure Conditions in Early 2021 (October 2021)](https://www.sec.gov/files/staff-report-equity-options-market-struction-conditions-early-2021.pdf), the 20/80 split described in the December 2020 Robinhood order

**Filings**

- [Robinhood Financial: Rule 606 report, second quarter 2026](https://cdn.finra.org/606/2026/165998_606_NMS_2026_Q2_V1.pdf), April 2026 order type split, venue shares and payments for S&P 500 stocks and options, the 80% allocation and the not-held exclusions
- [Robinhood Securities: Rule 606 report, second quarter 2026](https://cdn.finra.org/606/2026/287900_606_NMS_2026_Q2_V1.pdf), payment terms by session, the retail attestation and the examination staff's observation
- [Robinhood Financial: Rule 605 summary report, September 2026](https://public.s3.com/rule605/crfn/CRFN202609.csv), the S&P 500 and other-stock rows for market orders of $1,000 to under $5,000
- [Interactive Brokers: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1381197/000138119726000062/ibkr-20251231.htm), SmartRouting's retained control and dynamic rerouting

**Vendor documentation**

- [Fidelity: Execution quality](https://www.fidelity.com/trading/execution-quality/overview), first quarter 2026 price improvement, speed and effective spread, and its order flow management team
- [Robinhood: Legal and regulatory documents](https://robinhood.com/us/en/about/legal/), where its Rule 605 and 606 reports are posted
- [Robinhood: Crypto order routing](https://robinhood.com/us/en/support/articles/crypto-order-routing/), market maker and exchange routing, the payment per $100, routing of limit orders, fees and the disclaimer
