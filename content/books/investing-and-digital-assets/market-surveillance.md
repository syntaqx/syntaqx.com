+++
title = "Market Surveillance & Manipulation"
nav_title = "Market Surveillance"
description = "Spoofing, layering, wash trading, marking the close, insider trading and pump and dumps; surveillance alerts and cases, FINRA 3110 and crypto venues."
category = "Investing & Digital Assets Industry"
order = 2528
part = "Clearing and Settlement"
tags = ["investing", "surveillance", "manipulation", "spoofing", "wash-trading", "insider-trading", "finra-3110", "crypto"]
+++

Every venue and every broker is a place where someone can try to move a price with orders they never meant to fill, trade with themselves to fake volume, push a close for a derivative payoff, or trade ahead of news they shouldn't have. The law against it is old and short (Exchange Act section 9, Rule 10b-5, and for futures the Commodity Exchange Act's ban on spoofing). The work is in the detection: a system that reads every order and execution, finds the patterns that look like manipulation, sends them to a person who can decide, and keeps a record of what that person decided and why.

A broker surveils its customers and its own staff; an exchange surveils its market; FINRA surveils across markets using the audit trail; a crypto exchange is all three at once for its own book, and since MiCA, must report suspicions in the EU. The failures regulators cite are rarely a missing model. They are thresholds nobody recalibrated, alerts nobody reviewed in time, dispositions nobody documented, and patterns nobody looked at across days or accounts.

This chapter covers the manipulation patterns with a worked spoofing example on a small book, insider trading including the 2022 Coinbase listing case, pump and dumps and front-running, how surveillance systems produce alerts and cases, FINRA Rule 3110 supervision, and crypto wash trading and venue surveillance, including why the SEC's approval of crypto ETPs turned on surveillance-sharing. Supervision of communications is in Workplace & Collaboration's [Supervision and Lexicon Review](/books/workplace-and-collaboration/regulated-communications#supervision-and-lexicon-review); the order records surveillance reads are in [Books, Records & the Audit Trail](/books/investing-and-digital-assets/books-records-and-cat#the-consolidated-audit-trail).

## How the Platforms Do It

Who surveils what, as of November 2026:

| Party | What it watches | Public detail |
| --- | --- | --- |
| **Broker-dealers** | Their customers' and employees' orders and trades, across the venues they route to | FINRA Rule 3110 requires a supervisory system and review of transactions; 3110(d) requires review for insider trading and manipulation and prompt internal investigation |
| **Crypto exchanges** | Their own order book, their own customers, and in the EU any order or transaction | MiCA Article 92 requires anyone "professionally arranging or executing transactions in crypto-assets" to prevent and detect market abuse and report suspicions ([Listing Announcements Are Inside Information](/books/investing-and-digital-assets/listing-assets#listing-announcements-are-inside-information)) |
| **FINRA** | Cross-market patterns across exchanges and off-exchange trading | The 2026 Annual Regulatory Oversight Report lists spoofing, layering, wash trades and marking the close among the surveillance gaps it finds at firms |
| **Solidus Labs** (vendor) | Crypto spot and derivatives, prediction markets, equities and fixed income, centralized and on-chain venues | Lists spoofing, layering, wash trading, front-running, insider trading, pump-and-dump and cross-venue manipulation typologies |

The common shape: **the order book is the evidence, and surveillance needs all of it,** including orders that never filled and cancels. A system that stores only executions can find wash trades and marking the close but cannot see spoofing, which is made entirely of orders that didn't trade.

## The Patterns

**Spoofing and layering.** Placing orders with the intent to cancel them before execution, to make the book look heavier on one side and draw other traders' prices toward the spoofer's real order on the other side. Layering is the same with several orders at stepped prices. The Commodity Exchange Act names it: "bidding or offering with the intent to cancel the bid or offer before execution" is unlawful (7 USC 6c(a)(5)(C)); in securities, Exchange Act section 9(a)(2) prohibits "a series of transactions" effected "for the purpose of inducing the purchase or sale of such security by others", and Rule 10b-5 reaches the rest. The largest case is J.P. Morgan's: on September 29, 2020 the CFTC announced $920.2 million in penalty, restitution and disgorgement for spoofing precious metals and Treasury futures from at least 2008 to 2016 with "hundreds of thousands" of spoof orders, then the largest monetary relief in CFTC history, with parallel DOJ and SEC actions. The CFTC's 2015 complaint against Navinder Sarao alleged a "Layering Algorithm" in E-mini S&P futures over more than 400 trading days and that his orders contributed to the order book imbalance on May 6, 2010.

**Wash trading.** Trades with no change in beneficial ownership, to print volume or a price. Section 9(a)(1) bans wash sales and matched orders in listed securities, and FINRA Rule 6140(b) bars transactions involving "no change in the beneficial ownership." The detection problem is the beneficial owner: two accounts that look unrelated may share an owner, an address, a device or a funding source.

**Marking the close and ramping.** Trading near the close to move the closing price, which settles derivatives, sets fund NAVs and triggers margin. Rule 6140(a) bars entering successively higher or lower priced orders "for the purpose of unduly or improperly influencing the market price," and the CEA separately bans conduct that "demonstrates intentional or reckless disregard for the orderly execution of transactions during the closing period" (7 USC 6c(a)(5)(B)).

**Insider trading.** Trading on material nonpublic information in breach of a duty. For a platform the sharpest version is its own announcements: [Listing Announcements Are Inside Information](/books/investing-and-digital-assets/listing-assets#listing-announcements-are-inside-information) covers *SEC v. Wahi*, in which the SEC charged on July 21, 2022 that a Coinbase product manager who helped coordinate listing announcements tipped his brother and a friend, who traded ahead of announcements in at least 25 crypto assets for profits over $1.1 million.

**Pump and dump.** Promoting a thinly traded security to inflate its price, then selling. FINRA's 2026 oversight report describes small-cap pump-and-dumps tied to foreign-linked IPOs, run through nominee accounts, foreign omnibus accounts, account takeovers and social-media "investment clubs", and observes that "the same issuer is subject to multiple suspected pump-and-dump schemes"; it began a targeted exam of small-cap activity in October 2025. Crypto scam promotion on social platforms belongs to the User-Generated Platforms volume; this chapter covers what the venue sees.

**Front-running.** Trading ahead of a customer's order or a block the firm knows about. FINRA Rule 5270 bars trading while in possession of "material, non-public market information concerning an imminent block transaction" until the information is public or "stale or obsolete"; its supplementary material treats 10,000 shares or more as generally a block, though fewer can qualify.

## Worked Numbers: Spoofing on a Small Book

XYZ's displayed book at 11:00:00.000 ET, with a trader (account S) long 500 shares they want to sell above the bid:

| Bid size | Bid | Ask | Ask size |
| ---: | ---: | ---: | ---: |
| 1,200 | $10.00 | $10.02 | 800 |
| 2,000 | $9.99 | $10.03 | 1,500 |
| 1,500 | $9.98 | $10.04 | 1,000 |

The sequence, all from account S:

| Time | Action | Effect |
| --- | --- | --- |
| 11:00:00.000 | Buy limit 4,000 at $10.00, 5,000 at $9.99, 6,000 at $9.98 | Displayed bid depth on three levels goes from 4,700 to 19,700 against 3,300 offered |
| 11:00:00.140 | Other participants' algorithms read the imbalance, lift the $10.02 offer and bid up | The best offer is now $10.03 |
| 11:00:00.160 | Sell limit 500 at $10.03 | Fills at 11:00:00.190 against an incoming buyer |
| 11:00:00.260 | Cancels all 15,000 shares of bids | Book returns to its earlier shape |

Before the sequence, selling 500 shares at the bid would have fetched $10.00; S sold at $10.03, $15.00 better, in 260 milliseconds. Repeated 400 times a day that is $6,000 a day, invisible in any single trade and obvious in the orders.

The features a model computes over a window around each execution:

| Feature | Value here | What it measures |
| --- | ---: | --- |
| Opposite-side order quantity | 15,000 | How much was shown on the side the trader didn't trade |
| Opposite-side executed quantity | 0 | How much of it was ever at risk of filling and did |
| Ratio of shown to traded on the profitable side | 30 to 1 | 15,000 shown against 500 sold |
| Cancel rate on the opposite side | 100% | Every bid was canceled |
| Time from entry to cancel | 260 ms | Shorter than any change in the trader's information |
| Gain against the pre-sequence touch | $15.00 | The economic motive |
| Repetitions in the day and across days | 400 a day | Pattern, not accident |

A rule like "alert when opposite-side orders exceed 10 times the executed quantity, at least 90% are canceled within one second, and an execution on the other side falls inside the window, repeated at least 20 times across 5 days" (my illustrative thresholds, not any regulator's) catches this trader. It will also fire on legitimate market makers, who cancel most of their quotes, which is why the thresholds need calibrating per product and participant type and why the alert goes to a person rather than to an automatic penalty. FINRA's report names "poorly calibrated or never-reevaluated thresholds" as a finding, and recommends tailoring thresholds by product class and reviewing patterns across days, customers and alert types.

## From Alerts to Cases

A surveillance system is a pipeline: ingest every order event and execution (including from the CAT-feeding event log, the routing records and, for crypto, the venue's own book), compute features over windows, run models (rules, statistical baselines, increasingly machine-learned scores), raise alerts, and route them to reviewers. The alerts that matter become cases.

![The surveillance alert state machine. A row of states: open, in_review, escalated and case_opened, with the path between them accented and labeled assigned, pattern confirmed and case; case_opened is a terminal state. A self-loop on in_review is labeled more orders, more days. A dashed exit labeled rationale recorded leads from in_review down to the terminal closed_no_action state, and a dashed exit labeled principal closes leads from escalated down to the terminal closed_by_principal state.](/diagrams/ida-surveillance-alert-states.svg "Every alert ends with a decision on the record: closed with a documented reason, closed by a principal after escalation, or opened as a case. FINRA cites untimely reviews and undocumented dispositions among its findings.")

What makes the pipeline defensible:

- **Every alert has an owner, a clock and a disposition.** FINRA lists "not performing timely reviews of surveillance alerts or exception reports" and undocumented dispositions among its findings. An alert closed as a false positive needs the reason written down, so the next reviewer and the examiner can see it.
- **Alerts link to their evidence.** The orders and executions that triggered an alert are attached by reference, with the feature values at the time, so a reviewer months later sees what the model saw.
- **Related accounts are joined in.** FINRA's effective practices include comparing related-account surveillance against account-opening data to catch wash and prearranged trades: shared addresses, devices, bank accounts, beneficial owners.
- **Cases leave the surveillance system.** A confirmed pattern becomes a case in the firm's case management (the core model's `cases`), may lead to a suspicious activity report (Banking & Lending's [Suspicious Activity Reports](/books/banking-and-lending/bsa-aml#suspicious-activity-reports)), restrictions on the account, and a referral to FINRA or the exchange.
- **Model changes are governed.** A threshold change is a versioned change with a reason and an approver, and backtested on past alerts, because an examiner will ask why a pattern that used to alert stopped.

## Supervision: FINRA Rule 3110

Rule 3110 is the frame. Each member must have "a system to supervise the activities of each associated person that is reasonably designed to achieve compliance with applicable securities laws and regulations" ((a)), written supervisory procedures ((b)(1)), and review by a registered principal, evidenced in writing, "of all transactions relating to the investment banking or securities business" ((b)(2)), which the supplementary material allows to be risk-based. Paragraph (d) requires procedures to review transactions in the accounts of the firm and its associated persons for insider trading and manipulation, and to "conduct promptly an internal investigation" when a review finds a possible violation. Offices are inspected on a schedule ((c)): offices of supervisory jurisdiction every year, non-supervisory branches at least every three years.

For a system, 3110 turns into requirements: every transaction reviewable and its review recorded with the principal's identity and date; employee and related accounts identified, including accounts held at other firms; a restricted list and watch list that block or flag trades in names the firm has inside information on; and evidence of the internal investigation when one is opened.

## Crypto: Wash Trading and Venue Surveillance

Crypto markets are where wash trading is easiest to see and hardest to stop. On October 9, 2024 the SEC charged three firms describing themselves as market makers (Gotbit Consulting, ZM Quant Investment and CLS Global) and nine individuals in five complaints in Massachusetts, describing bots that generated "quadrillions of transactions and billions of dollars of artificial trading volume each day" for crypto assets offered as securities; two of the firms were charged for manipulating a token "created at the direction of the Federal Bureau of Investigation" as part of the investigation. A paid "market making" engagement that guarantees volume is wash trading with an invoice.

For a crypto venue, surveillance has three layers:

- **The book.** The same spoofing, layering and wash trade models as above, run on the venue's own orders, with self-trade prevention at the matching engine so the venue doesn't print trades between accounts with one owner ([Order Books & Matching Engines](/books/investing-and-digital-assets/order-books-and-matching) covers self-trade prevention).
- **The customer graph.** Accounts linked by KYC data, devices, funding sources and on-chain addresses, so that wash trading across "unrelated" accounts is visible; [On-Chain Analytics & Investigations](/books/investing-and-digital-assets/blockchain-analytics) covers clustering.
- **The listing window.** Trading in an asset before its listing is announced, on the venue and on chain from addresses linked to employees, is the insider pattern the Wahi case exposed.

**Why surveillance-sharing decides ETPs.** The SEC approved spot bitcoin ETPs on January 10, 2024 (Release 34-99306), concluding that a "surveillance-sharing agreement with the CME can be reasonably expected to assist" in surveilling them. Its September 17, 2025 order approving generic listing standards for commodity-based trust shares on Nasdaq, Cboe BZX and NYSE Arca (Release 34-103995) makes that the test: a commodity qualifies if it trades on a market that is an Intermarket Surveillance Group member, if it underlies a futures contract that has been available on a designated contract market for at least six months with a comprehensive surveillance-sharing agreement, or, for initial listing, if an ETF with at least 40% of its net asset value exposed to it is already listed. The order's reasoning is that "surveillance-sharing agreements assist in the detection and deterrence of fraudulent and manipulative activity." The SEC's question for a crypto ETP is the question this chapter asks of a venue: can someone see across the markets where the price is made? Crypto ETPs covers the listing side.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `orders`, `order_events`, `executions` and `cases`. This chapter adds the models, the alerts and the evidence each alert points at.

```sql
CREATE TABLE surveillance_models (           -- a pattern detector, versioned with its thresholds
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  code                 TEXT NOT NULL,            -- 'spoofing_layering', 'wash_trade', 'marking_close',
                                                 -- 'insider_pre_announcement', 'front_running', ...
  version              INT NOT NULL CHECK (version > 0),
  scope                TEXT NOT NULL CHECK (scope IN ('customer', 'employee', 'firm',
                         'venue_participant')),
  instrument_types     TEXT[] NOT NULL,          -- thresholds differ by product class
  parameters           JSONB NOT NULL,           -- windows, ratios, minimum repetitions
  rule_refs            TEXT[] NOT NULL,          -- '9(a)(2)', '6140', '7 USC 6c(a)(5)(C)', 'MiCA 92'
  approved_by          TEXT NOT NULL,
  change_reason        TEXT NOT NULL,
  backtest_ref         TEXT,                     -- the replay over past alerts that justified it
  valid_during         TSTZRANGE NOT NULL,
  UNIQUE (code, version)
);

CREATE TABLE surveillance_alerts (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  model_id             UUID NOT NULL REFERENCES surveillance_models (id),
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  account_id           UUID REFERENCES accounts (id),
  party_id             UUID REFERENCES parties (id),       -- a person across accounts
  instrument_id        UUID NOT NULL REFERENCES instruments (id),
  window               TSTZRANGE NOT NULL,                 -- the activity it covers
  features             JSONB NOT NULL,                     -- the computed values, as the model saw them
  score                NUMERIC(6, 3),
  status               TEXT NOT NULL CHECK (status IN ('open', 'in_review', 'escalated',
                         'case_opened', 'closed_no_action', 'closed_by_principal')),
  assigned_to          TEXT,
  due_at               TIMESTAMPTZ NOT NULL,               -- the firm's review standard
  disposition_reason   TEXT,                               -- required to close
  closed_by            TEXT,
  closed_at            TIMESTAMPTZ,
  case_id              UUID REFERENCES cases (id),
  CHECK (status NOT LIKE 'closed%' OR (disposition_reason IS NOT NULL AND closed_by IS NOT NULL))
);

CREATE TABLE alert_orders (                  -- the evidence: which orders and fills made the alert
  alert_id             UUID NOT NULL REFERENCES surveillance_alerts (id),
  order_id             UUID NOT NULL REFERENCES orders (id),
  role                 TEXT NOT NULL CHECK (role IN ('spoof_side', 'profit_side', 'wash_leg',
                         'closing_print', 'pre_announcement', 'ahead_of_block', 'other')),
  execution_id         UUID REFERENCES executions (id),
  PRIMARY KEY (alert_id, order_id, role)
);
```

The spoofing features for one account and instrument, from the order event log:

```sql
WITH win AS (                     -- each fill on the profitable side, with a window around it
  SELECT e.id AS execution_id, o.account_id, o.instrument_id, o.side AS trade_side,
         tstzrange(e.executed_at - INTERVAL '2 seconds',
                   e.executed_at + INTERVAL '2 seconds') AS w,
         e.quantity AS traded_qty
  FROM executions e JOIN orders o ON o.id = e.order_id
  WHERE o.account_id = :account AND o.instrument_id = :instrument
    AND e.executed_at::date = :day
)
SELECT w.execution_id,
       SUM(o2.quantity)                                         AS opposite_shown,
       SUM(o2.quantity) FILTER (WHERE o2.status = 'canceled')   AS opposite_canceled,
       w.traded_qty
FROM win w
JOIN orders o2 ON o2.account_id = w.account_id
              AND o2.instrument_id = w.instrument_id
              AND o2.side <> w.trade_side
              AND w.w @> o2.placed_at
GROUP BY w.execution_id, w.traded_qty
HAVING SUM(o2.quantity) >= 10 * w.traded_qty;  -- the model version's parameters, not literals, in production
```

Design notes:

- **Surveillance reads the same event log as CAT and the 17a-3 memoranda,** with every order including cancels and replacements; a surveillance copy that drops canceled orders can't see spoofing.
- **The `parties` link matters as much as the account.** Manipulation runs across accounts; alerts carry the party, and related-party groupings come from `party_identities`, funding sources and devices.
- **Thresholds are versioned data** with approvals and backtests, and every alert points at the model version that raised it.
- **A closed alert must have a reason and a closer;** the check constraint makes an undocumented disposition impossible rather than discouraged.
- **Restricted and watch lists are inputs to pre-trade checks,** not only to surveillance: an employee order in a restricted name is blocked before it reaches a venue ([Pre-Trade Risk, Halts & Volatility](/books/investing-and-digital-assets/pre-trade-risk-and-halts) covers the checks).

## Auditing

Examiners ask to see the system working, not described:

- **Every model version** with its parameters, approval, reason and backtest, and the dates it was live.
- **Every alert** with its features, owner, timing against the firm's review standard, disposition and closer, and the orders it rested on.
- **Every case** that came from an alert, with any SAR, restriction or referral.
- **Every 3110 review** with the principal and date, and every internal investigation opened under 3110(d).
- **Restricted and watch list history** and every trade the lists blocked or flagged.
- **For crypto, listing-window surveillance** of employee-linked accounts and addresses for every listing.

## What This Means for the System You Build

- **Keep every order event,** cancels and replacements included, with timestamps; surveillance, CAT and the records rules all need it.
- **Compute features over windows around executions** and link alerts to the orders behind them.
- **Version thresholds as data,** tailored by product, with approvals and backtests.
- **Give every alert an owner, a deadline and a written disposition,** and look across days, accounts and alert types.
- **Join related accounts by party,** funding source, device and address.
- **Prevent self-trades at the engine** and surveil the listing window on a crypto venue.
- **Block restricted-list trades before they route.**

## References

**Law and regulation**

- [15 USC 78i: Manipulation of security prices](https://www.law.cornell.edu/uscode/text/15/78i), wash sales and matched orders in 9(a)(1), a series of transactions to induce others in 9(a)(2)
- [7 USC 6c: Prohibited transactions](https://www.law.cornell.edu/uscode/text/7/6c), (a)(5)(A) to (C): violating bids or offers, disregard for orderly execution during the closing period, spoofing defined
- [Federal Register: Order approving generic listing standards for commodity-based trust shares, 90 FR 45414 (September 22, 2025)](https://www.federalregister.gov/documents/full_text/text/2025/09/22/2025-18258.txt), Release 34-103995, the ISG, six-month DCM futures and 40% ETF tests, the surveillance-sharing reasoning, and the spot bitcoin approval (Release 34-99306) and its CME surveillance-sharing conclusion

**Regulators and guidance**

- [FINRA Rule 3110: Supervision](https://www.finra.org/rules-guidance/rulebooks/finra-rules/3110), the supervisory system, written procedures, principal review of transactions, inspections, and review for insider trading and manipulation with prompt internal investigation
- [FINRA Rule 5270: Front running of block transactions](https://www.finra.org/rules-guidance/rulebooks/finra-rules/5270), material non-public information about an imminent block, stale or obsolete, 10,000 shares
- [FINRA Rule 6140: Other trading practices](https://www.finra.org/rules-guidance/rulebooks/finra-rules/6140), successive prices to influence the market, no change in beneficial ownership, the closing-transaction provision
- [FINRA: 2026 Annual Regulatory Oversight Report, Manipulative Trading](https://www.finra.org/rules-guidance/guidance/reports/2026-finra-annual-regulatory-oversight-report/manipulative-trading), gaps in spoofing, layering, wash trade and marking-the-close surveillance, thresholds, untimely reviews, undocumented dispositions, small-cap pump-and-dumps, effective practices

**Courts and enforcement**

- [CFTC: Press release 8260-20 (September 29, 2020)](https://www.cftc.gov/PressRoom/PressReleases/8260-20), J.P. Morgan's $920.2 million for spoofing precious metals and Treasury futures from 2008 to 2016, the components, parallel DOJ and SEC actions
- [CFTC: Press release 7156-15 (April 21, 2015)](https://www.cftc.gov/PressRoom/PressReleases/7156-15), the complaint against Navinder Sarao, the layering algorithm and the alleged contribution to May 6, 2010
- [SEC: Press release 2022-127 (July 21, 2022)](https://www.sec.gov/newsroom/press-releases/2022-127), insider trading charges against Ishan Wahi, Nikhil Wahi and Sameer Ramani, 25 crypto assets, $1.1 million
- [SEC: Press release 2024-166 (October 9, 2024)](https://www.sec.gov/newsroom/press-releases/2024-166), charges against Gotbit, ZM Quant, CLS Global and nine individuals for crypto wash trading and the FBI-created token

**Vendor documentation**

- [Solidus Labs: Trade surveillance](https://soliduslabs.com/solutions/trade-surveillance), the typologies covered and the asset classes and venues monitored
