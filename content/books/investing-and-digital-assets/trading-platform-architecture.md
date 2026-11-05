+++
title = "Trading Platform Architecture"
nav_title = "Platform Architecture"
description = "A broker or exchange as one system: services around one posting path, sharding by account, sequenced inputs, idempotency, 24/7 operation and invariants."
category = "Investing & Digital Assets Industry"
order = 2576
part = "Running the Platform"
tags = ["investing", "crypto", "architecture", "sharding", "event-sourcing", "invariants"]
+++

Every earlier chapter of this volume ended with a How to Build It: the tables an order, a fill, a deposit, a lot, a margin call or a proof of reserves adds to the core model. This chapter is where those pieces become one running system. A broker or a crypto exchange is a dozen services that each own a slice of the same promise (accounts and identity, orders and risk, the matching engine or the routes to other venues, market data, transfers in and out, wallets and the chain watchers, clearing and settlement, lots and tax forms, surveillance), and the hard parts are the seams between them: a fill that has to reach the ledger exactly once, a deposit credited on a block that later disappears, a customer whose buying power is read by the order path while the transfer path is debiting it, a market that never closes for a release, and a dozen legal entities whose books must never mix.

The chapter covers how the public write-ups describe their platforms, the services and which of the volume's tables each owns, sharding by account and what refuses to shard, sequencing and the event log, idempotency at every boundary, operating without a close, multi-entity design, the invariants a platform checks continuously (with a ledger and chain mismatch caught in worked numbers), and a reference build. The general engineering is the playbook's ([Service Boundaries](/docs/architecture/service-boundaries), [Events & Async Messaging](/docs/architecture/events), [Idempotency](/docs/requests/idempotency), [Multi-Tenancy](/docs/architecture/multi-tenancy)); the Banking & Lending volume's [Banking Architecture](/books/banking-and-lending/banking-architecture) and the Payments volume's [Payments Architecture at Scale](/books/payments/architecture-at-scale) are the same exercise for a bank and a payment provider. The chapter adds `sequencer_inputs`, `invariant_checks` and `entity_partitions` to [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model).

## How the Platforms Do It

As of November 2026, from the firms' own engineering write-ups and filings. Architecture claims are theirs:

| Platform | What it describes | The constraint it answered | Source |
| --- | --- | --- | --- |
| **Robinhood brokerage** (June 2021) | Stayed on PostgreSQL and sharded "at the application level": each shard has "its own application servers, database, and deployment pipeline"; users map to shards through "durable and cacheable mapping records"; a routing layer sends each request to its shard, and a stateless aggregation layer fans internal queries across shards with per-shard cursors; every shard consumes all Kafka messages and keeps its own users', with dedicated topics for heavy flows | One database server that degraded under volatility: peak load went from 100,000 requests a second in December 2019 to 750,000 in June 2020; shards went from 1 (early 2020) to 3 (end of 2020) to 10 | Engineering post |
| **Robinhood crypto** (September 2022) | Query audits, read replicas, caching only on read paths ("we never used caching on the write paths"), load tests replaying production reads, feature throttling held in reserve, then the whole stack (servers, daemons, cache, database) sharded, with settlement extracted into a shared component | A crypto volume surge in 2021 on one primary database | Engineering post |
| **Alpaca OMS v2** (November 2021) | Order state in memory across nodes, each "responsible for a particular set of accounts"; a write-ahead log on Redpanda (Kafka API); a restarting node hydrates from the database and replays the log from its last offsets; stateless balancers hold gRPC connections and forward calls; 85% of orders under 1.5 ms and 95% under 5 ms | v0 locked the account row in the database (about 200 ms); v1 was a singleton with a goroutine per account (about 150 ms average, 500 ms peaks, a single point of failure) | Engineering post |
| **Coinbase Exchange** | A single-threaded deterministic matching core; Raft replicates the input log across five nodes; snapshots on a follower; recovery and disaster recovery by replay ([Determinism and Sequencers](/books/investing-and-digital-assets/order-books-and-matching#determinism-and-sequencers)) | Sub-millisecond matching without a database in the hot path; on May 7, 2026 the co-located cluster lost quorum when an AWS data hall failed ([Replay and Recovery](/books/investing-and-digital-assets/order-books-and-matching#replay-and-recovery)) | QCon talk and InfoQ reports |
| **Kraken** (February 2021) | Core backend rewritten from PHP to Rust from mid-2018, endpoint by endpoint, with one integration test suite run against both implementations; about 500,000 lines of Rust; unoptimized Tokio RPC servers at about 150,000 requests a second per instance with p99.9 under 3 ms | A PHP backend it judged unfit for the long term; rewrite without a cutover | Engineering post |

Four patterns run through the table:

- **The account is the unit of scale.** Robinhood's shards, Alpaca's OMS nodes and every exchange's balance service partition by customer account, because almost every invariant a customer cares about (buying power, open orders, holds, positions) lives inside one account.
- **The log comes before the state.** Alpaca's write-ahead log and Coinbase's replicated input log are the same idea at different speeds: the sequenced input is the durable record, and the in-memory state is rebuilt from it.
- **Isolation is the reliability feature.** Robinhood sharded the whole stack, not only the database, so that failures "are now limited to one shard" and features roll out a shard at a time. That is the cell pattern ([Cells and Shuffle Sharding](/books/hosting-and-cloud/regions-zones-and-cells#cells-and-shuffle-sharding)).
- **Rewrites are strangled, not cut over.** Kraken's endpoint-by-endpoint migration behind a shared test suite is the playbook's [Strangle Instead of Rewriting](/docs/architecture/replacing-systems#strangle-instead-of-rewriting), applied to a live exchange.

## The Services

A service owns its tables, its vocabulary and its invariants, and others reach it only through its interface and events ([Every Piece of Data Has One Owner](/docs/architecture/service-boundaries#every-piece-of-data-has-one-owner)). The volume's tables fall into these:

| Service | Owns (tables from this volume) | Invariant it guards | Chapters |
| --- | --- | --- | --- |
| **Parties and accounts** | `parties`, `party_identities`, `accounts`, `account_parties`, `capability_approvals`, `investment_profiles` | One verified party per role; every account at exactly one legal entity | [Opening Accounts](/books/investing-and-digital-assets/opening-accounts#how-to-build-it) |
| **Posting and the ledger** | `journal_entries`, `journal_lines`, `positions`, `balance_holds`, `buying_power_snapshots` | Every entry balances per instrument; positions equal their lines; nothing negative without credit | [Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions#how-to-build-it) |
| **Orders and risk** | `orders`, `order_events`, `order_legs`, `risk_limits`, `pretrade_checks`, `routing_decisions` | No order leaves without its checks; every state change recorded | [Orders & Order Types](/books/investing-and-digital-assets/orders-and-order-types#how-to-build-it), [Pre-Trade Risk, Halts & Volatility](/books/investing-and-digital-assets/pre-trade-risk-and-halts#how-to-build-it) |
| **Matching** (a venue only) | `trading_pairs`, `market_modes`, `matching_inputs`, `book_snapshots` | The book is a pure function of the sequenced inputs | [Order Books & Matching Engines](/books/investing-and-digital-assets/order-books-and-matching#how-to-build-it) |
| **Market data** | `quotes`, `candles`, `market_data_entitlements` | Snapshot then increments, gaps detected by sequence | [Market Data](/books/investing-and-digital-assets/market-data#how-to-build-it) |
| **Transfers** | `transfers`, `acats_transfers`, `instant_deposit_credits`, `withdrawal_requests`, `withdrawal_checks` | Nothing leaves before its checks; every rail item posted once | [Funding & Account Transfers](/books/investing-and-digital-assets/funding-and-transfers#how-to-build-it), [Deposits & Withdrawals](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#how-to-build-it) |
| **Chain and custody** | `chains`, `asset_networks`, `onchain_transactions`, `wallets`, `addresses`, `ingest_cursors`, `signing_requests` | Credit only at the chain's finality rule; sign only what the policy allows | [Chain Data & Indexing](/books/investing-and-digital-assets/chain-data-and-indexing#how-to-build-it), [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing) |
| **Clearing and settlement** | `settlements`, `clearing_submissions`, `cns_positions`, `settlement_fails` | Every trade has one settlement obligation, matched to the clearing house's | [Clearing & Settlement](/books/investing-and-digital-assets/clearing-and-settlement#how-to-build-it) |
| **Lots, statements and tax** | `tax_lots`, `lot_closings`, `trade_confirmations`, `account_statements`, `tax_documents` | Lots sum to positions; what was sent stays as sent | [Cost Basis, Tax Lots & Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots#how-to-build-it), [Confirms, Statements & Tax Forms](/books/investing-and-digital-assets/statements-and-tax-forms#how-to-build-it) |
| **Reconciliation** | `reconciliations`, `recon_breaks`, `ledger_wallet_proofs`, `invariant_checks` | The ledger agrees with every outside record, daily or faster | [Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets#treasury-reconciliation), this chapter |
| **Compliance and surveillance** | `cases`, `surveillance_alerts`, `kyt_screenings`, `cat_submissions` | Every clock stored at notice; every alert worked to an outcome | [Market Surveillance & Manipulation](/books/investing-and-digital-assets/market-surveillance#how-to-build-it), [Books, Records & the Audit Trail](/books/investing-and-digital-assets/books-records-and-cat#how-to-build-it) |

![The services of a trading platform in three bands. Channels at the top, drawn as outside callers: apps and web, partner APIs, FIX sessions and the support console, sending authenticated, keyed commands down to the domain services, each owning its tables: accounts, OMS and risk, transfers, chain watchers and market data. Accounts, OMS and risk, transfers and chain watchers join into the accented posting service, the one writer of entries, holds and the outbox; market data does not write to the ledger. The posting service sends events down to its consumers, each with its own store: statements and tax, reconciliation, surveillance, clearing and metrics, which replay by sequence.](/diagrams/ida-platform-services.svg "Every write to customer money or assets goes through one posting service; everything downstream reads its events. Robinhood's shards, Alpaca's OMS and the exchanges' balance services all have this shape at different scales.")

The dependency that matters runs one way: every service that changes what a customer owns asks the posting service to do it, and nothing writes balances directly. The matching engine emits fills, the chain watcher emits final deposits, the withdrawal pipeline emits holds and broadcasts, the fee engine emits fees, corporate actions emit entitlements, and each becomes one balanced journal entry keyed by its source ([The Components](/books/investing-and-digital-assets/crypto-exchange-architecture#the-components)). My default is the playbook's: one deployable with these services as modules that own their tables, split out only when a team or a scaling profile demands it ([Start With a Modular Monolith](/docs/architecture/service-boundaries#start-with-a-modular-monolith)). The matching engine is the first thing that earns its own process, because its latency and determinism rules are unlike anything else's; the market data fan-out is the second, because its load is per viewer rather than per account ([Fan-Out to Millions of Clients](/books/investing-and-digital-assets/market-data#fan-out-to-millions-of-clients)).

Three boundaries teams get wrong:

- **The OMS is not the ledger.** An order reserves buying power with a hold; a fill posts an entry. A broker that lets the OMS decrement a balance column directly has two writers to the same money, and the first busy morning shows the difference.
- **The venue is not the broker.** A crypto exchange runs both a matching engine (a venue) and a brokerage front door (simple buys priced from a quote), and a broker routes to venues it doesn't own. The engine's sequenced log is the venue's record; the broker's order and its fills are the customer's record. They join on execution IDs, never by sharing tables ([The Two Front Doors](/books/investing-and-digital-assets/crypto-exchange-architecture#the-two-front-doors)).
- **Firm-level state is not account state.** The clearing fund deposit, the hot wallet balance, the firm's net exposure in a meme stock and the omnibus position at DTC belong to a legal entity, not to an account, and they don't shard the way accounts do (below).

## Sharding by Account

Robinhood's write-up is the clearest public account of the move every growing broker makes: one database and a stateless app tier, then vertical scaling with diminishing returns, then shards. The design choices it describes, generalized:

- **Shard by account, assign by record.** An account is mapped to a shard by a stored mapping, not a hash of its ID, so accounts can be moved (to rebalance, to isolate a heavy institutional account, or to put an entity's accounts in a region) without rehashing everyone. The mapping is cacheable because it changes rarely, and a move is a migration with a freeze, not a config edit.
- **Route at the edge.** A routing layer resolves request to account to shard; Robinhood's first version called a mapping service synchronously on each request. A request that names no account (a symbol page, a news feed) goes to an unsharded read service.
- **Fan out for the firm's questions.** Support, compliance and reporting ask questions across accounts. Robinhood's aggregation layer fans the query to every shard and merges, with a cursor that records each shard's position, which is fine for a support console and wrong for a regulatory report: those read the warehouse, fed by change data capture from every shard ([Nobody Queries the Primary](/docs/data/separating-production-and-analytics#nobody-queries-the-primary)).
- **Every shard hears every event, keeps its own.** A corporate action, a halt, a price or a rule change applies to all accounts; Robinhood had each shard consume the whole stream and filter, with per-shard topics where volume made that too expensive.
- **Roll out by shard.** A release, a migration or a new feature goes to one shard first. Robinhood names this as a reliability gain in itself.

What refuses to shard by account is the firm's side of every entry. A fill debits a customer and credits the firm's settlement account; a withdrawal credits the omnibus wallet line; a fee credits fee income. Those firm accounts are touched by every shard, which makes them hot in exactly the sense of [Hot Accounts](/books/payments/architecture-at-scale#hot-accounts): they take no balance check, so post them without a lock, as a per-shard subtotal summed by a separate job, and reconcile the sum. The firm-level controls that do need a check (the clearing fund forecast, the hot wallet's floor and ceiling, a symbol's position limit across all customers during a restriction) are computed by a risk service from the events of every shard, a few seconds behind, and enforced as limits the shards read ([Clearing Deposits and the January 2021 Restrictions](/books/investing-and-digital-assets/pre-trade-risk-and-halts#clearing-deposits-and-the-january-2021-restrictions)).

## Sequencing and the Event Log

An account shard is a small exchange: many inputs arrive concurrently (an order, a cancel, a fill from a venue, a deposit, a corporate action, a margin call), and the result depends on their order. Alpaca's answer is to give each account an owner and a log: the node responsible for an account applies its inputs one at a time, writes them to the log, and on restart hydrates from the database and replays the log from its last offsets. The venue version is the same rule at microseconds ([Determinism and Sequencers](/books/investing-and-digital-assets/order-books-and-matching#determinism-and-sequencers)). What matters for a broker or exchange build:

- **Sequence per account, not globally.** Inputs for one account get a gapless sequence number from the account's owner; inputs for different accounts don't need a common order. A global sequence is a single point of failure and a throughput ceiling the platform doesn't need outside the matching engine.
- **Commands, then facts.** "Hold $5,000 for this order", "post this fill", "credit this deposit" are commands. The posting service is the only place a command becomes a fact (`order.accepted`, `execution.posted`, `deposit.credited`), validated against the account's status, capabilities and position ([Commands vs Events](/docs/architecture/events#commands-vs-events)).
- **The fact commits with the entry.** The event goes to the playbook's `outbox_events` in the same transaction as the journal entry and the hold, and a relay publishes it ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)). A fill whose event was lost is a trade that the lot engine, the confirm, the CAT report and the customer's notification never hear about.
- **Consumers resume by sequence.** Every consumer stores the last sequence it applied per account and ignores anything at or below it; a gap means wait or fetch, never skip ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)). This is how statements, tax lots, surveillance and the metrics pipeline replay after an outage without double counting.
- **The input record outlives the process.** `sequencer_inputs` (below) is the durable copy of what each account's owner applied, in order, with the source's identity. When a customer disputes what happened to an order during a bad morning, that table and the order's events are the answer.

The cost of a log is that it must be replayable, which means everything the processing reads must come in on the input: a price, a rule version, a halt, a time. A buying power check that reads "now" and the latest margin rate from a cache gives a different answer on replay; one that reads the mark and the rule version carried in the input gives the same answer, every time.

## Idempotency at Every Boundary

Every boundary a trade or a transfer crosses is crossed by retries: a phone that resends, a FIX session that resends after a reconnect, a venue that delivers an execution report twice, a chain node that reports the same block again after a reorg, a clearing file delivered twice, a webhook replayed. The rule is the playbook's: every write that crosses a boundary carries a key, and the receiver stores the key with the result ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)). The work is choosing keys that are stable across retries and distinct across real repeats:

| Boundary | Key | Where it's enforced | Chapter |
| --- | --- | --- | --- |
| A customer's order | The client's `client_order_id`, generated before the first attempt | `orders (account_id, client_order_id)` | [Idempotency for Orders](/books/investing-and-digital-assets/orders-and-order-types#idempotency-for-orders) |
| An order sent to a venue | `ClOrdID`, unique on the FIX session, reused on resend | `order_legs`, `fix_sessions` | [FIX Basics](/books/investing-and-digital-assets/orders-and-order-types#fix-basics) |
| A fill from a venue | The venue and its execution ID | `executions (venue_id, venue_exec_ref)` | [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) |
| A matching engine input | Trading pair and engine sequence | `matching_inputs (trading_pair_id, seq)` | [Order Books & Matching Engines](/books/investing-and-digital-assets/order-books-and-matching#how-to-build-it) |
| An on-chain deposit | Chain, transaction hash and log index (or output index) | `transfers`, `deposit_credits` | [Crediting and Reorgs](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#crediting-and-reorgs) |
| A withdrawal | The customer's request key; the transaction is replaced, never re-signed as a new payment | `transfers.idempotency_key`, `withdrawal_transactions`, `nonce_reservations` | [Nonce Management](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#nonce-management) |
| An ACATS transfer | The transfer's control number from NSCC | `acats_transfers` | [ACATS Transfers](/books/investing-and-digital-assets/funding-and-transfers#acats-transfers) |
| A clearing or custodian file | The sender, file date and file identifier; the file's own totals checked first | `reconciliations`, `clearing_submissions` | [Clearing & Settlement](/books/investing-and-digital-assets/clearing-and-settlement#how-to-build-it) |
| A corporate action entitlement | The asset event and the account | `asset_event_entitlements` | [Corporate Actions & Asset Events](/books/investing-and-digital-assets/corporate-actions#how-to-build-it) |
| A journal entry from any source | The source's key, scoped to the legal entity | `journal_entries (legal_entity_id, idempotency_key)` | [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) |

Two specifics:

- **Two identical orders can both be real.** A customer who buys 10 shares twice in a minute may mean it; two submissions with the same `client_order_id` are one order. The key is the client's identity for the intent, never a hash of the order's content.
- **The withdrawal key survives replacement.** A stuck transaction is replaced with a higher fee under the same nonce, so at most one of the pair can land; a worker that treats a dropped transaction as failed and signs a new payment with a new nonce has made two payments for one withdrawal, and only the reconciliation will notice (worked numbers below).

## Operating Without a Close

Crypto venues never close, and US equities move to 23/5 on exchanges from December 6, 2026; Robinhood announced 24/7 trading of select US equities at its September 2026 summit without saying it was live in its third quarter release. What that does to the operating calendar (end of day at 8:00 pm, halts on a schedule, a weekend as the only full stop) is in [Operating a Broker That Never Closes](/books/investing-and-digital-assets/extended-and-overnight-trading#operating-a-broker-that-never-closes). What it does to the architecture:

- **No maintenance window.** Schema changes are expand-then-contract and online; deploys restart followers and then hand over leadership, as Coinbase describes for its engine; a migration that needs a freeze freezes one shard at a time.
- **Trade date is data, per instrument.** A crypto fill has no trade date to roll; an equity fill at 9:30 pm has tomorrow's. The posting service stamps each entry's `effective_date` from the instrument's session calendar at the time of the input, carried on the input so replay agrees.
- **Batch becomes incremental.** Day order expiry, margin calls, fees, statements and CAT files become computations over a closed trade date that run while the next one trades. A job that assumes no new inputs during its run is wrong the first night.
- **Degraded modes are designed, not improvised.** Cancel-only, close-only, read-only and withdrawals-paused are states the platform can enter per market, per asset or per shard, each with tested behavior and customer messaging ([Peak Days, Outages & Resilience](/books/investing-and-digital-assets/peak-days-and-outages#load-shedding-and-degraded-modes)).

## Multi-Entity Design

A large platform is many regulated companies: a broker-dealer that introduces, another that clears, an FCM, a crypto entity licensed state by state, an EU entity, a trust company ([Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses#which-registration-each-activity-needs)). Every account, wallet and journal entry already names its `legal_entity_id` in the core model. The architecture follows from that:

- **The entity is the hard boundary.** Each entity's customers, assets and books must be producible alone for its regulator, its auditor or its trustee. Row-level security keyed on the entity turns a forgotten filter into an error ([Enforce It in the Database](/docs/architecture/multi-tenancy#enforce-it-in-the-database)); a support agent's session is scoped to the entities they're licensed and trained to serve.
- **Entities map to infrastructure.** Which region, database cluster and shard set holds an entity's accounts is a row (`entity_partitions`, below), because data residency, a regulator's access rights or a wind-down can require one entity's data to move or stand alone. An EU entity's customers can live in an EU region while the US entities share another.
- **Crossing entities is a journal entry.** When a customer of a US broker-dealer buys crypto through an affiliated crypto entity, the cash moves from one entity's books to the other's in an intercompany entry with lines in both, never a shared balance. A sweep from a crypto entity's hot wallet into another entity's wallet is a transfer between entities, recorded as one.
- **The firm's own wallets and accounts carry a holder.** Customer and corporate assets are kept apart on chain and in the ledger (`wallets.holds` in [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture#how-to-build-it)), per entity.
- **Exits are designed in.** An entity that stops serving a market, sells a business line or fails needs every customer's balance and history from its records alone ([Conversions, Shutdowns & Distributions](/books/investing-and-digital-assets/conversions-and-shutdowns)).

## Invariants, Checked Continuously

A trading platform's records are checked by end-of-day processing, by clearing house and custodian reconciliations, by auditors, by examiners and, after a failure, by a trustee. Each finds problems later than they could have been found. The cheaper habit is to state the invariants and run them on a schedule, alerting on any result ([Invariants, Checked Continuously](/books/banking-and-lending/banking-architecture#invariants-checked-continuously) is the bank version):

| Invariant | Check | When |
| --- | --- | --- |
| Every entry balances per instrument | Sum of lines per entry and instrument = 0 | On write (constraint), and a nightly sweep |
| Positions equal their lines | `positions` rebuilt from `journal_lines` through `through_entry_id` | Hourly sample, nightly full |
| No customer below zero without credit | FTX check 1 in [How to Build It](/books/investing-and-digital-assets/exchange-collapses#how-to-build-it) | Every few minutes |
| Customer holdings covered per entity and instrument | FTX check 2: owed ≤ held at the latest reconciliations | Hourly for crypto, daily for securities |
| Nothing parked in suspense | FTX check 3: suspense lines older than two days | Hourly |
| Every wallet reconciled and recent | FTX check 4 | Hourly |
| The ledger matches each wallet at a block | `ledger_wallet_proofs.difference` = 0 ([How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture#how-to-build-it)) | Every block range, per hot wallet; daily for cold |
| The stock record balances | Every long position located at DTC, the clearing firm or a custodian ([The Stock Record](/books/investing-and-digital-assets/ledgers-and-positions#the-stock-record)) | Daily |
| Lots sum to positions | Open `tax_lots.remaining_quantity` per account and instrument = settled plus unsettled position | Nightly |
| Every account input processed once, in order | `sequencer_inputs` gapless per account; no source key applied twice | Continuously, per shard |
| Every firm-wallet outflow has an instruction | Each outbound on-chain transaction joins a withdrawal, a rebalance or a sweep ([Withdrawal Anomaly Detection](/books/investing-and-digital-assets/exchange-security#withdrawal-anomaly-detection)) | Every block |

Each run writes an `invariant_checks` row with its result, so "were the books right at 2:00 pm on March 14" is a query, and a failure opens work with an owner rather than a log line ([Alert Design](/docs/observability/dashboards-and-alerts#alert-design)). The FTX debtors couldn't produce that record; it is the cheapest evidence a platform can keep ([What Every Design Rule Is Guarding Against](/books/investing-and-digital-assets/exchange-collapses#what-every-design-rule-is-guarding-against)).

### Worked numbers: a ledger and chain mismatch

A hypothetical exchange of my own. Its ether hot wallet is checked every 50 blocks. At block 23,104,880 the proof reads, in ETH (the table stores wei):

| Line | ETH |
| --- | --- |
| Ledger omnibus lines for the wallet | 4,812.400 |
| Withdrawals posted on broadcast, not yet in a block | 31.250 |
| Deposits in a block, not yet final | 0.000 |
| Chain balance at the block, primary node | 4,841.700 |
| Chain balance at the block, second provider | 4,841.700 |

The chain should hold the ledger's omnibus plus what has been posted but hasn't left: 4,812.400 + 31.250 = 4,843.650 ETH. It holds 4,841.700. `difference` = 4,841.700 − 31.250 − 0 − 4,812.400 = −1.950 ETH, or −1,950,000,000,000,000,000 wei, and both sources agree, so it isn't a node problem. The check fails, writes `invariant_checks` with `difference` −1.95 ETH and opens a `recon_breaks` row.

The investigation is a join, not a hunt. Every outbound transaction from the wallet since the last passing proof is matched to an instruction: 214 transactions, 213 matched one to one, and one withdrawal of 1.950 ETH has two confirmed transactions, at nonces 88,412 and 88,431, both of kind `original`. The first had dropped out of the provider's mempool view under congestion; a worker marked it failed and built a new payment with a fresh nonce instead of replacing it under the old one, and both landed. The ledger posted one withdrawal; the chain paid two.

What the platform does, in order:

1. **Stop the path that caused it.** The anomaly rule (an outflow with no instruction of its own) sets `signing_frozen` on the worker's re-sign path while the hot wallet keeps serving through the normal one ([How to Build It](/books/investing-and-digital-assets/exchange-security#how-to-build-it)).
2. **Restore coverage the same day.** The 1.95 ETH is now short in customer coins: the coverage check fails for that entity and instrument until the firm moves 1.95 ETH from a corporate wallet into the omnibus with a firm-to-omnibus entry. Customer lines never move; the loss is the firm's ([Customer Reimbursement](/books/investing-and-digital-assets/exchange-security#customer-reimbursement)).
3. **Ask for it back, separately.** The customer who received twice owes 1.95 ETH; that is a receivable and a case, not a ledger correction to their balance after the fact.
4. **Fix the invariant behind the bug.** Every withdrawal may have at most one transaction of kind `original`; a second must be a `fee_bump` or `cancel` with the same nonce. That rule becomes a constraint and a new check.

Fifty blocks is about ten minutes on Ethereum; a nightly reconciliation would have found the same break up to a day later, after the worker had done it again for every stuck transaction in between.

## A Reference Architecture

Built yourself, as a broker, a crypto exchange or both, the system this volume describes is a short list of parts:

- **Channels and gateways.** Apps, partner APIs, FIX sessions and the support console, behind an edge that authenticates, rate limits and routes each request to its account's shard. None of them posts.
- **Account shards.** Each shard holds the accounts mapped to it: orders, holds, positions, the posting service and the outbox, in one transactional database per shard, so an order's hold, a fill's entry and their events commit together.
- **Firm services.** Risk aggregation across shards, the hot account subtotals, treasury and wallet management, and the clearing and custodian interfaces, consuming every shard's events.
- **Venue components,** for a firm that runs one: the sequencer and matching engine, its replicated log and snapshots, and the market data publisher.
- **Chain services.** Nodes or providers per chain, indexers and chain watchers with reorg handling, the signing service behind its policy engine ([Hosting & Cloud](/books/hosting-and-cloud/blockchain-nodes-and-validators) runs the nodes).
- **Rail and clearing gateways.** ACH and wires, ACATS, NSCC and DTC (directly or through a clearing firm), OCC, custodians, stablecoin issuers: each storing inbound files and messages under their identity before acting on them.
- **The warehouse.** Change data capture from every shard into an analytical store, which statements, tax forms, surveillance, regulatory reports and metrics read; nobody runs a report against a shard ([What Crosses the Boundary](/docs/data/separating-production-and-analytics#what-crosses-the-boundary-snapshots-or-events)).

What I buy rather than build, even when building the rest: identity verification, sanctions and blockchain analytics data, market data feeds, chain node infrastructure for long-tail chains, and, for a broker starting out, clearing and custody ([Brokerage as a Service](/books/investing-and-digital-assets/brokerage-as-a-service)).

## How to Build It

The playbook's `outbox_events` carries every event above, and the volume's existing tables carry the ledger, the orders and the chain. This chapter adds the per-account input log, the invariant results and the map from legal entities to infrastructure:

```sql
CREATE TABLE sequencer_inputs (            -- what each account's owner applied, in order
  account_id          UUID NOT NULL REFERENCES accounts (id),
  seq                 BIGINT NOT NULL,       -- gapless per account, assigned by the shard's owner
  kind                TEXT NOT NULL CHECK (kind IN ('order_new', 'order_cancel', 'order_replace',
                        'execution', 'transfer', 'deposit_final', 'asset_event', 'margin_call',
                        'hold_release', 'fee', 'mode_change')),
  source              TEXT NOT NULL,         -- 'client', 'venue:XNAS', 'chain:ethereum', 'nscc', ...
  source_key          TEXT NOT NULL,         -- client_order_id, venue exec ID, tx hash:log index, ...
  payload             JSONB NOT NULL,        -- the input as applied, with its mark and rule versions
  received_at         TIMESTAMPTZ NOT NULL,  -- time travels on the input; processing never reads a clock
  effective_date      DATE NOT NULL,         -- the instrument's trade date or business date at receipt
  journal_entry_id    UUID REFERENCES journal_entries (id),  -- set when it posted
  outcome             TEXT NOT NULL CHECK (outcome IN ('applied', 'rejected', 'duplicate')),
  PRIMARY KEY (account_id, seq),
  UNIQUE (account_id, source, source_key)
);

CREATE TABLE invariant_checks (            -- every continuous check, with its result
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID REFERENCES legal_entities (id),  -- null: platform-wide
  check_key           TEXT NOT NULL,         -- 'entry_balances', 'no_negative_without_credit',
                                             -- 'coverage', 'ledger_wallet_proof', 'stock_record', ...
  check_version       INT NOT NULL,          -- the query, in version control
  scope               JSONB NOT NULL DEFAULT '{}',  -- {"wallet_id": "..."}, {"shard": 7}, {"sample": 0.01}
  as_of               TIMESTAMPTZ NOT NULL,
  as_of_block         BIGINT,                -- chain checks name their block
  started_at          TIMESTAMPTZ NOT NULL,
  finished_at         TIMESTAMPTZ,
  rows_checked        BIGINT,
  exceptions          BIGINT NOT NULL DEFAULT 0,
  difference          NUMERIC(78, 0),        -- smallest units, where the check is a sum
  exceptions_ref      TEXT,                  -- the exception rows, as extracted
  recon_break_id      UUID REFERENCES recon_breaks (id),
  status              TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'error')),
  assigned_to         TEXT                   -- set when status is failed
);

CREATE TABLE entity_partitions (           -- where each legal entity's data lives
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  region              TEXT NOT NULL,         -- 'us-east', 'eu-central', ...
  database_cluster    TEXT NOT NULL,
  shard_ids           INT[] NOT NULL,        -- the shards that may hold its accounts
  residency_rule      TEXT,                  -- the law or license condition that pins it, if any
  valid_during        TSTZRANGE NOT NULL,    -- a move to new infrastructure is a new row
  EXCLUDE USING gist (legal_entity_id WITH =, valid_during WITH &&)
);

CREATE TABLE account_shards (              -- the durable mapping record behind the router's cache
  account_id          UUID PRIMARY KEY REFERENCES accounts (id),
  shard_id            INT NOT NULL,
  version             BIGINT NOT NULL DEFAULT 1,  -- bumped on a move; caches compare it
  moved_at            TIMESTAMPTZ
);
```

The routing decision reads the mapping record and never a hash, so an account can move. The cache is safe because a move bumps the version and the shard refuses requests for accounts it no longer owns:

```go tab="Go"
type ShardRef struct {
	Shard   int
	Version int64
}

// ShardFor resolves an account to its shard from the cache, falling back to
// the durable mapping. A shard that no longer owns the account answers
// ErrMoved, and the caller drops the cache entry and retries once.
func (r *Router) ShardFor(ctx context.Context, accountID string) (ShardRef, error) {
	if ref, ok := r.cache.Get(accountID); ok {
		return ref, nil
	}
	ref, err := r.mappings.Lookup(ctx, accountID) // SELECT shard_id, version FROM account_shards
	if err != nil {
		return ShardRef{}, err
	}
	r.cache.Set(accountID, ref)
	return ref, nil
}
```

```rust tab="Rust"
#[derive(Clone, Copy)]
pub struct ShardRef {
    pub shard: i32,
    pub version: i64,
}

impl Router {
    /// Resolves an account to its shard from the cache, falling back to the
    /// durable mapping. A shard that no longer owns the account answers
    /// `Moved`, and the caller drops the cache entry and retries once.
    pub async fn shard_for(&self, account_id: &str) -> Result<ShardRef, Error> {
        if let Some(r) = self.cache.get(account_id) {
            return Ok(r);
        }
        let r = self.mappings.lookup(account_id).await?; // SELECT shard_id, version FROM account_shards
        self.cache.insert(account_id.to_owned(), r);
        Ok(r)
    }
}
```

The gap check over the input log, per shard; any row is a failed `invariant_checks` run:

```sql
SELECT account_id, seq AS after_seq, next_seq
FROM (
  SELECT account_id, seq,
         LEAD(seq) OVER (PARTITION BY account_id ORDER BY seq) AS next_seq
  FROM sequencer_inputs
  WHERE account_id IN (SELECT account_id FROM account_shards WHERE shard_id = :shard)
    AND received_at > NOW() - INTERVAL '1 hour'
) t
WHERE next_seq IS NOT NULL AND next_seq <> seq + 1;
```

The one-original-per-withdrawal rule from the worked numbers, as a constraint on the table [Deposits & Withdrawals](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#how-to-build-it) defines:

```sql
CREATE UNIQUE INDEX one_original_per_batch
  ON withdrawal_transactions (batch_id)
  WHERE kind = 'original';   -- a second payment must be a fee_bump or cancel on the same nonce
```

Design notes:

- **The input carries everything replay needs.** Marks, rule versions, session and halt state go into `payload`; a processor that reads a clock or a cache gives a different answer on replay.
- **Source keys are unique per account.** `UNIQUE (account_id, source, source_key)` is the idempotency guard for every input kind at once; a duplicate is recorded with outcome `duplicate`, not silently dropped, so a venue resending fills is visible.
- **Invariant checks are versioned code.** `check_version` points at the query in version control, so a result can be reproduced against the data as it was, and a changed check is a new version, not an edit.
- **Every new table carries the entity or reaches it.** `invariant_checks.legal_entity_id` and the account foreign keys put these rows under the same row-level security as the rest.
- **Events:** `invariant.failed` through the outbox pages the owner of the check; for coverage and ledger wallet proofs it also freezes outbound transfers for the affected entity and instrument until a person clears it.

## Auditing

The records in this chapter are what an examiner, an auditor, a clearing house, a court or a trustee asks for when something went wrong between systems:

- **What each account's owner applied, and in what order.** The input log with source keys and outcomes, so a disputed morning can be replayed and shown ([Producing Records](/docs/building-blocks/audit-trails#producing-records)).
- **That the books agreed, continuously.** Every invariant check with its version, scope, block or time, result and, for each failure, who worked it and how it was resolved.
- **Where each entity's data lived.** The entity partition history and every account move between shards, with when and why.
- **That events matched state.** The outbox and consumers' applied sequences, so a gap between a fill and a confirm, a tax lot or a CAT report can be traced to where it opened.
- **Who could reach what.** Session scopes by entity, and every change to a routing rule, a shard assignment or an invariant's version, with its approver ([Log Access, Not Just Changes](/docs/building-blocks/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Give each table one owning service,** and make the posting service the only writer of entries, holds and positions.
- **Shard by account with a stored mapping,** route at the edge, fan out only for support, and send firm-wide questions to the warehouse.
- **Treat the firm's side of every entry as hot:** post it without locks as per-shard subtotals and reconcile the sum.
- **Sequence inputs per account,** carry everything replay needs on the input, and resume every consumer by sequence.
- **Key every boundary by the source's own identity,** and replace stuck chain transactions instead of paying twice.
- **Design for no close:** online migrations, follower-first deploys, trade dates from session calendars and degraded modes with tested behavior.
- **Put the legal entity above everything,** map it to infrastructure as data, and cross entities only by journal entry.
- **State the invariants and run them continuously,** with results as rows; a ledger and chain mismatch should be found in minutes, by a join.

## References

**In practice**

- [Robinhood: How we scaled Robinhood's brokerage system for greater reliability (June 25, 2021)](https://robinhood.com/newsroom/how-we-scaled-robinhoods-brokerage-system-for-greater-reliability), the single database, the options evaluated, application-level shards with their own servers, database and pipeline, mapping records, the routing and aggregation layers, Kafka per shard, shard counts and peak requests per second
- [Robinhood: Scaling Robinhood crypto systems (September 9, 2022)](https://robinhood.com/newsroom/scaling-robinhood-crypto-systems/), query audits, read-path caching only, load testing, throttling, whole-stack sharding and the extracted settlement component
- [Alpaca: Alpaca launches next-gen order management system (November 22, 2021)](https://alpaca.markets/blog/alpaca-launches-next-gen-order-management-system/), the v0, v1 and v2 designs, in-memory account state, the Redpanda write-ahead log, hydration and replay, balancers and latency figures
- [Kraken: Oxidizing Kraken, improving Kraken infrastructure using Rust (February 19, 2021)](https://blog.kraken.com/product/engineering/oxidizing-kraken-improving-kraken-infrastructure-using-rust), the endpoint-by-endpoint migration, the shared integration test suite, lines of Rust and throughput per instance
- [InfoQ: Coinbase AWS failure postmortem (June 16, 2026)](https://infoq.com/news/2026/06/coinbase-aws-failure-postmortem), the five-node Raft cluster in one placement group, the quorum loss, the recovery through cancel-only and auction modes, and the remediations
- [Robinhood Markets: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000164/q32026robinhoodexhibit991.htm), 24/7 trading of select US equities announced at the September 2026 summit
