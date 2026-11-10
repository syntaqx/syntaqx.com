+++
title = "US Equity Market Structure"
nav_title = "Equity Market Structure"
description = "Exchanges, ATSs and wholesalers, the NBBO, SIPs vs direct feeds, Reg NMS order protection, access fee caps and tick sizes, auctions and retail flow."
category = "Investing & Digital Assets Industry"
order = 2515
part = "Trading and Markets"
tags = ["investing", "market-structure", "reg-nms", "nbbo", "exchanges", "wholesalers"]
+++

A US stock trades in dozens of places at once. The same share of a large company can be bought on any of the registered exchanges, in an alternative trading system run by a broker-dealer, from a wholesaler that fills retail orders out of its own inventory, or in an auction at the open or close. What holds that together is a set of rules rather than a single market: every exchange publishes its best prices to a consolidated feed, the best of them across all venues is the national best bid and offer (NBBO), most trades may not happen at a worse price than a displayed quote elsewhere, and the fees a venue may charge to reach its quotes are capped. Congress ordered the SEC to build this national market system in 1975 ([1975: The National Market System](/books/investing-and-digital-assets/crises-and-the-rules#1975-the-national-market-system)), and Regulation NMS, adopted in 2005, is most of what it built.

For an engineer, market structure decides the inputs to almost every trading system: which venues an order can reach, which quote it is measured against, what it costs to take liquidity, what price increments exist, and when the auctions happen. This chapter covers the venues, the NBBO worked through, SIPs and direct feeds and the latency between them, order protection and the 2026 proposal to rescind it, access fees and tick sizes with the 2024 amendments and their delayed compliance dates, round lots, auctions, and retail flow. How a broker chooses among venues is [Order Routing, PFOF & Best Execution](/books/investing-and-digital-assets/routing-and-best-execution); the feeds themselves are [Market Data](/books/investing-and-digital-assets/market-data). This chapter extends `venues` and `instruments` from [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) with `venue_sessions`, `tick_regimes` and `auction_events`.

## How the Platforms Do It

Where NMS stock volume executed, from the SEC's own count for the first quarter of 2022 in its December 2022 Order Competition proposal (the proposal was withdrawn in June 2025; its data still describes the structure):

| Venue type | How many | Share of NMS stock share volume, Q1 2022 | What it is |
| --- | --- | --- | --- |
| **National securities exchanges** | 16 | 59.7% | Registered under Exchange Act §6; display quotes to the consolidated feed; NYSE, Nasdaq and Cboe groups, IEX, MEMX and newer entrants |
| **Wholesalers** | 6 | 23.9%, executed internally | Broker-dealers that fill retail orders as principal, at or inside the NBBO, and pay brokers for the flow |
| **ATSs** | 32 | 10.2% | Broker-dealer-operated trading systems under Regulation ATS, most not displaying quotes (dark pools) |
| **Other broker-dealers** | 230+ | 6.3% | Single-dealer platforms, block desks and other internalizers |

The SEC's list of registered national securities exchanges, last updated January 7, 2026, names 29 under §6(a), counting options-only markets, renamed ones such as NYSE Texas (formerly NYSE Chicago) and Nasdaq Texas (formerly Nasdaq BX), and new registrants such as 24X National Exchange and the Texas Stock Exchange. The two counts measure different things (the 2022 figure is exchanges that executed NMS stock volume), and neither is a sign that trading is spread out evenly: most exchanges belong to the three large groups, and a broker connects to a venue because of what it costs and fills, not because it exists. Current exchange shares by group are published as market data rather than in filings, and [Market Data](/books/investing-and-digital-assets/market-data) and [Wholesalers and Venues](/books/investing-and-digital-assets/investing-landscape#wholesalers-and-venues) say where to read them.

Three facts from that table drive the design of every broker's routing:

- **Retail marketable orders mostly never reach an exchange.** The same proposal found brokers route "more than 90% of marketable orders of individual investors in NMS stocks" to wholesalers, and that two wholesalers captured about 66% of wholesalers' executed share volume.
- **Wholesalers fill retail orders because they are cheaper to fill.** Using CAT data, the SEC measured one-minute price impact for individual investors' marketable orders at 1.26 basis points at wholesalers against 4.40 at exchanges: retail orders move prices less, so a dealer can fill them inside the spread and still profit.
- **Price improvement is mostly a wholesaler outcome.** 83.17% of marketable orders routed to wholesalers received price improvement over the best exchange quotes, against 8.78% of those routed to exchanges.

## The Venues

**Exchanges.** An exchange is a self-regulatory organization with rules the SEC approves, a displayed limit order book, and quotes that go to the consolidated feed. Exchanges compete on fees (many pay rebates to orders that add liquidity and charge orders that take it, within the access fee cap below), on order types, and on mechanics. IEX's is the clearest example of mechanics as product: every order passes through a 350-microsecond delay, now 44 miles of coiled fiber (lengthened from 38 miles after its 2024 data center move), and its Signal predicts when the national best bid is about to fall or the offer to rise, staying on for 2 milliseconds or until the price changes, so its pegged order types can step back from a price that's about to go stale.

**ATSs and dark pools.** An alternative trading system matches orders like an exchange but is operated by a broker-dealer under Regulation ATS instead of registering as an exchange. An NMS Stock ATS gets that exemption only with an effective Form ATS-N, which the SEC may review for up to 120 calendar days (extendable by 90) and declare ineffective; material changes are filed at least 30 days before they take effect, a cessation notice 10 business days before the ATS stops, and the SEC publishes the filings with a link from the ATS's own site. For a router, Form ATS-N is the document that says how an ATS's order types, segmentation and the operator's own trading work.

**Wholesalers and single-dealer platforms.** A wholesaler trades as principal against retail orders it receives, usually under payment-for-order-flow terms ([Payment for Order Flow](/books/investing-and-digital-assets/revenue-models#payment-for-order-flow)). Robinhood Financial's second quarter 2026 Rule 606 report shows the market concretely: in April 2026, its non-directed S&P 500 orders went to Virtu Americas (35.27%), Citadel Securities (27.38%), G1 Execution Services (14.00%), Jane Street (13.17%) and Hudson River Trading (5.28%), and to no exchange. [Order Routing, PFOF & Best Execution](/books/investing-and-digital-assets/routing-and-best-execution) reads that report line by line.

**Market makers.** On an exchange, registered market makers quote continuously under the exchange's obligations. Wholesalers make markets off-exchange. Both need the same thing from the structure: a quote they can trust, access to every venue they may need to hedge on, and known fees.

## The NBBO, Worked

Regulation NMS defines the national best bid and national best offer as the best bid and best offer for a stock "calculated and disseminated on a current and continuing basis" (in the amended text, by a competing consolidator, or calculated by a self-aggregator), with ties ranked by size and then by time received. Only round-lot, automated quotations of an exchange or FINRA count as protected quotations.

A worked book of my own for a $50 stock, where the round lot is 100 shares:

| Venue | Bid | Bid size | Offer | Offer size |
| --- | --- | --- | --- | --- |
| Exchange A | $50.00 | 300 | $50.04 | 200 |
| Exchange B | $50.01 | 100 | $50.03 | 500 |
| Exchange C | $50.01 | 400 | $50.03 | 100 |
| Exchange D | $50.00 | 1,000 | $50.05 | 300 |
| Exchange E | $50.02 | 60 (odd lot) | $50.06 | 100 |

- **NBB.** $50.01, at B and C. Ranked by size, C's 400 shares come first; 500 shares are bid at that price in total. E's $50.02 bid is better but is 60 shares, an odd lot: it doesn't set the NBB. Since the 2024 amendments, it appears in odd-lot information as the best odd-lot order to buy, the highest-priced odd-lot bid above the national best bid.
- **NBO.** $50.03, at B and C, B's 500 shares first; 600 shares offered there in total.
- **Spread and midpoint.** $0.02 and $50.02. A wholesaler that fills a retail buy at $50.025 gives $0.005 of price improvement per share; one that fills at $50.02, the midpoint, gives $0.01.
- **Marketable.** A buy limit at $50.03 or higher is a marketable limit order; at $50.02 it would rest (or, at a wholesaler, might fill at the midpoint).

The NBBO is a computed value, and two systems can compute it differently at the same instant: a broker reading the consolidated feed and a market maker reading every exchange's direct feed see different books for a few hundred microseconds whenever a quote changes. The next section puts a number on it.

## SIPs and Direct Feeds

Each exchange sends its best quotes and every trade to a securities information processor (SIP) under the equity data plans (the CTA and CQ plans and the UTP plan), which computes the NBBO and publishes the consolidated quote and the consolidated tape. Exchanges also sell their own direct feeds with full depth and order-by-order detail, and those reach a subscriber's server without the extra hop through the processor. The SEC's Market Data Infrastructure rules of December 2020 described "a substantial latency differential between market data provided via the exclusive SIPs and proprietary data products" and adopted a decentralized model with competing consolidators to narrow it; whether any competing consolidator operates as of November 2026 I could not confirm from a primary source. <!-- source-gap: competing-consolidators-status | status | whether competing consolidators under Rule 614 have registered and operate as of November 2026 | closes with: an SEC Form CC effectiveness notice or a staff statement on MDI implementation | checked: 2026-11-10 -->

What the processor adds is small. The CTA plan reports a median latency under 20 microseconds for its quote and trade processors; its metrics for September 2026 show quotes at a median of 18.0 microseconds and a 99th percentile of 24.8, measured from the inbound message reaching the processor's network to the outbound message leaving it. Geography adds the rest.

Worked numbers, my own, with stated assumptions: a router sits in the same data center as Exchange B and reads B's direct feed about 5 microseconds after B changes its quote. The SIP processor is in another data center, assumed 35 km of fiber away at about 5 microseconds per kilometer, so 175 microseconds each way.

| Path for B's new offer | Latency |
| --- | --- |
| B's direct feed to the co-located router | about 5 μs |
| B to the SIP processor | about 175 μs |
| SIP processing (CTA's September 2026 median) | 18 μs |
| SIP back to the router's data center | about 175 μs |
| **SIP total** | **about 368 μs** |

At 10:00:00.000000 Exchange B lowers its offer from $50.03 to $50.02. For about the next 363 microseconds, a firm on direct feeds knows the NBO is $50.02 while the SIP still says $50.03. A retail buy filled at $50.025 in that window shows half a cent of price improvement against the SIP NBBO and half a cent of disimprovement against the direct-feed NBBO. Multiply by the number of quote changes in a day and it becomes material: which NBBO a firm uses to measure price improvement, compute payment for order flow and check trade-throughs is a disclosed policy decision, recorded with every measurement. Rule 605's statistics are computed against the consolidated NBBO, and a wholesaler's own direct-feed view will usually look slightly worse.

The SIPs are also changing hands. The SEC approved a single consolidated tape plan (the CT Plan) effective November 20, 2024, and its approved fee schedule (Release 34-105778, June 26, 2026) says that upon implementation it replaces the CTA, CQ and UTP plans; the UTP plan's site says the transition takes effect April 1, 2027, with a new administrator. [Market Data](/books/investing-and-digital-assets/market-data) covers the fees.

## Order Protection

Rule 611 requires every trading center to keep written policies and procedures "reasonably designed to prevent trade-throughs" of protected quotations: an execution during regular trading hours at a price worse than a protected bid or offer elsewhere. The rule lists the exceptions, and a router or matching engine implements each one:

- the other venue was having a system failure, material delay or malfunction;
- the trade was not regular way, or was a single-priced opening, reopening or closing transaction;
- the market was crossed (a protected bid above a protected offer);
- the order was an intermarket sweep order (ISO), or the trading center simultaneously sent ISOs to take the full displayed size of every better protected quotation;
- the price was set by a benchmark not determinable when the trade was committed;
- the traded-through venue had displayed a quote at or worse than the trade price within the previous second (the flickering-quote exception);
- the trade filled a stopped order at a guaranteed price.

The ISO is the mechanism that makes most of this work. In the worked book, a buyer wanting 1,000 shares immediately at up to $50.04 can't simply take A's 200 at $50.04 while B and C offer 600 at $50.03. The router either sends to B and C first, or marks every order as an ISO and sends them all at once: 500 to B and 100 to C at $50.03, and 200 to A at $50.04. That is 800 shares; the last 200 can't come from displayed quotes, since D's $50.05 is above the limit, so they rest or go to non-displayed liquidity at $50.04 or better. The ISO flag is the sender's representation that it has swept the better prices, and Rule 611 requires the sender to take reasonable steps to establish that it has. Rule 610 adds the other half: exchanges must keep members from displaying quotes that lock or cross a protected quotation.

**Status as of November 2026.** In a release published June 17, 2026, the SEC proposed rescinding the trade-through rule for NMS stocks, the locking and crossing provision, and certain defined terms (Release 34-105655, File S7-2026-20, 91 FR 36656); comments closed August 17, 2026. It is a proposal, not a rule, and Rule 611 applies today. A router designed now should keep order protection as a configurable rule with an effective date rather than hard-coded behavior, because if it is rescinded, ISO handling, the flickering-quote window and the locked-market checks become optional strategy rather than law.

## Access Fees and Tick Sizes

The 2024 amendments to Regulation NMS (Release 34-101070, adopted September 18, 2024, 89 FR 81620) changed three numbers every trading system uses:

| Rule | Before | After the 2024 amendments | Compliance |
| --- | --- | --- | --- |
| Rule 610(c) access fee cap, stocks at $1.00 or more | $0.003 a share ("30 mils") | $0.001 a share | Delayed to the first business day of November 2027 |
| Rule 610(c), stocks under $1.00 | 0.3% of the quote | 0.1% of the quote | Delayed to November 2027 |
| Rule 612 minimum pricing increment, stocks at $1.00 or more | $0.01 | $0.005 if the stock's time-weighted average quoted spread in the evaluation period was $0.015 or less; otherwise $0.01 | Delayed to November 2027 |
| Rule 610(d) | | Exchange fees and rebates must be determinable at the time of execution, with volume tiers based on a prior period | Not delayed |

The compliance history matters because systems were built for dates that moved. The original compliance date for the tick size, access fee and round lot changes was the first business day of November 2025, and for odd-lot information the first business day of May 2026. The SEC stayed the tick size and access fee changes in December 2024 pending court review; after the D.C. Circuit denied the petitions on October 14, 2025, an October 31, 2025 order (Release 34-104172, 90 FR 51418) deferred them to November 2026, and a June 11, 2026 order (Release 34-105656, 91 FR 36022) deferred them again to the first business day of November 2027, citing the workload of 23-hour trading and the amended Rule 605 in the same year. Neither order covered Rule 610(d), Rule 603(b)'s odd-lot dissemination or the round lot and odd-lot definitions.

Worked numbers, my own:

- **Access fees.** A router that takes 1,000 shares from protected quotes at an exchange charging the cap pays up to $3.00 today and up to $1.00 under the amended cap. A broker taking 50 million shares a month at the cap pays up to $150,000 a month today, $50,000 after November 2027. Maker rebates are funded from those fees, so rebates fall too, and routers that ranked venues by rebate have to re-rank.
- **Ticks.** A $20 stock whose spread averaged $0.012 over the evaluation period gets a $0.005 tick. Its quoted spread can narrow from $0.01 to $0.005; a 100-share market buy that paid half the spread over the midpoint pays $0.25 less. The tick is per stock and per period, so `tick_regimes` is a dated table the OMS, the router and the matching engine all read, and a limit price of $20.005 is valid in one period and invalid in the next.
- **Rule 610(d).** An exchange may no longer pay a month-end rebate whose tier depends on the month's own volume. A router can now compute the exact fee of each fill when it happens, which is what best execution analysis wanted all along.

## Round Lots and Odd Lots

The round lot used to be 100 shares for every stock, so a $1,000 stock's best quote could be ignored by the NBBO unless someone displayed $100,000 at that price. The amended definition (Rule 600(b)(93)) sets the round lot by the stock's average closing price in an evaluation period: 100 shares at $250.00 or less, 40 shares from $250.01 to $1,000.00, 10 shares from $1,000.01 to $10,000.00, and 1 share above that. The March evaluation period sets the round lot from the first business day of May through the last business day of October; the September period sets it from November through April.

A worked case of my own: a stock that averaged $300 in the September evaluation period has a 40-share round lot from November. A 50-share bid at $299.95 is now a round lot, a protected quotation that can set the NBB, and must not be traded through. Under the old definition the same bid was an odd lot that the NBBO ignored. The OMS, the router, the order protection logic, the Rule 605 calculations and the market data display all read the round lot from the same dated table, or they disagree on what the NBBO was.

## Auctions

Each listing exchange opens and closes its stocks with a single-price auction, and the close is where index funds and many institutions trade. NYSE's schedule, as published: for NYSE-listed stocks the closing imbalance period runs from 3:50 to 4:00 p.m. ET; at 3:50 p.m. market-on-close and limit-on-close entry stops (offsetting orders are still accepted), imbalance publication begins every second, and requests to cancel those orders are rejected; at 3:59:50 p.m. floor brokers' D orders can no longer be entered or modified; and at 4:00 p.m. the auction runs. NYSE Arca and NYSE Texas freeze at 3:59 p.m. and begin publishing imbalances at 3:00 p.m. The indicative match price is the best price at which the maximum volume is tradable, within auction collars. Nasdaq disseminates the same information as Net Order Imbalance Indicator messages on its TotalView-ITCH feed: paired shares, imbalance shares, a far price (the hypothetical clearing price for auction orders alone) and a near price (for auction and continuous orders together).

Worked numbers, my own, for a close with only auction orders:

| Price | Buy interest at that price | Sell interest at that price | Tradable |
| --- | --- | --- | --- |
| $20.05 | 6,800 (MOC 5,000, LOC 1,000 at $20.09, LOC 800 at $20.06) | 5,000 (MOC 3,000, LOC 2,000 at $20.05) | 5,000 |
| $20.06 | 6,800 | 5,000 | 5,000 |
| $20.08 | 6,000 | 6,500 (adds LOC 1,500 at $20.08) | 6,000 |
| $20.09 | 6,000 | 6,500 | 6,000 |

Maximum volume, 6,000 shares, clears anywhere from $20.08 to $20.09, with 500 shares of sell imbalance left over; the exchange's rule book (imbalance side, reference price, collars) picks the price inside that range. Every buy at a limit of $20.09 or better and every MOC order fills at the one price; the LOC buy at $20.06 doesn't. For a broker, an auction order is an order whose fill time is fixed and whose cancel window closes early, and `auction_events` records what the venue published so a customer's "why didn't my closing order fill" has an answer.

## Retail Flow

Retail orders matter to the structure out of proportion to their size because they are the flow wholesalers pay for and exchanges want back. The SEC's 2022 figures above (more than 90% of individual investors' marketable orders to wholesalers, 83.17% of them price improved) are the most recent official measure of that segmentation I could open; a current, dated retail share of total volume is published by vendors and exchanges rather than in a filing or release. <!-- source-gap: retail-share-of-volume | missing | a dated share of US equity volume from retail orders, 2026 | closes with: an SEC staff analysis, an exchange or FINRA publication with a stated methodology | checked: 2026-11-05 --> The SEC's attempt to change the segmentation, the Order Competition Rule that would have required many retail orders to be exposed in auctions before a wholesaler could fill them, was withdrawn on June 17, 2025 along with Regulation Best Execution, so as of November 2026 the structure in this chapter is the one in force.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) (`venues` with kind and MIC, `instruments` with identifiers and status). Sessions, ticks, round lots and auctions are dated rules per venue and per stock:

```sql
ALTER TABLE venues
  ADD COLUMN registration       TEXT CHECK (registration IN ('exchange_6a', 'nms_stock_ats',
                                 'ats', 'broker_dealer', 'finra_facility', 'foreign', 'crypto')),
  ADD COLUMN displays_protected BOOLEAN NOT NULL DEFAULT FALSE,  -- quotes can be protected quotations
  ADD COLUMN form_ats_n_ref     TEXT,                            -- the effective filing, for ATSs
  ADD COLUMN speed_bump_micros  INT;                             -- e.g. an exchange's fixed delay

CREATE TABLE venue_sessions (              -- when a venue trades what, by date
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  venue_id            UUID NOT NULL REFERENCES venues (id),
  session             TEXT NOT NULL CHECK (session IN ('pre_open', 'opening_auction', 'regular',
                        'closing_auction', 'post_market', 'overnight')),
  trade_date          DATE NOT NULL,
  starts_at           TIMESTAMPTZ NOT NULL,
  ends_at             TIMESTAMPTZ NOT NULL,
  order_entry_cutoff  TIMESTAMPTZ,           -- e.g. 3:50 p.m. for closing auction orders
  cancel_cutoff       TIMESTAMPTZ,
  limit_orders_only   BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (venue_id, session, trade_date),
  CHECK (ends_at > starts_at)
);

CREATE TABLE tick_regimes (                -- per stock, per evaluation period
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  valid_during        DATERANGE NOT NULL,    -- e.g. first business day of November to end of April
  evaluation_period   TEXT NOT NULL,         -- 'march' or 'september' and year
  avg_closing_price   NUMERIC(38, 18),       -- sets the round lot
  twaqs               NUMERIC(38, 18),       -- time-weighted average quoted spread, sets the tick
  tick_size           NUMERIC(38, 18) NOT NULL,  -- 0.01, 0.005 (from compliance), 0.0001 below $1
  round_lot           INT NOT NULL CHECK (round_lot IN (1, 10, 40, 100)),
  rule_version        TEXT NOT NULL,         -- which rule text decided it
  PRIMARY KEY (instrument_id, valid_during),
  EXCLUDE USING gist (instrument_id WITH =, valid_during WITH &&)
);

CREATE TABLE auction_events (              -- what a venue published about an auction
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  venue_id            UUID NOT NULL REFERENCES venues (id),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  auction             TEXT NOT NULL CHECK (auction IN ('open', 'close', 'halt_reopen', 'ipo')),
  trade_date          DATE NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('imbalance', 'result')),
  paired_quantity     NUMERIC(78, 0),
  imbalance_quantity  NUMERIC(78, 0),
  imbalance_side      TEXT CHECK (imbalance_side IN ('buy', 'sell', 'none')),
  reference_price     NUMERIC(38, 18),
  indicative_price    NUMERIC(38, 18),       -- or near price
  far_price           NUMERIC(38, 18),
  final_price         NUMERIC(38, 18),       -- result only
  final_quantity      NUMERIC(78, 0),
  published_at        TIMESTAMPTZ NOT NULL
);
CREATE INDEX ON auction_events (instrument_id, trade_date, published_at);
```

Design notes:

- **One table for ticks and round lots, read by everyone.** The OMS validates prices, the router computes protected quotes, the matching engine rejects bad increments, Rule 605 classifies orders and market data displays quotes from the same `tick_regimes` row for the date; two copies will disagree on the first day of a new period.
- **Regulatory dates as data.** The access fee cap, the tick rule and order protection each carry a rule version and an effective date in [Rules as Data](/docs/building-blocks/rules-as-data#effective-dates-and-versions), because the 2024 amendments' dates moved twice and the trade-through rule may be rescinded.
- **Record which NBBO you used.** Every computed NBBO carries its source (consolidated or direct) and its timestamp, so a measurement can be reproduced and two systems' numbers can be reconciled.
- **Calendars are per venue.** Half days, holidays and the coming overnight sessions differ by venue; `venue_sessions` is generated ahead from each venue's published calendar and checked daily.

## Auditing

- **What the market was when you acted.** The NBBO and protected quotes, with their source and timestamp, at receipt, routing and execution for every order.
- **Every ISO and its sweep.** For each order sent as an intermarket sweep, the protected quotes it had to take and the orders sent to take them, since the sender carries the obligation.
- **Every rule version in force.** Which tick, round lot, fee cap and order protection rules applied on each date, and when the system switched.
- **Auction participation.** Every auction order, the imbalance messages published while it was live, and its result.

## What This Means for the System You Build

- **Model venues by what they are under the law:** exchange, NMS Stock ATS, wholesaler, other broker-dealer, each with its own documents and obligations.
- **Compute the NBBO deliberately,** from a named source, with the round lot of the day, and store it with every decision.
- **Treat order protection, access fee caps and tick sizes as dated rules,** because their compliance dates have moved and a rescission is proposed.
- **Keep ticks and round lots in one dated table** that every component reads.
- **Put auction cutoffs and imbalance data in the order's world,** since an auction order's cancel window closes before the market does.

## References

**Law and regulation**

- [17 CFR 242.600](https://www.law.cornell.edu/cfr/text/17/242.600), Regulation NMS definitions: the NBBO and its tie-breaks, protected and automated quotations, intermarket sweep orders, round lots and their evaluation periods, odd-lot information and the best odd-lot order, trade-through and regular trading hours
- [17 CFR 242.610](https://www.law.cornell.edu/cfr/text/17/242.610), the amended access fee caps, fees determinable at the time of execution, and locked and crossed quotations
- [17 CFR 242.611](https://www.law.cornell.edu/cfr/text/17/242.611), the order protection rule's policies and procedures, its exceptions and the ISO obligation
- [17 CFR 242.304](https://www.law.cornell.edu/cfr/text/17/242.304), Form ATS-N for NMS Stock ATSs, review and ineffectiveness, amendments, cessation notice and publication

**Regulators and guidance**

- [SEC: Fact sheet, tick sizes, access fees and transparency of better priced orders (Release 34-101070)](https://www.sec.gov/files/34-101070-fact-sheet.pdf), adoption on September 18, 2024, the $0.005 tick test, the $0.001 and 0.1% caps, determinable fees, and the original compliance dates
- [SEC: Regulation NMS: Minimum Pricing Increments, Access Fees, and Transparency of Better Priced Orders (89 FR 81620, October 8, 2024)](https://www.federalregister.gov/documents/full_text/text/2024/10/08/2024-21867.txt), the prior 30 mil cap and 0.3% cap for stocks under $1.00
- [SEC: Order extending exemptive relief (Release 34-105656, 91 FR 36022, June 15, 2026)](https://www.federalregister.gov/documents/full_text/text/2026/06/15/2026-11997.txt), compliance for Rules 612, 610(c) and 600(b)(89)(i)(F) moved to November 2027, the October 2025 order before it, the provisions not covered and the reasons
- [SEC: The Trade-Through Rule and Locked and Crossed Markets Provisions of Regulation NMS, proposed rule (91 FR 36656, June 17, 2026)](https://www.federalregister.gov/api/v1/documents/2026-12163.json), the proposed rescission, release and file numbers and the comment deadline
- [SEC: Order Competition Rule, proposed rule (88 FR 128, January 3, 2023)](https://www.govinfo.gov/content/pkg/FR-2023-01-03/html/2022-27617.htm), first quarter 2022 volume shares by venue type, wholesaler routing and concentration, price impact and price improvement rates
- [SEC: Withdrawal of Proposed Regulatory Actions (90 FR 25531, June 17, 2025)](https://www.federalregister.gov/api/v1/documents/2025-11110.json), the withdrawal of the Order Competition Rule and Regulation Best Execution
- [SEC: Market Data Infrastructure, final rule (Release 34-90610, 86 FR 18596, April 9, 2021)](https://www.federalregister.gov/api/v1/documents/2020-28370.json), competing consolidators and the latency differential between SIPs and proprietary feeds
- [SEC: Approval of the CT Plan fee schedule (Release 34-105778, 91 FR 40047, July 1, 2026)](https://www.federalregister.gov/documents/full_text/text/2026/07/01/2026-13215.txt), the CT Plan's November 20, 2024 effective date and its replacement of the CTA, CQ and UTP plans
- [SEC: Registered national securities exchanges](https://www.sec.gov/divisions/marketreg/mrexchanges.shtml), the list of exchanges registered under §6(a), updated January 7, 2026

**Filings**

- [Robinhood Financial: Rule 606 report, second quarter 2026](https://cdn.finra.org/606/2026/165998_606_NMS_2026_Q2_V1.pdf), April 2026 routing of non-directed S&P 500 orders by wholesaler

**Standards and protocols**

- [CTA Plan](https://www.ctaplan.com/), median processor latency under 20 microseconds
- [CTA: SIP metrics, third quarter 2026](https://www.nyse.com/publicdocs/ctaplan/CTA_SIP_Metrics_3Q_2026.pdf), September 2026 quote processor latency at the median and 99th percentile and how it is measured
- [UTP Plan](https://www.utpplan.com/), the transition to the CT Plan effective April 1, 2027
- [Nasdaq: TotalView-ITCH 5.0 specification](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf), the Net Order Imbalance Indicator's paired and imbalance shares and near and far prices

**Vendor documentation**

- [IEX: Technology](https://www.iex.io/technology), the 350-microsecond delay, the coil's length and the Signal that powers its pegged orders
- [NYSE: Trading information](https://www.nyse.com/markets/nyse/trading-info), auction schedules by market
- [NYSE: Closing auction insider's guide](https://www.nyse.com/article/nyse-closing-auction-insiders-guide), the 3:50 p.m. cutoffs, imbalance publication every second, the D order cutoff and the indicative match price
