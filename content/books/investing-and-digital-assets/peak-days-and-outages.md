+++
title = "Peak Days, Outages & Resilience"
nav_title = "Peak Days & Outages"
description = "Meme days and crypto crashes at brokers and exchanges: capacity plans, load shedding, status, Reg SCI, FINRA 4370 continuity plans and paying for outages."
category = "Investing & Digital Assets Industry"
order = 2577
part = "Running the Platform"
tags = ["investing", "crypto", "resilience", "capacity", "outages", "reg-sci", "business-continuity"]
+++

A trading platform's worst day is chosen by the market. The morning the indexes fall 7% and trading halts for fifteen minutes, the week a heavily shorted stock goes vertical, the hour bitcoin drops a fifth and a wave of liquidations runs: those are the days every customer opens the app at once, every order is urgent, and every minute the platform is down is a price the customer can name. On March 2 and 3, 2020, Robinhood's website and apps shut down and all of its customers, 12.5 million accounts at the time, could not trade; FINRA's 2021 order found the firm had no live phone line for them to call and a continuity plan that described order channels it didn't have. On May 7, 2026, a cooling failure in one AWS data hall took Coinbase's exchange matching engine below quorum for hours. Neither was caused by the market, but the market decided what they cost.

This chapter covers the public record of broker and exchange outages, what a peak day looks like and a capacity plan for a meme-stock day in worked numbers, load shedding and degraded modes, the dependencies that fail on the same days, status communication, Regulation SCI and who it covers, FINRA Rule 4370's continuity plans, and paying customers for outages, with a worked claim. The general engineering is the playbook's ([Admission Control](/docs/architecture/admission-control), [Disaster Recovery](/docs/operations/disaster-recovery), [Incident Response](/docs/operations/incident-response)) and the Hosting & Cloud volume's ([Regions, Zones & Cells](/books/hosting-and-cloud/regions-zones-and-cells), [Outages & Status Pages](/books/hosting-and-cloud/outages-and-status-pages)). The January 2021 trading restrictions, which were a clearing problem rather than an outage, are in [Clearing Deposits and the January 2021 Restrictions](/books/investing-and-digital-assets/pre-trade-risk-and-halts#clearing-deposits-and-the-january-2021-restrictions). The chapter adds `service_incidents`, `degradation_modes` and `outage_compensations` to [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model).

## How the Platforms Do It

The public record of outages at brokers and exchanges, as of November 2026, from regulators' orders, filings and engineering reports:

| When | Platform | What happened | Source |
| --- | --- | --- | --- |
| January 24, 2018 | Robinhood | Options orders couldn't be processed for eight and a half hours after technology updates malfunctioned; more than 400 options orders were not executed or processed | FINRA AWC (2021) |
| December 12, 2018 | Robinhood | Two hours down after faulty code; 5,252 pending options orders canceled, new orders blocked, withdrawals restricted for about 13,000 accounts; an executive called it a "watershed incident" | FINRA AWC |
| March 2 to 3, 2020 | Robinhood | Website and apps shut down for all customers (12.5 million accounts) during historic volatility, because "a key firm system was overloaded, which caused a cascading failure of other systems"; email and the in-app contact portal were also disrupted | FINRA AWC |
| March 9, 2020 | Robinhood | An untested messaging protocol change by an execution venue hit an internal coding error; order entry down 45 minutes, about 166,000 orders stuck "pending", during a day the market-wide circuit breaker also halted trading | FINRA AWC |
| January 27 to 28, 2021 | One broker (unnamed by the SEC staff) | Its system reached its limit of unique order IDs, and it restricted new GME and AMC purchases for the last ninety minutes the next day ([Clearing Deposits and the January 2021 Restrictions](/books/investing-and-digital-assets/pre-trade-risk-and-halts#clearing-deposits-and-the-january-2021-restrictions)) | SEC staff report, via that chapter |
| 2025 | Coinbase | "approximately 10 outages, with an average outage duration of 74.2 minutes" | 2025 Form 10-K |
| May 7, 2026 | Coinbase Exchange | Cooling failure in one us-east-1 data hall; three of five matching engine nodes lost, no automated cross-zone failover; customers couldn't buy, sell, deposit, withdraw or transfer for several hours; markets reopened through cancel-only and auction modes ([Replay and Recovery](/books/investing-and-digital-assets/order-books-and-matching#replay-and-recovery)) | InfoQ report of Coinbase's postmortem |
| October 29, 2026 | Binance | Withdrawals suspended after a hot wallet compromise; as of its November 5 update, reopening asset by asset, with deposit services open ([Binance, October 29, 2026](/books/investing-and-digital-assets/exchange-security#binance-october-29-2026)) | Binance's updates |

Four lessons run through it:

- **Overload cascades.** Robinhood's March 2 outage started as one overloaded system; FINRA found the parent company had monitored capacity but "did not adequately consider the firm's significant growth or the potential impact of extreme market conditions." Capacity planned for last month's peak is the cause on the next one.
- **Change is the other cause.** Every Robinhood outage FINRA listed before 2020 traced to a code change, a script or maintenance, and March 9 was a counterparty's change. Peak days punish whatever shipped the week before.
- **The outage is longer than the downtime.** Coinbase's engine came back through cancel-only and auction modes, and Binance's withdrawals came back asset by asset. Recovery is a sequence of degraded modes, each a product state.
- **Ten outages a year is normal.** Coinbase's 2025 figure is about 742 minutes of outage, about 12.4 hours in a year, or 99.86% availability by my arithmetic. A platform should know its own number before an examiner or a plaintiff computes it.

## What a Peak Day Looks Like

Robinhood's engineers reported that its brokerage system's peak went from 100,000 requests a second in December 2019 to 750,000 in June 2020, "a 7x increase" in six months, across the March 2020 crash and the retail surge after it. That is the shape of a peak: not a busier version of a normal day but a different customer base arriving at once, with new accounts, first deposits, first trades and the support queue all spiking together.

Three things make a trading peak worse than a shopping peak ([Capacity Planning for a Sale](/books/commerce/peak-season#capacity-planning-for-a-sale) is the retail version):

- **It isn't scheduled.** A sale has a date; a crash or a squeeze has a morning. The plan has to hold without notice, which means headroom already provisioned, not autoscaling that arrives in ten minutes.
- **It concentrates.** On a meme day a large share of orders is in one or two symbols. Account shards stay balanced, but anything keyed by symbol (the market data shard for that stock, the firm's net position counter for it, the clearing deposit forecast) takes the whole load.
- **Every customer's request is time-critical.** A slow product page loses a sale; a slow sell order loses money the customer can measure, and the cancels behind it matter more than the orders.

Crypto's peaks run on the same pattern at any hour: the October 10, 2025 liquidations ran on a Friday ([Crises & the Rules They Wrote](/books/investing-and-digital-assets/crises-and-the-rules#2025-and-2026)), and a crypto venue's plan can't assume staff are at their desks.

## Capacity for a Meme-Stock Day

A worked plan of my own for a hypothetical broker with 12 million funded accounts on ten account shards. The method is the one that matters: take the normal opening peak, multiply by a surge factor set from the platform's own history and the public record, add headroom, and check every downstream count, not only the order path.

**The normal day.** 3 million orders a day. The first 15 minutes carry 12% of them: 360,000 orders in 900 seconds, 400 a second on average, and the busiest second runs at three times that average, 1,200 orders a second. Each order produces about six writes to the posting service and its outbox (the buying power hold, the route, the venue acknowledgment, an average 1.3 fills, the hold release and the confirm event), so 7,200 writes a second at the opening peak.

**The surge factor.** Robinhood's 7.5x over six months (750,000 over 100,000 requests a second, which its engineers called "a 7x increase") is the public anchor; my plan uses 10x on orders for a single morning, because a squeeze concentrates new demand in hours, not months.

| Count | Normal opening peak | Meme-day plan (10x) | Tested capacity (2x the plan) |
| --- | --- | --- | --- |
| Orders a second, platform | 1,200 | 12,000 | 24,000 |
| Posting writes a second, platform (6 per order) | 7,200 | 72,000 | 144,000 |
| Posting writes a second, per shard (10 shards) | 720 | 7,200 | 14,400 |
| Orders a second in the top symbol (10% of flow normally, 60% on the meme day) | 120 | 7,200 | 14,400 |
| Account applications an hour | 2,000 | 20,000 | Vendor limit: 12,000 (below) |
| Orders in the day | 3 million | 30 million | Order ID space: 10 million a day (below) |

What the table finds that a single load test wouldn't:

- **The headroom rule.** The meme-day plan should use no more than half of tested capacity, because a cascade starts when queues build, and queues build well before 100%. Robinhood's March 2 overload is what running at the edge looks like.
- **The hot symbol is a firm-level hot key.** 7,200 orders a second in one stock all update the firm's net position and the clearing deposit forecast for that symbol. Kept as one row, that counter serializes the order path. Kept as per-shard subtotals summed every second, it costs nothing ([Sharding by Account](/books/investing-and-digital-assets/trading-platform-architecture#sharding-by-account)).
- **Third parties have limits too.** If the identity verification vendor's contract allows 12,000 checks an hour, 20,000 applications an hour queue. That is fine if account opening is designed to queue with an honest wait message ([Position and Wait Messages](/docs/architecture/admission-control#position-and-wait-messages)); it's an outage if the signup flow times out and retries.
- **Identifier spaces run out.** Suppose order IDs carry a daily sequence capped at 10 million. A normal day uses 30% of it. On the meme day, with a quarter of the 30 million orders in the first hour (7.5 million) and the rest spread over the remaining five and a half hours (about 4.1 million an hour), the cap falls about 37 minutes into the second hour, around 11:07 am. The broker the SEC staff found had reached its limit of unique order IDs in January 2021 had a version of this problem ([Clearing Deposits and the January 2021 Restrictions](/books/investing-and-digital-assets/pre-trade-risk-and-halts#clearing-deposits-and-the-january-2021-restrictions)). Every counter, sequence and fixed-width field gets the same 10x check.

The plan is tested, not just computed: replayed production traffic at the plan's rates against a production-like shard (Robinhood's crypto team load tested with its "in-house framework," replaying recorded production reads at scaled rates), synthetic orders against venue test environments, and a game day that loses a shard at the planned peak ([Runbooks and Game Days](/docs/operations/disaster-recovery#runbooks-and-game-days)).

## Load Shedding and Degraded Modes

When demand exceeds capacity anyway, the platform chooses what fails. The playbook's [Priority Classes](/docs/architecture/admission-control#priority-classes) apply, with an order that comes from the customer's risk, not from engineering convenience:

1. **Cancels and risk-reducing orders.** A cancel, a sell to close and a buy to cover reduce risk; shedding them can turn an outage into a loss. They go first and are the last thing a degraded mode stops.
2. **Order status and positions.** A customer who can't see whether an order filled will submit it again.
3. **New orders that add risk.**
4. **Quotes,** conflated to a lower rate before any connection is dropped ([Fan-Out to Millions of Clients](/books/investing-and-digital-assets/market-data#fan-out-to-millions-of-clients)).
5. **Funding and withdrawals** of cash, which can queue with a clear message.
6. **Account opening,** queued.
7. **Everything else:** charts, news, discovery, referrals, notifications that aren't about orders. Robinhood's crypto team built throttling for "temporarily turning off certain less business critical features."

Each step is a degraded mode the platform can enter on purpose, per scope:

| Mode | Scope | What it allows | When |
| --- | --- | --- | --- |
| `cancel_only` | Market or symbol | Cancels and reductions only | Recovering a matching engine, a venue outage, a halt boundary ([Replay and Recovery](/books/investing-and-digital-assets/order-books-and-matching#replay-and-recovery)) |
| `close_only` | Symbol or account | Orders that reduce a position | A clearing deposit spike, a delisting, an account restriction ([Clearing Deposits and the January 2021 Restrictions](/books/investing-and-digital-assets/pre-trade-risk-and-halts#clearing-deposits-and-the-january-2021-restrictions)) |
| `auction` | Market | Orders collected, one uncross | Reopening after an outage on a crypto venue |
| `read_only` | Shard or platform | Viewing, no new instructions | A ledger or posting failure where correctness is in doubt |
| `withdrawals_paused` | Asset network or platform | Deposits continue, withdrawals queue | A chain incident, a hot wallet compromise, a reconciliation break |
| `feature_off` | Feature | Everything except the named feature | Shedding load |
| `queue_signups` | Account opening | Applications accepted, decisions queued | A vendor limit or a surge |

Two rules make the modes safe. **A mode is a row, not a deploy:** `degradation_modes` (below) is read by the order path, the withdrawal pipeline and the app, set by an on-call operator under a runbook, and recorded with its reason and the customer message shown. **Ramp back deliberately:** reopening everything at once after an outage recreates the peak that caused it, so release orders by class and shard as the playbook's [Ramping After an Outage](/docs/architecture/admission-control#ramping-after-an-outage) describes, and reopen a crypto market through an auction rather than letting the first order trade through a stale book.

## Dependencies Fail on the Same Days

A broker or exchange is a chain of other firms' systems, and volatility loads all of them at once:

- **Venues and liquidity providers.** March 9, 2020 was a venue's protocol change the broker hadn't tested. Robinhood's 2025 10-K warns that disruptions at its liquidity providers have in the past, and may in the future, "impair our ability to execute our client's orders," and names downtime "particularly during peak trading hours." Every venue change goes through certification before it reaches production, and routing has a fallback per symbol when one destination drops.
- **The clearing house.** NSCC's deposit calls rise with volatility; the January 2021 restrictions came from a deposit, not a failed server ([Clearing Deposits and the January 2021 Restrictions](/books/investing-and-digital-assets/pre-trade-risk-and-halts#clearing-deposits-and-the-january-2021-restrictions)).
- **The cloud zone.** Coinbase's engine was co-located in one placement group for latency, so a data hall failure took a quorum at once. Placement is part of the quorum design ([Blast Radius in Real Outages](/books/hosting-and-cloud/regions-zones-and-cells#blast-radius-in-real-outages)).
- **Chains and rollups.** A congested chain delays withdrawals; a rollup's sequencer outage stops deposits and withdrawals on it ([Layer 2s, Bridges & Cross-Chain](/books/investing-and-digital-assets/layer-2s-and-bridges)).
- **Vendors behind the signup and the login.** Identity verification, SMS and email providers, market data and analytics vendors have their own limits and outages; each needs a stated fallback ([When the Scorer Is Down](/docs/building-blocks/risk-scoring#when-the-scorer-is-down)).

My rule for the week before a known risk (a big expiration, an index rebalance, a token unlock, an election): freeze non-urgent changes to order entry, routing and posting, and certify every counterparty change before it goes live.

## Status Communication

FINRA's order describes the worst version: during the March 2020 outage customers "could not communicate with the firm" because its only support options, email and an in-application contact portal, were also disrupted, and "the firm had no live customer service telephone line." Rule 4370 requires a plan for "alternate communications between customers and the member," and the order found the plan promised phone contact the firm couldn't provide.

What I build:

- **A status page that doesn't share the platform's failure domain,** hosted elsewhere, updated by the incident commander, and linked from a static in-app banner the app fetches from a separate origin ([Status Pages](/books/hosting-and-cloud/outages-and-status-pages#status-pages)).
- **Statements about orders, not systems.** Customers need to know whether their open orders are live, whether stop orders will trigger, whether they can cancel, and what happens to orders entered during the outage. "Some users may experience issues" answers none of those.
- **An alternate way to reduce risk.** A phone line with licensed staff who can enter closing orders, or a minimal order path that runs separately from the main app, sized for a fraction of customers. Rule 4370's "mission critical systems" include "order taking, order entry, execution" and "access to customer accounts"; a plan without a second way in for them is a plan that says the firm will be unavailable.
- **A record of what was said.** Every banner, status update and push notification, with its time and text, kept with the incident. It is evidence later for regulators and for compensation decisions (below).

## Regulation SCI

Regulation Systems Compliance and Integrity (17 CFR 242.1000 to 242.1007) is the SEC's resilience rule for market infrastructure. It applies to **SCI entities**: SCI self-regulatory organizations (exchanges, registered clearing agencies, FINRA, MSRB), SCI alternative trading systems, plan processors, certain exempt clearing agencies and SCI competing consolidators. An ATS becomes an SCI ATS when, in at least four of the preceding six calendar months, it had 5% or more of volume in any single NMS stock and 0.25% or more in all NMS stocks, or 1% or more of average daily dollar volume in all NMS stocks (with a separate 5% test for non-NMS equities). A retail broker-dealer is not an SCI entity by being a broker; Reg SCI reaches it only if it operates an SCI ATS. The SEC proposed in April 2023 to widen the definition (88 FR 23146) and withdrew that proposal on June 17, 2025, saying it "does not intend to issue final rules with respect to these proposals." As of November 2026 the scope is the 2014 one.

What it requires of SCI systems (those that directly support trading, clearance and settlement, order routing, market data, market regulation or surveillance):

- **Policies with capacity planning and stress tests.** Rule 1001(a) requires "reasonable current and future technological infrastructure capacity planning estimates" and "periodic capacity stress tests," the formal version of the plan above.
- **Business continuity with stated targets.** Backup and recovery "sufficiently resilient and geographically diverse" to achieve "next business day resumption of trading and two-hour resumption of critical SCI systems" after a wide-scale disruption.
- **Corrective action and notice to the SEC.** On a reasonable basis to conclude an SCI event (a systems disruption, a systems compliance issue or a systems intrusion) has occurred: corrective action, notice to the SEC "immediately," a written notification "within 24 hours," regular updates, and a final report within five business days after resolution (or an interim one within 30 calendar days if it isn't resolved by then). Events with no or a de minimis impact are recorded instead, and disruptions and intrusions among them are summarized to the SEC quarterly.
- **Telling members.** Information about a systems disruption goes "promptly" to the members or participants affected, and for a major SCI event to all of them.

Two uses for a broker or crypto exchange that isn't covered. **Its venues are,** so their SCI notices are part of the broker's incident inputs: a venue's disruption notice is a routing decision. **The rule is a good template.** Capacity estimates, stress tests, a two-hour target for critical systems, classified events with clocks and notice to affected participants are exactly what a crypto venue's board should ask for; the EU's DORA imposes its own version on EU crypto-asset service providers and NYDFS's Part 500 on New York licensees, both covered in the Banking & Lending volume's [Security, Resilience & Incident Notice](/books/banking-and-lending/security-and-resilience#business-continuity-and-operational-resilience).

## FINRA Rule 4370: The Continuity Plan

Every FINRA member must keep a written business continuity plan "reasonably designed to enable the member to meet its existing obligations to customers," update it after any material change, review it annually, have a member of senior management who is a registered principal approve it, and disclose to customers in writing at account opening (and on its website) how the plan addresses a significant business disruption. The plan must address at least:

1. Data backup and recovery, hard copy and electronic
2. All mission critical systems
3. Financial and operational assessments
4. Alternate communications between customers and the member
5. Alternate communications between the member and its employees
6. Alternate physical location of employees
7. Critical business constituent, bank and counterparty impact
8. Regulatory reporting
9. Communications with regulators
10. How the member will assure customers prompt access to their funds and securities if it can't continue business

A category that doesn't apply needs a documented reason, and where the member relies on another entity (a clearing firm, a parent company, a cloud provider) for a category or a mission critical system, the plan must "address this relationship." Members also report two emergency contacts to FINRA, at least one a senior manager and registered principal, and update them promptly.

FINRA's 2021 order against Robinhood is the case study for how a plan fails. From at least January 2018 through August 2020 it "unreasonably limited its BCP to events that affected its employees' ability to conduct business from the firm's physical locations due to, for example, a natural disaster or pandemic," so it was never applied to technology outages, even after March 2020, which the firm itself regarded as an "existential" risk. It followed FINRA's template for "small introducing firms," and so described taking orders by other methods and executing through an "alternative trading system" the firm didn't have, and promised phone communication without a phone line. The firm also outsourced operation of its technology to its parent company "without broker-dealer oversight," which the order found violated Rule 3110's supervision duty. The engineering reading:

- **Technology outages are business disruptions.** The plan's triggers include a failed shard, a lost quorum, a venue outage and a vendor failure, each with a named runbook.
- **The plan describes systems that exist.** Every alternate channel it names is built, staffed and tested on a schedule; a plan audit is a game day, not a document review.
- **Dependencies are in the plan by name.** The parent company that runs the technology, the cloud provider, the clearing firm, the identity vendor: each with its role and its fallback.

## Paying for Outages

No rule requires a broker or exchange to compensate customers for an outage, and customer agreements limit liability for system failures. In practice firms pay some claims and regulators order restitution for others: FINRA's 2021 order required Robinhood to pay $5,213,557.98 in restitution "in connection with outages that occurred between January 2018 and December 2020" (which the firm said it had already paid), within $12,598,445.16 of restitution overall plus interest and a $57 million fine, and noted that "as a result of the outages, Robinhood paid millions of dollars to customers." The order also found the firm failed to report tens of thousands of customer complaints, including complaints that customers "suffered losses as a result of the firm's outages," which Rule 4530 required; an outage's complaints are reportable records, not just support tickets.

What a fair and defensible program needs is evidence of what the customer tried to do. The four harms the FINRA order lists are a sensible scope: purchases that couldn't be entered or weren't executed in securities that then rose; sales that couldn't be entered in securities that then fell; stop orders that didn't execute at their price; and options that couldn't be sold before they expired worthless. Each needs a record that the attempt happened, which means the edge must log attempted submissions even when the order path is down: the app's request with its `client_order_id`, the time and the customer's intended order.

**Worked numbers: one claim.** A hypothetical of my own. At 10:05 am a customer submits a sell of 10 call contracts; the edge logs the attempt with its key, and the order path is down until 11:20. The quote history shows a bid of $2.40 at 10:05. Order entry reopens at 11:20 and the customer sells at 11:22 for $1.10. The claim is the difference at the first reasonable opportunity: (2.40 − 1.10) × 10 contracts × 100 shares = $1,300. Three policy choices decide it and must be written before the outage, not during:

- **Which price at the attempt.** The bid at the logged time, from the platform's own quote history, not the customer's recollection.
- **What counts as mitigation.** A customer who didn't sell at 11:22 but held for a week and sold lower is paid to 11:22, the first chance they had; one who later sold higher is owed nothing.
- **No attempt, no claim.** Customers who say they would have traded but have no logged attempt are handled as complaints, reviewed on their facts, not paid by formula.

The payment posts as a firm-to-customer journal entry linked to the incident and the claim, so statements, tax records and the incident agree, and the claim and its decision are a `cases` row on the complaint clock ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)).

## How to Build It

The volume already records orders, events, quotes and cases. This chapter adds the incident itself, the degraded modes the platform can be put in, and the compensation decisions that follow:

```sql
CREATE TABLE service_incidents (           -- one outage or degradation, customer-visible or not
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  title               TEXT NOT NULL,
  severity            TEXT NOT NULL CHECK (severity IN ('sev1', 'sev2', 'sev3')),
  scope               JSONB NOT NULL,        -- {"shards": [3], "venues": ["..."], "asset_networks": [...]}
  functions_affected  TEXT[] NOT NULL,       -- 'order_entry', 'cancel', 'quotes', 'deposits',
                                             -- 'withdrawals', 'login', 'statements', 'support'
  started_at          TIMESTAMPTZ NOT NULL,  -- first customer impact, from telemetry
  detected_at         TIMESTAMPTZ NOT NULL,
  mitigated_at        TIMESTAMPTZ,
  resolved_at         TIMESTAMPTZ,
  cause_category      TEXT CHECK (cause_category IN ('capacity', 'change', 'dependency',
                        'infrastructure', 'security', 'data', 'unknown')),
  bcp_invoked         BOOLEAN NOT NULL DEFAULT FALSE,  -- Rule 4370 plan applied
  sci_event           TEXT CHECK (sci_event IN ('disruption', 'compliance_issue', 'intrusion')),
  venue_notices       JSONB NOT NULL DEFAULT '[]',     -- venues' own SCI or status notices received
  status_updates_ref  TEXT NOT NULL,         -- every banner, status post and push, as published
  postmortem_ref      TEXT,
  case_id             UUID REFERENCES cases (id)
);

CREATE TABLE degradation_modes (           -- a mode is a row, read by every path it governs
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  scope_kind          TEXT NOT NULL CHECK (scope_kind IN ('platform', 'legal_entity', 'shard',
                        'venue', 'instrument', 'trading_pair', 'asset_network', 'feature')),
  scope_ref           TEXT NOT NULL,         -- the id or name of the scoped thing
  mode                TEXT NOT NULL CHECK (mode IN ('cancel_only', 'close_only', 'auction',
                        'read_only', 'withdrawals_paused', 'feature_off', 'queue_signups')),
  reason              TEXT NOT NULL,
  customer_message    TEXT NOT NULL,         -- what the app shows, versioned with the row
  service_incident_id UUID REFERENCES service_incidents (id),
  set_by              TEXT NOT NULL,         -- the operator, under a named runbook
  runbook             TEXT NOT NULL,
  active_during       TSTZRANGE NOT NULL,    -- open upper bound while in force
  EXCLUDE USING gist (scope_kind WITH =, scope_ref WITH =, mode WITH =, active_during WITH &&)
);

CREATE TABLE outage_compensations (        -- one claim, decided by a written policy
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  service_incident_id UUID NOT NULL REFERENCES service_incidents (id),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  case_id             UUID NOT NULL REFERENCES cases (id),       -- the complaint, on its clock
  attempt_ref         TEXT,                  -- the logged attempt: client_order_id and edge log key
  harm_kind           TEXT NOT NULL CHECK (harm_kind IN ('buy_not_entered', 'sell_not_entered',
                        'stop_not_executed', 'option_expired', 'other')),
  instrument_id       UUID REFERENCES instruments (id),
  quantity            NUMERIC(78, 0),
  attempt_price       NUMERIC(38, 18),       -- from the platform's quote history at the attempt
  mitigation_price    NUMERIC(38, 18),       -- at the first reasonable opportunity
  amount              BIGINT,                -- minor units of the account's base currency
  policy_version      TEXT NOT NULL,
  decision            TEXT NOT NULL CHECK (decision IN ('pending', 'paid', 'denied', 'partial')),
  journal_entry_id    UUID REFERENCES journal_entries (id),
  decided_at          TIMESTAMPTZ,
  UNIQUE (service_incident_id, account_id, attempt_ref)
);
```

The order path's gate reads the modes in force for everything an order touches; any row that disallows the order rejects it with that row's message:

```sql
SELECT d.mode, d.customer_message
FROM degradation_modes d
WHERE d.active_during @> NOW()
  AND (   (d.scope_kind = 'platform')
       OR (d.scope_kind = 'legal_entity' AND d.scope_ref = :legal_entity_id::text)
       OR (d.scope_kind = 'shard'        AND d.scope_ref = :shard_id::text)
       OR (d.scope_kind = 'instrument'   AND d.scope_ref = :instrument_id::text)
       OR (d.scope_kind = 'venue'        AND d.scope_ref = :venue_id::text))
  AND NOT (d.mode IN ('cancel_only', 'close_only') AND :reduces_risk)
  AND d.mode NOT IN ('withdrawals_paused', 'queue_signups', 'feature_off');
```

Design notes:

- **Attempts are logged at the edge, always.** The gateway writes every order attempt with its key before calling the order path, so an outage leaves the evidence compensation needs.
- **Modes are cached briefly and read on every decision.** A mode set at 10:05:00 should stop orders within seconds; the cache is seconds long and invalidated by the mode's event.
- **The incident record is the 4370 record.** `bcp_invoked`, the runbooks named on each mode, and the status updates as published are what an examiner reads to see whether the plan was used.
- **Complaints from an outage are cases,** reported under Rule 4530 like any other, linked to the incident.
- **Events:** `degradation_mode.set` and `.cleared` reach the app, the order path and the withdrawal pipeline through the outbox; `service_incident.opened` pages the incident commander and starts the status page.

## Auditing

The records an examiner, a plaintiff's lawyer or an arbitration panel asks for after a bad day:

- **What failed, when, for whom.** Each incident with its scope, functions affected, first impact, detection, mitigation and resolution, and the postmortem ([The Postmortem](/docs/operations/incident-response#the-postmortem)).
- **What the platform allowed during it.** Every degraded mode with its scope, reason, operator, runbook and customer message, and every order rejected because of one.
- **What customers were told.** Every status update, banner and notification as published, with times.
- **What customers tried.** The logged attempts, the quote history at those times, and every compensation decision with its policy version.
- **That the plan was real.** The 4370 plan, its annual review, its approver, the emergency contacts reported to FINRA, and the game days that tested its alternate channels.
- **Capacity evidence.** The capacity plan, its surge factor and its last test, so "did you plan for this" has a dated answer.

## What This Means for the System You Build

- **Plan capacity from a surge factor,** test to twice the plan, and run the 10x check on every counter, sequence, ID space and vendor limit.
- **Find the hot keys a meme day creates** (symbol-level firm counters, market data shards) and split them before the morning they matter.
- **Shed load in the customer's risk order:** cancels and closing orders last, discovery features first.
- **Make every degraded mode a row** with a scope, a runbook and a customer message, and ramp back by class and shard.
- **Freeze changes before known risks** and certify every counterparty's change before it reaches production.
- **Communicate from outside the failure domain,** in terms of orders, with an alternate way for customers to reduce risk.
- **Treat Reg SCI as a template** even when it doesn't apply, and read your venues' SCI notices as routing inputs.
- **Write the 4370 plan for technology failures,** describe only systems that exist, and test them.
- **Log every attempt at the edge** and decide compensation by a written policy, so a claim is arithmetic.

## References

**Law and regulation**

- [17 CFR 242.1000 (Regulation SCI definitions)](https://www.law.cornell.edu/cfr/text/17/242.1000), SCI entity, the SCI ATS volume tests, SCI systems, critical SCI systems, SCI events and major SCI events
- [17 CFR 242.1001 (Regulation SCI obligations)](https://www.law.cornell.edu/cfr/text/17/242.1001), capacity planning estimates, stress tests, the two-hour and next-business-day resumption targets and SCI industry standards
- [17 CFR 242.1002 (Regulation SCI obligations related to SCI events)](https://www.law.cornell.edu/cfr/text/17/242.1002), corrective action, immediate and 24-hour notice to the SEC, updates, final and interim reports, de minimis events and dissemination to members
- [FINRA Rule 4370 (Business Continuity Plans and Emergency Contact Information)](https://www.finra.org/rules-guidance/rulebooks/finra-rules/4370), the plan's minimum elements, annual review, senior management approval, customer disclosure and emergency contacts

**Regulators and guidance**

- [Federal Register: Regulation Systems Compliance and Integrity (proposed rule, April 14, 2023)](https://www.federalregister.gov/documents/2023/04/14/2023-05775/regulation-systems-compliance-and-integrity), the proposal to widen the SCI entity definition
- [Federal Register: Withdrawal of Proposed Regulatory Actions (June 17, 2025)](https://www.federalregister.gov/documents/2025/06/17/2025-11110/withdrawal-of-proposed-regulatory-actions), the withdrawal of the Reg SCI amendments (88 FR 23146) and the statement that no final rules will issue

**Filings**

- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), about 10 outages in 2025 averaging 74.2 minutes, and the risk of slow systems under extraordinary trading volumes
- [Robinhood Markets: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000023/hood-20251231.htm), liquidity provider downtime during peak hours and system disruption risk

**Courts and enforcement**

- [FINRA: Letter of Acceptance, Waiver and Consent No. 2020066971201, Robinhood Financial LLC (accepted June 30, 2021)](https://www.finra.org/sites/default/files/2021-06/robinhood-financial-awc-063021.pdf), the outages of 2018 to 2020 with their causes and effects, the March 2020 outages, the business continuity plan findings, supervision of outsourced technology, unreported complaints, the $57 million fine and the restitution amounts

**In practice**

- [Robinhood: How we scaled Robinhood's brokerage system for greater reliability (June 25, 2021)](https://robinhood.com/newsroom/how-we-scaled-robinhoods-brokerage-system-for-greater-reliability), peak load of 100,000 requests a second in December 2019 and 750,000 in June 2020
- [Robinhood: Scaling Robinhood crypto systems (September 9, 2022)](https://robinhood.com/newsroom/scaling-robinhood-crypto-systems/), replaying production reads for load tests and throttling less critical features
- [InfoQ: Coinbase AWS failure postmortem (June 16, 2026)](https://www.infoq.com/news/2026/06/coinbase-aws-failure-postmortem/), the May 7, 2026 us-east-1 cooling failure, the loss of three of five nodes, no automated cross-zone failover, several hours without buys, sells, deposits, withdrawals or transfers, and the recovery through cancel-only and auction modes
- [Binance: Security incident recovery update #8 (November 5, 2026)](https://www.binance.com/en/support/announcement/detail/a225a3b6084c41dc8c8dfb33f4de5872), withdrawals reopening by network and asset, prioritized by demand, with deposit services open
