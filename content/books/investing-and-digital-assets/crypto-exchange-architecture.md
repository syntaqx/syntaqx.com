+++
title = "How a Crypto Exchange Works"
nav_title = "How an Exchange Works"
description = "The parts of a crypto exchange: accounts, the internal ledger, omnibus wallets, matching, chain watchers, risk and fiat rails, and US vs offshore structures."
category = "Investing & Digital Assets Industry"
order = 2542
part = "Crypto Exchanges"
tags = ["crypto", "exchanges", "ledger", "custody", "matching-engine", "architecture"]
+++

A crypto exchange is two ledgers that have to agree. One is the chain: public, slow by exchange standards, final after some number of blocks, and indifferent to who the exchange's customers are. The other is the exchange's own books, where every customer's balance lives and where almost every trade happens. A customer who buys bitcoin on an exchange doesn't receive a transaction on the Bitcoin network. Their line in the exchange's ledger goes up, a seller's line goes down, and the coins stay where they were, in wallets the exchange controls and the customers share. The chain sees the exchange only when money crosses its edge: a deposit, a withdrawal, a sweep from a deposit address, a move between hot and cold storage.

That design is why exchanges are fast and cheap, and it's also why they fail the way they do. Every collapse in this industry, from Mt. Gox to FTX, ends at the same place: the books said customers owned coins the wallets didn't hold. This chapter covers the components of an exchange and how they connect, the internal ledger against the chain and the invariant that joins them, omnibus custody and what makes it lawful, the two front doors (the simple buy and the order book), how US and offshore exchanges are structured, and what Coinbase, Kraken, Gemini, Binance and others publish about their own. The chain side of money in and out is [Deposits & Withdrawals](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals); the wallet tiers are [Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets); what the exchange chooses to support is [Listing & Delisting Assets](/books/investing-and-digital-assets/listing-assets); and what it sells on top is [Crypto Trading Products](/books/investing-and-digital-assets/crypto-trading-products).

## How the Platforms Do It

What the large venues disclose about their own structure, as of November 2026. Filings and regulator records carry most of it; the rest is each company's own pages.

| Exchange | Public status | Entities and licenses that carry customers | Custody model, as disclosed | Engineering on the record |
| --- | --- | --- | --- | --- |
| **Binance** | Private | Binance.com serves non-US customers; the US is served by a separate company, Binance.US. Pleaded guilty in November 2023 to unlicensed money transmission, BSA and sanctions charges; CFTC found it served US persons with derivatives from July 2019 without registering | Proof of reserves from a Merkle tree of hashed user IDs and balances, with a zk-SNARK proving each net balance is non-negative | Public futures rules, including the auto-deleveraging ranking |
| **Coinbase** | Nasdaq (COIN) | Coinbase, Inc. (state money transmitter licenses and a New York BitLicense); Coinbase Custody Trust Company (a New York limited purpose trust company); Coinbase Capital Markets (broker-dealer); Coinbase Luxembourg (MiCA license for custody and trading across the EEA); Coinbase International Exchange (Bermuda, Class F digital asset business license, perpetual futures for non-US customers); Deribit (acquired August 14, 2025) | Trading entities hold customer crypto "in an omnibus manner on the blockchain and separately recorded using a ledger system"; custody entities hold it "separately in dedicated addresses"; no more than 2% of custodied assets in hot wallets | Matching engine as a five-node Raft cluster with a single-threaded core; a May 7, 2026 outage when three of the five nodes failed together |
| **Gemini** | Nasdaq (GEMI) | Subsidiaries regulated by NYDFS, FINRA and the CFTC; Gemini Titan, LLC holds a designated contract market license for prediction markets | Customer custodial funds of $454.7 million in segregated bank accounts at June 30, 2026; address allowlisting for withdrawals | SOC 1 Type 2 and SOC 2 Type 2 reports |
| **Kraken** (Payward) | Private; no public S-1 | Its fee schedule says that for US, Canadian and New Zealand customers "futures are not available or do not apply to cross-platform tier qualification"; SEC staking settlement (2023) bound Payward Ventures and Payward Trading | Cold storage and hot wallets, no split published; proof of reserves from a Merkle tree built by an independent accountant | Backend rewritten from PHP to Rust from 2018, endpoint by endpoint behind a shared test suite |
| **OKX** | Private | Non-US exchange | Proof of reserves with a zk-STARK and signed address-ownership messages; $33.87 billion across 21 assets in its 49th report | Open-source verifier |
| **Robinhood Crypto** | Part of Robinhood (HOOD) | Robinhood Crypto, LLC; acquired Bitstamp in June 2025 | Routes customer orders as agent to third-party market makers (rebate in the spread) or exchange liquidity providers (a percentage fee, no rebate); settles with liquidity providers net once per business day | Order routing disclosures with the rebate per $100 of volume |

Three patterns run through the table. **One brand, many entities:** Coinbase's US spot business, its custody trust, its broker-dealer, its EU entity and its Bermuda derivatives venue are separate legal persons with separate licenses, separate customers and separate books, and an account belongs to exactly one of them. **Two custody models under one roof:** a trading entity holds omnibus wallets with a per-customer ledger, and a custody entity holds segregated addresses per client; Coinbase discloses both, and the spot bitcoin ETFs it custodies use both at once (below). **The ledger is the product:** Coinbase's 10-K says it plainly, "customer cash and crypto asset balances are maintained through our internal ledgering processes." The chain holds coins; only the exchange's ledger says whose they are.

## The Components

An exchange is a set of services around two pieces of state, the ledger and the order book. Each component below has an owner, a failure mode and a chapter of its own.

| Component | What it does | Fails how | Covered in |
| --- | --- | --- | --- |
| **Accounts and identity** | KYC, the account's legal entity and jurisdiction, capabilities (spot, staking, derivatives) | An account served by the wrong entity, or an unverified user trading | [Opening Accounts](/books/investing-and-digital-assets/opening-accounts); the Banking & Lending volume's [KYC & Account Opening](/books/banking-and-lending/kyc-and-account-opening) |
| **Internal ledger** | Double-entry balances in every asset, the source of truth for what customers own | Balances that don't match wallets; negative balances nobody approved | This chapter; [Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions) |
| **Matching engine** | Price-time priority order book per market, deterministic and replicated | Quorum loss, a stalled market, a bad fill | [Order Books & Matching Engines](/books/investing-and-digital-assets/order-books-and-matching) |
| **Order management and brokerage** | Simple buys, converts and recurring buys priced from a quote; routing to the book or to liquidity providers | A stale quote, a spread nobody disclosed | [Crypto Trading Products](/books/investing-and-digital-assets/crypto-trading-products) |
| **Market data** | Order book feeds, trades, candles, fan-out | Gaps a client can't detect | [Market Data](/books/investing-and-digital-assets/market-data) |
| **Chain watchers** | Read each supported chain, track deposits and sent transactions to finality, follow reorgs | A credited deposit on an orphaned block | [Deposits & Withdrawals](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals); the Hosting & Cloud volume's [Blockchain Nodes, RPC & Validators](/books/hosting-and-cloud/blockchain-nodes-and-validators) |
| **Wallets and signing** | Deposit addresses, hot, warm and cold wallets, key custody and the signing policy | A stolen hot wallet, a blind-signed cold transfer | [Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets); [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing) |
| **Risk** | Pre-trade checks, withdrawal risk scoring, account takeover defenses, margin | A drained account, an unhedged position | [Pre-Trade Risk, Halts & Volatility](/books/investing-and-digital-assets/pre-trade-risk-and-halts#crypto-venues); [Account Security & Fraud](/books/investing-and-digital-assets/account-security) |
| **Compliance** | Sanctions and wallet screening, transaction monitoring, the Travel Rule, listing governance | Sanctioned counterparties, missing Travel Rule data | [AML & the Travel Rule for Crypto](/books/investing-and-digital-assets/crypto-aml-and-travel-rule); [Listing & Delisting Assets](/books/investing-and-digital-assets/listing-assets) |
| **Fiat rails** | ACH, wires, cards and stablecoin ramps into the customer's dollar balance | Returns after the coins are gone | [Funding & Account Transfers](/books/investing-and-digital-assets/funding-and-transfers); the Payments volume's [ACH](/books/payments/ach) |
| **Treasury** | Rebalancing between wallets and chains, gas floats, corporate versus customer holdings, reconciliation | Customer assets used for the firm | [Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets) |

The dependency that matters most runs one way: every other component writes to the ledger through one posting service, and nothing writes balances directly. The matching engine emits fills, the chain watcher emits confirmed deposits, the withdrawal pipeline emits holds and broadcasts, the fee engine emits fees, and the ledger turns each into a balanced journal entry keyed by its source event, so a replay posts nothing twice ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)). How those services are cut and sequenced at scale is [Trading Platform Architecture](/books/investing-and-digital-assets/trading-platform-architecture); this chapter stays with what each one owes the ledger.

## The Internal Ledger and the Chain

### What happens on chain and what doesn't

A trade between two customers of the same exchange never touches a chain. What does:

- **Deposits.** A customer sends coins to an address the exchange assigned them. The chain watcher sees it, waits for the chain's finality rule, and the ledger credits the customer.
- **Withdrawals.** The exchange holds the customer's balance while it checks the request, the withdrawal pipeline signs a transaction from a hot wallet, and the ledger posts the withdrawal when the transaction is broadcast.
- **Sweeps.** Coins at per-customer deposit addresses move to a shared hot or omnibus wallet. The customer's balance doesn't change; the asset side of the ledger moves between wallets and pays a network fee.
- **Rebalancing.** Hot to cold and cold to hot, and between chains. Again no customer balance changes.
- **Settlement with outside parties:** liquidity providers, OTC counterparties, other exchanges, custodians.

Everything else, which is nearly all activity by count, is internal. Coinbase's third quarter 2026 deck reported $134.5 billion of crypto spot volume and $963 billion of crypto derivatives volume; none of that spot volume was a chain transaction until someone withdrew, and the derivatives volume never touches a chain as such.

### One invariant

The two ledgers are joined by one invariant, per asset, at a block height:

> what the exchange's customer-asset wallets hold on chain, plus coins in transit, is at least what the ledger says customers own.

Customer-asset wallets are the deposit, hot, warm, cold and omnibus wallets that hold customer coins, not the firm's corporate treasury. In transit means withdrawals the ledger has already posted (it posts on broadcast) whose transactions aren't yet in a block at that height, so the coins still show in the wallet, and deposits in a block but not yet final, which are on chain but not yet owed. A ledger that can't compute this number on demand, per asset, at a stated block, can't prove it's solvent to itself, let alone to a regulator. New York's custody guidance asks for exactly that: a custodian must be ready to "demonstrate reconciliation between the VCE's books and records and on-chain activity" when the Department asks. The public version of the same check is [Proof of Reserves & Liabilities](/books/investing-and-digital-assets/proof-of-reserves), where an exchange publishes the liability side as a Merkle-sum tree and proves control of the asset side.

The invariant also says what an exchange may never do: let a customer balance go below zero without a credit agreement, and let a firm account draw on customer wallets. FTX's control failures came down to both. The debtors' first interim report describes a customer-database field, `borrow`, that set how far an account could go negative before trading restrictions or auto-liquidation: zero for most retail accounts, up to $150 million for market makers, and $65 billion for Alameda. Two flags added in July 2019, `can_withdraw_below_borrow` and `allow_negative`, let Alameda withdraw while net negative and exempted it from liquidation; it was the only account with `allow_negative=true`, and there were no database logs showing when values changed. Every design rule in the How to Build It section below is a guard against a flag like that. The collapse as a whole is [FTX, Celsius & the 2022 Collapse](/books/investing-and-digital-assets/exchange-collapses).

### Worked numbers: one deposit, one trade, one withdrawal

Amounts in base units: bitcoin in satoshis (1 BTC = 100,000,000 sats), dollars in cents. Every journal entry balances per instrument.

**1. Ana deposits 0.5 BTC.** The transaction reaches the exchange's finality rule at Ana's deposit address, and the deposit posts against the wallet that holds it (the core model's omnibus line names the wallet).

| Ledger account | Instrument | Debit | Credit |
| --- | --- | --- | --- |
| Omnibus: Ana's deposit address wallet | BTC | 50,000,000 | |
| Customer: Ana (liability) | BTC | | 50,000,000 |

**2. Ana buys 0.1 BTC from Ben on the order book at $100,000.** Ana takes liquidity at a 0.60% taker fee; Ben's resting order pays a 0.40% maker fee. Both fees are in the quote currency.

| Ledger account | Instrument | Debit | Credit |
| --- | --- | --- | --- |
| Customer: Ana | USD | 1,006,000 | |
| Customer: Ben | USD | | 996,000 |
| Fees: trading | USD | | 10,000 |
| Customer: Ben | BTC | 10,000,000 | |
| Customer: Ana | BTC | | 10,000,000 |

Ana pays $10,000 plus $60; Ben receives $10,000 less $40; the exchange earns $100. The dollar lines balance (1,006,000 = 996,000 + 10,000) and so do the bitcoin lines, and no wallet moved.

**3. Ana withdraws 0.1 BTC.** The exchange charges a withdrawal fee of 5,000 sats and the network fee it actually pays is 2,000 sats.

| Ledger account | Instrument | Debit | Credit |
| --- | --- | --- | --- |
| Customer: Ana | BTC | 10,005,000 | |
| Omnibus: hot wallet | BTC | | 10,002,000 |
| Fees: withdrawal | BTC | | 5,000 |
| Firm: network fee expense | BTC | 2,000 | |

Debits 10,007,000, credits 10,007,000. The hot wallet sent 0.1 BTC to Ana's address and 2,000 sats to the miner. Between the request and the broadcast, Ana's 10,005,000 sats are held: still her balance in the ledger, no longer available to trade or withdraw. The entry above posts when the signed transaction is broadcast, and a transaction that is later dropped gets a reversing entry. [Deposits & Withdrawals](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals) walks the states.

After all three, Ana's ledger holds 0.49995 BTC (0.5 + 0.1 − 0.10005, the withdrawal fee included), Ben holds whatever he had less 0.1 BTC, and the invariant still holds because every coin that left a wallet left a customer balance with it, plus the fee the firm paid from its own revenue.

## Omnibus Custody

### Why omnibus

Most exchange coins sit in wallets shared by many customers. Per-customer on-chain wallets would cost a sweep, a key and a fee per customer, would make hot-wallet limits impossible to manage, and on some chains would lock up a reserve per address (the XRP Ledger requires a reserve per account, which is why exchanges there use one address and a destination tag per customer). So the standard design is a deposit address per customer per chain for attribution, swept into shared wallets, with the ledger recording each customer's share.

### What makes it lawful

Omnibus is fine if the ledger carries the ownership and the firm never mixes or uses customer coins. New York's updated custody guidance of September 30, 2025, which replaced the January 2023 letter, says it most clearly for BitLicensees and New York trust companies:

- **Segregate** customer virtual currency from the custodian's and its affiliates' corporate assets, both on chain and in internal ledgers.
- **Omnibus wallets are allowed** in the custodian's name as agent or trustee, with a clear audit trail, documented policies and the ability to reconcile books with on-chain activity on request.
- **No debtor-creditor relationship.** Custody doesn't make the customer a lender to the firm, and customer assets can't be used for the custodian's own purposes, to secure or guarantee obligations, or to extend credit, absent the Department's approval.
- **Sub-custody is a material change** needing prior approval, with "F/B/O" titling and segregation required in the agreement.
- **Disclosure** of segregation, the customer's property interest and any sub-custody, acknowledged before the first transaction.

The 2023 letter added a detail that catches exchanges out: gas a firm advances for customers counts as customer funds for the guidance's purposes. The fee float in a deposit address is not the firm's money once it's there for a customer's transfer.

### Terms decide bankruptcy

The other half of lawful custody is the customer agreement. In Celsius's bankruptcy the court held on January 4, 2023 that the Earn program's terms of use "unambiguously" transferred title to the deposited coins to Celsius, so about $4.2 billion in roughly 600,000 Earn accounts was estate property and those customers were unsecured creditors; the record also showed Celsius hadn't segregated Earn assets from its custody program. Coinbase's 10-K takes the opposite position for its own platform: under UCC Article 8, financial assets it holds in the US for customers are "not property of Coinbase and not subject to claims of our general creditors," while warning that custodially held crypto "may be considered to be the property of a bankruptcy estate." The engineering point is that the terms, the ledger and the wallets have to tell one story. A terms page that says customers own their coins and a ledger that can't show which coins are theirs doesn't hold up. Accounting for those obligations changed with SAB 122 in January 2025, covered in [Accounting for Crypto & Treasury Companies](/books/investing-and-digital-assets/crypto-accounting#sab-121-and-sab-122).

### Two ledgers in one product: the ETF custody model

The spot bitcoin ETFs show both custody models working side by side. The iShares Bitcoin Trust's 10-K for 2025 describes a **Vault Balance** in segregated, Trust-only addresses with keys in cold storage, and a **Trading Balance** held omnibus at Coinbase, Inc. as prime execution agent, where the Trust has only a pro rata claim, swept back to the Vault daily; moving from Vault to Trading can take up to 24 hours. The segregated balance is provable on chain; the trading balance exists only in the prime broker's ledger. An exchange that serves institutions builds both, and [Qualified Custody](/books/investing-and-digital-assets/qualified-custody) and [Crypto ETPs](/books/investing-and-digital-assets/crypto-etps#the-custody-stack) take them further.

## The Two Front Doors

Customers reach the same liquidity through two very different products.

**The simple buy.** A customer asks to buy $500 of bitcoin. The platform quotes a price that includes a spread, the customer accepts, and the platform fills it, either from its own order book, from liquidity providers, or (for a pure broker) by routing to a market maker. The customer sees one price and one fee; the platform carries the execution. Coinbase charges consumers "through volume-based transaction fees and a spread" and reports itself as agent in transactions between customers, recognizing revenue net. Robinhood routes "all cryptocurrency transactions initiated by customers to third-party market makers or exchange liquidity providers" as agent; on market maker routing it earns a rebate included in the spread ($0.95 per $100 of volume as of June 15, 2026), and on exchange routing it charges a percentage fee instead. Gemini "includes a spread in the quoted price" for instant buys.

**The order book.** Advanced customers and API traders place limit and market orders on a central limit order book, pay maker and taker fees from a published schedule, and trade against each other. The exchange is the venue, not the counterparty. Coinbase's exchange connects over REST, FIX and WebSocket; Kraken Pro, Gemini ActiveTrader and Binance spot publish tiered maker/taker schedules.

The distinction decides how revenue is booked (spread revenue is earned inside a fill price, order book fees are a separate line), how best execution is argued (a simple buy needs a policy on where the platform sources its price), what the customer is told, and whether the platform holds inventory. The pricing, tiers and liquidity sourcing are in [Crypto Trading Products](/books/investing-and-digital-assets/crypto-trading-products); routing policy across venues is [Order Routing, PFOF & Best Execution](/books/investing-and-digital-assets/routing-and-best-execution).

## The Matching Engine, Briefly

The order book is the one component where latency and determinism decide the design, and Coinbase's is the best-documented in public. Frank Yu's QCon San Francisco 2025 talk (posted by InfoQ on April 23, 2026) describes a single-threaded matching core pinned to a CPU core, with Raft replicating the *input* log: an order is durable once a quorum of replicas has it, so there's no database in the hot path, and inputs are persisted asynchronously through EBS to S3 and Kafka. Five nodes rather than three survive two failures. Because the same inputs always produce the same outputs, the cluster can deploy one replica at a time, replay production logs in a debugger, and recover by replaying inputs from a snapshot taken on a follower. P99 response times stay under a millisecond, with spikes to six-figure transactions per second and about 300,000 a second as his red line for the single hot core. Cross-zone round trips add 3 to 4 milliseconds, so the replicas sit close together.

That last choice is the one that failed. On May 7, 2026, cooling units failed in one AWS data hall in us-east-1; the matching engine ran inside a single cluster placement group, three of its five nodes went down, and the cluster lost quorum. Recovery took emergency code changes and manual reconstruction, and trading came back gradually through cancel-only and auction modes. Kafka workloads stranded in the zone built backlogs, and engineers migrated partitions and rebalanced workloads by hand. Coinbase's remediations included automated cross-zone recovery for the engine. A design's benefit and its failure mode are both on the public record, which is rare, and the lesson generalizes: co-location for latency is a correlated failure domain, and **the trading modes you recover through (cancel-only, auction, normal) are part of the product**, not an operations detail. The engine in depth is [Order Books & Matching Engines](/books/investing-and-digital-assets/order-books-and-matching).

Kraken's public engineering is about the services around the book: its core backend moved from PHP to Rust from mid-2018, rewritten endpoint by endpoint behind a shared integration test suite run against both implementations, with about 500,000 lines of Rust and RPC servers handling about 150,000 requests a second per instance. That's the strangler pattern ([Replacing Systems](/docs/architecture/replacing-systems)) applied to an exchange that can't stop.

## US and Offshore Structures

Where an exchange is incorporated and licensed decides which products it may offer to whom, and the industry's largest enforcement cases are about getting that wrong.

- **US spot exchanges** register with FinCEN as money services businesses, hold state money transmitter licenses (or a trust charter) and in New York a BitLicense or limited purpose trust charter. Spot crypto that isn't a security has had no federal market regulator; derivatives need CFTC registration. Licensing in depth is [Licensing a Crypto Business](/books/investing-and-digital-assets/crypto-licensing).
- **Offshore affiliates** offer what US entities can't, most of all perpetual futures. Coinbase International Exchange is licensed in Bermuda and offers perpetuals to eligible non-US customers; Kraken's fee schedule carves US, Canadian and New Zealand customers out of its futures tiers.
- **Separate US companies** for brands that grew offshore: Binance.US is a different company from Binance.com, with its own registration and its own customers.

The control that makes the structure real is geofencing at onboarding and every session after it. The US Treasury's November 2023 action against Binance found it had processed over 1.67 million trades between US persons and sanctioned jurisdictions or blocked persons and had advised users to use VPNs to get around its geofencing; the CFTC found most US customers traded without identity verification and that "sub-accounts" were used to evade compliance. Penalties and forfeitures across DOJ, FinCEN, OFAC and the CFTC exceeded $4.3 billion. For an engineer the rule is that **the account's legal entity is assigned once, at onboarding, from verified residence, and every product check reads it**; an IP check at login is a signal, not a jurisdiction.

## How to Build It

These are deltas against the core data model in [The Investing & Digital Assets Business](/books/investing-and-digital-assets/investing-business#the-core-data-model): `legal_entities`, `accounts`, `instruments`, `chains`, `asset_networks`, `wallets` (with `purpose`, `owner_legal_entity_id` and `segregated_account_id`), `addresses`, `onchain_transactions`, `transfers`, `journal_lines` (whose omnibus lines name a wallet), `venues`, `orders`, `executions` and `reconciliations`. This chapter adds which entity may offer which product where, the markets the venue runs with their trading mode, and the per-wallet proof that the ledger's omnibus lines match the chain, which is the invariant above made into rows.

```sql
-- Which legal entity offers which product, in which jurisdiction, on what license.
CREATE TABLE product_offerings (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id  UUID NOT NULL REFERENCES legal_entities (id),
  product          TEXT NOT NULL CHECK (product IN ('simple_buy', 'convert', 'recurring_buy', 'spot_order_book',
                     'rfq_otc', 'custody', 'staking', 'perpetuals', 'dated_futures')),
  jurisdiction     TEXT NOT NULL,             -- ISO 3166 country or subdivision: 'US', 'US-NY', 'LU', 'BM'
  license_basis    TEXT NOT NULL,             -- 'BitLicense', 'MTL', 'MiCA CASP', 'BMA Class F', ...
  instrument_scope TEXT NOT NULL CHECK (instrument_scope IN ('all_listed', 'allowlist')),
  status           TEXT NOT NULL CHECK (status IN ('live', 'paused', 'withdrawn')),
  effective_from   DATE NOT NULL,
  effective_to     DATE,
  UNIQUE (legal_entity_id, product, jurisdiction, effective_from)
);

-- A market on a venue: base and quote, increments, and the current trading mode.
CREATE TABLE trading_pairs (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  venue_id            UUID NOT NULL REFERENCES venues (id),
  base_instrument_id  UUID NOT NULL REFERENCES instruments (id),
  quote_instrument_id UUID NOT NULL REFERENCES instruments (id),
  tick_size           NUMERIC(38, 18) NOT NULL,   -- price increment, quote per whole base unit
  lot_size            NUMERIC(78, 0) NOT NULL,    -- quantity increment, base units
  min_notional        BIGINT,                     -- quote minor units
  mode                TEXT NOT NULL CHECK (mode IN ('pre_open', 'auction', 'post_only', 'limit_only',
                        'normal', 'cancel_only', 'halted')),
  UNIQUE (venue_id, base_instrument_id, quote_instrument_id)
);

CREATE TABLE market_modes (                     -- append-only history of trading_pairs.mode
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  trading_pair_id UUID NOT NULL REFERENCES trading_pairs (id),
  mode            TEXT NOT NULL,
  reason          TEXT NOT NULL,                  -- 'listing', 'incident', 'delisting', 'chain_halt', ...
  set_by          UUID NOT NULL,                  -- the operator, under a runbook
  case_id         UUID REFERENCES cases (id),
  set_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per wallet and asset network at a block: the ledger's omnibus total against the chain's balance.
CREATE TABLE ledger_wallet_proofs (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  wallet_id             UUID NOT NULL REFERENCES wallets (id),
  asset_network_id      UUID NOT NULL REFERENCES asset_networks (id),
  block_number          BIGINT NOT NULL,
  block_hash            TEXT NOT NULL,
  ledger_omnibus        NUMERIC(78, 0) NOT NULL,  -- SUM(journal_lines.amount) for this wallet and instrument
  posted_not_in_block   NUMERIC(78, 0) NOT NULL,  -- withdrawals posted on broadcast, not yet in a block
  in_block_not_final    NUMERIC(78, 0) NOT NULL,  -- deposits on chain, not yet posted
  chain_balance         NUMERIC(78, 0) NOT NULL CHECK (chain_balance >= 0),
  second_source_balance NUMERIC(78, 0),           -- the same read from an independent node
  difference            NUMERIC(78, 0) GENERATED ALWAYS AS
                          (chain_balance - posted_not_in_block - in_block_not_final - ledger_omnibus) STORED,
  reconciliation_id     UUID REFERENCES reconciliations (id),
  observed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (wallet_id, asset_network_id, block_number)
);

-- Corporate treasury wallets are kept apart from customer wallets.
ALTER TABLE wallets ADD COLUMN holds TEXT NOT NULL DEFAULT 'customer' CHECK (holds IN ('customer', 'corporate'));

-- Every account's products are checked against its verified residence, not its IP.
ALTER TABLE accounts ADD COLUMN residence_jurisdiction TEXT NOT NULL;
```

Two checks run off these tables, and both page someone when they fail. **Per wallet:** `difference` in `ledger_wallet_proofs` is zero, meaning the chain holds exactly what the ledger's omnibus lines for that wallet say, after the two in-transit adjustments; a non-zero difference is a `recon_breaks` row. **Per instrument:** the core model's rule that customer lines, less firm lines, equal omnibus lines, summed over wallets with `holds = 'customer'` only, so firm treasury can't paper over a shortfall and customer coins can't fund the firm. Together they are the invariant: what customers are owed is in the ledger's omnibus lines, and what the omnibus lines say is on chain. The itemized daily version, with staked assets and coins at outside venues, is [Treasury Reconciliation](/books/investing-and-digital-assets/hot-and-cold-wallets#treasury-reconciliation).

Three rules make the tables mean something. **Balances never go negative by configuration.** The posting service rejects any entry that would take a customer's balance, less open holds, below zero; credit is a separate, documented facility with its own ledger accounts, limits and approvals, never a per-account number in a settings table, and every change to a limit is an audited record ([Make It Tamper-Evident](/docs/building-blocks/audit-trails#make-it-tamper-evident)). **Proofs are taken at a block, not "now".** Each row names the block and its hash, and reads the balance from two sources; a proof whose block is later reorged is retaken. **The entity check is one query.** Before any order or transfer, the account's `legal_entity_id` and `residence_jurisdiction` must match a `live` row in `product_offerings` for that product, and the instrument must be listed for that entity ([Listing & Delisting Assets](/books/investing-and-digital-assets/listing-assets#how-to-build-it)). A pair's mode gates order entry: `cancel_only` accepts only cancels, `post_only` rejects orders that would take liquidity, and `auction` collects orders without matching until the uncross.

## Auditing

A state examiner, an auditor or a bankruptcy examiner asks the same questions of an exchange, and the evidence is the records above:

- **Coverage per asset at a block,** daily and on demand: the ledger wallet proofs with block hashes and both sources, in-transit items listed, the per-instrument check, and every break with its resolution.
- **Entity and product mapping:** which entity carried each account on each date, the licenses behind each `product_offerings` row, and every account whose residence changed with what was done about its products.
- **Customer and corporate segregation:** the wallet inventory with `holds` per wallet, and proof no corporate obligation was secured by a customer wallet.
- **Credit and overrides:** every account allowed below zero, under which facility, approved by whom, with every limit change logged.
- **Trading modes:** every mode change, by whom, for what reason, under which incident case, so a halted or cancel-only period can be reconstructed.
- **Terms:** the customer agreement version each account accepted, since its custody language decides who owns the coins in a failure.

## What This Means for the System You Build

- **The ledger is the source of truth for ownership; the chain is the source of truth for holdings.** Build the check that compares them per asset at a block, and run it continuously.
- **One posting service,** keyed by source event, through which matching, deposits, withdrawals and fees all write.
- **No negative customer balances by configuration.** Credit is a facility with its own accounts and approvals, never a flag.
- **Customer and corporate wallets are separate,** on chain and in the ledger, and gas advanced for customers is customer money.
- **Omnibus with per-customer records,** under terms that say the customer owns the coins, consistent with what the ledger can prove.
- **The legal entity is assigned at onboarding from verified residence,** and every product check reads it.
- **Trading modes are product states** with an owner and a runbook, because recovery from an incident runs through cancel-only and auction.
- **Co-location is a correlated failure domain.** Know which components share one, and how quorum comes back when they fail together.

## References

**Regulators and guidance**

- [NYDFS: Updated Guidance on Custodial Structures for Customer Protection in the Event of Insolvency (September 30, 2025)](https://www.dfs.ny.gov/industry-guidance/industry-letters/il20250930-updated-guidance-custodial-structures), segregation on chain and in ledgers, omnibus wallets as agent or trustee, reconciliation on request, no debtor-creditor relationship or use of customer assets, sub-custody approval with F/B/O titling, disclosures
- [NYDFS: Guidance on Custodial Structures (January 23, 2023)](https://www.dfs.ny.gov/industry_guidance/industry_letters/il20230123_guidance_custodial_structures), the superseded letter and its footnote treating gas funded for customers as customer funds
- [US Treasury: Binance resolution (November 21, 2023)](https://home.treasury.gov/news/press-releases/jy1925), 1.67 million trades with sanctioned jurisdictions or blocked persons, no SARs filed, VPN advice around geofencing
- [CFTC: Binance and its CEO to pay $2.85 billion (Release 8825-23)](https://www.cftc.gov/PressRoom/PressReleases/8825-23), derivatives offered to US persons from July 2019 without registration, unverified US customers, sub-accounts, over $4.3 billion across agencies

**Filings**

- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), its entities and licenses, omnibus holding with a ledger for trading entities and dedicated addresses for custody entities, the 2% hot wallet target, internal ledgering of balances, UCC Article 8 and the bankruptcy risk factor, fees and spread, the Bermuda perpetuals approval
- [Coinbase Global: Form 10-K for 2025, revenue recognition note](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/R11.htm), agent in transactions between customers, revenue net
- [Coinbase Global: Q3 2026 earnings deck](https://www.sec.gov/Archives/edgar/data/0001679788/000167978826000121/q326earningsdeck_vsec.htm), third quarter 2026 crypto spot and derivatives volume
- [Gemini Space Station: Form 10-Q for Q2 2026](https://www.sec.gov/Archives/edgar/data/0002055592/000205559226000065/gemi-20260630.htm), customer custodial funds in segregated accounts, regulators, Gemini Titan's DCM license
- [Robinhood Markets: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000023/hood-20251231.htm), routing crypto orders as agent to market makers or exchange liquidity providers, net settlement once per business day, the Bitstamp acquisition
- [iShares Bitcoin Trust ETF: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1980994/000143774926006058/bit20251231_10k.htm), Vault Balance and Trading Balance, daily sweeps and the 24-hour move from vault to trading

**Courts and enforcement**

- [In re FTX Trading Ltd., First Interim Report of John J. Ray III on Control Failures (Doc. 1242-1)](https://storage.courtlistener.com/recap/gov.uscourts.deb.188450/gov.uscourts.deb.188450.1242.1.pdf), the `borrow` field, the $65 billion Alameda limit, `can_withdraw_below_borrow` and `allow_negative`, and no change logs
- [In re Celsius Network LLC, Memorandum Opinion on Earn account ownership (January 4, 2023)](https://www.nysb.uscourts.gov/sites/default/files/opinions/312902_1822_opinion.pdf), terms transferring title, about $4.2 billion in about 600,000 Earn accounts, and unsegregated assets
- [SEC: Kraken to discontinue staking-as-a-service (Release 2023-25)](https://www.sec.gov/newsroom/press-releases/2023-25), the Payward entities in the 2023 settlement

**Vendor documentation**

- [Binance: Proof of reserves](https://www.binance.com/en/proof-of-reserves), Merkle tree of hashed user IDs and a zk-SNARK proving non-negative balances
- [Coinbase Developer Platform: Exchange matching engine](https://docs.cdp.coinbase.com/exchange/docs/matching-engine), REST, FIX and WebSocket connectivity
- [Gemini: Security](https://www.gemini.com/security), SOC 1 Type 2 and SOC 2 Type 2 and withdrawal address allowlisting
- [Gemini: Fee schedule](https://www.gemini.com/fees/gemini-fee-schedule), a spread included in the quoted price for instant buys
- [Kraken: Fee schedule](https://www.kraken.com/features/fee-schedule), the futures footnote for US, Canadian and New Zealand customers
- [Kraken: Proof of reserves](https://www.kraken.com/proof-of-reserves), the accountant-built Merkle tree and signed address control
- [OKX: Proof of reserves](https://www.okx.com/proof-of-reserves), zk-STARK liabilities proof and the 49th report's $33.87 billion across 21 assets
- [Robinhood: Crypto order routing](https://robinhood.com/us/en/support/articles/crypto-order-routing/), market maker routing with the $0.95 per $100 rebate included in the spread, and exchange routing for a percentage fee with no rebate
- [XRP Ledger: Source and destination tags](https://xrpl.org/docs/concepts/transactions/source-and-destination-tags), the per-address reserve that makes one address with tags the exchange pattern

**In practice**

- [InfoQ: Frank Yu, Building exchange systems in the cloud (QCon San Francisco 2025, posted April 23, 2026)](https://infoq.com/presentations/exchange-systems-cloud), the single-threaded core, Raft over inputs, five nodes, follower snapshots, replay, P99 and throughput, cross-zone latency
- [InfoQ: Coinbase post-mortem of the May 7, 2026 AWS failure (June 16, 2026)](https://infoq.com/news/2026/06/coinbase-aws-failure-postmortem), three of five nodes lost in one placement group, quorum loss, recovery through cancel-only and auction modes, stranded Kafka and manual partition moves, remediations
- [Kraken: Oxidizing Kraken](https://blog.kraken.com/product/engineering/oxidizing-kraken-improving-kraken-infrastructure-using-rust), the PHP to Rust migration from 2018, the shared test suite, lines of Rust and per-instance throughput
