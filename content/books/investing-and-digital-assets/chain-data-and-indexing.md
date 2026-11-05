+++
title = "Chain Data & Indexing"
description = "Nodes and RPC providers, reorg-safe ingestion, event logs and traces, balances at a block, indexers and data providers, and oracles and price marks."
category = "Investing & Digital Assets Industry"
order = 2540
part = "Chains and Wallets"
tags = ["indexing", "rpc", "reorgs", "event-logs", "oracles", "market-data"]
+++

Every number a crypto platform shows a customer about the chain was read from a node by a program somebody wrote: the deposit that just arrived, the balance of a cold wallet, the price used to mark a position, the proof that an address belongs to the platform. The chain is public, but it isn't a database. It answers questions about one block at a time, rewrites its recent past during reorganizations, keeps events in a form only the emitting contract's interface can decode, and leaves some transfers out of its logs entirely. Turning it into records a ledger can trust is an ingestion problem with three hard parts: following the canonical chain through reorgs without double counting or losing anything, seeing every movement (logs, native transfers inside contracts, Solana account changes), and knowing at which block each fact was true.

This chapter covers nodes against RPC providers (the hosting side is Hosting & Cloud's [Blockchain Nodes, RPC & Validators](/books/hosting-and-cloud/blockchain-nodes-and-validators)), reorg-safe ingestion with code, event logs, traces and balances at a block, indexers and data providers, and pricing data and oracles for marks. It adds ingest cursors, observed transfers, balance checkpoints and price marks to [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business, under the `chains`, `asset_networks` and `onchain_transactions` tables already there. What the platform does with a detected deposit is [Deposits & Withdrawals](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals); finality rules per chain are [Blockchains for Platform Engineers](/books/investing-and-digital-assets/blockchains-for-engineers#finality-per-chain).

## How the Providers Do It

The tools a platform reads chains with, from their documentation, as of November 2026:

| Tool | What it is | What it gives an ingestion pipeline | Limits and caveats it documents |
| --- | --- | --- | --- |
| **Ethereum JSON-RPC** (every client) | The standard node API | `eth_getLogs` by block range or exact `blockHash`, block tags `latest`, `safe`, `finalized`, logs with a `removed` flag on reorg | The standard set is what all clients implement; Geth serves traces through its `debug_` namespace |
| **Alchemy** | Hosted RPC | `eth_getLogs` with an unlimited block range on paid plans for major chains (Ethereum, Base, OP, Arbitrum, Polygon) | Free plan limited to a 10-block range; other chains capped at 10,000 blocks; responses capped at 150 MB |
| **Geth tracers** | Execution traces | `callTracer` returns every call frame (`CALL`, `DELEGATECALL`, `CREATE`) with `from`, `to` and `value`; `prestateTracer` diffs state | Needs a node that serves `debug_`; archive for old blocks |
| **Bitcoin Core ZMQ** | Push notifications from a node | `hashblock`, `rawblock`, `hashtx`, `rawtx`, and `sequence`, which reports blocks connected and disconnected | "ZMQ notification can get lost during transmission"; sequence numbers detect gaps |
| **Anza Geyser plugins** | A validator streaming its own data | Accounts, slots, blocks and transactions to external stores (Postgres, Kafka); slot status `Processed`, `Confirmed`, `Rooted` | Runs inside a validator or RPC node; confirmed can arrive before processed |
| **The Graph** | Hosted and decentralized indexing | Subgraphs ("a custom API built on blockchain data") queried with GraphQL; Substreams for parallel indexing written in Rust, compiled to WASM | Handles forks inside the engine; the platform still owns crediting rules |
| **Goldsky** | Managed chain data pipelines | Mirror streams data such as subgraph entities into a database of the platform's choice | Mirror "has been superseded by Turbo," which Goldsky says to use for all new pipelines |

None of these is the platform's ledger. They are sources; the ingestion pipeline turns their output into records with block hashes and finality states, and the platform's own rules decide what those records mean.

## Nodes and RPC Providers

A platform reads a chain through nodes it runs, through RPC providers, or both. The hosting trade-offs (resource profiles, archive and trace pricing, compute-unit metering) are in [RPC as a Hosting Business](/books/hosting-and-cloud/blockchain-nodes-and-validators#rpc-as-a-hosting-business) and [Archive, trace and dedicated nodes](/books/hosting-and-cloud/blockchain-nodes-and-validators#archive-trace-and-dedicated-nodes). What changes when the reader is a custodian:

- **Two independent sources for anything that releases money.** A node can lag, fork or be served by a provider having a bad day; a deposit above a threshold credits only when two sources agree on the block hash and its finality ([Confirmations, Reorgs and Monitoring the Chain](/books/payments/stablecoins#confirmations-reorgs-and-monitoring-the-chain)).
- **Run your own node for the chains you custody.** Broadcasting withdrawals, checking finality and reconciling the platform's addresses shouldn't depend on a third party's rate limits or terms; providers are the second source and the burst capacity.
- **Know which client answers.** Traces, archive state and some methods differ by client, and a hard fork can split clients on old versions from the network.
- **Meter the method mix.** `eth_getLogs` over wide ranges and trace calls are the expensive ones; the ingestion design (follow the head block by block, backfill in bounded ranges) decides the bill.

## Reorg-Safe Ingestion

### The rule

Every record derived from the chain is keyed by the block it came from, by hash and number, and the pipeline keeps its own copy of the canonical chain as a list of `(number, hash, parent_hash)`. When a new head arrives whose parent hash doesn't match the stored block below it, the chain has reorganized: the pipeline walks back until its stored hash and the node's hash agree at the same height (the fork point), marks every stored block above it as orphaned, reverses whatever was derived from them, and ingests the new branch forward. Nothing below the chain's finalized block is ever walked back; a mismatch there isn't a reorg, it's an incident.

Bitcoin Core's ZMQ `sequence` topic reports this directly, one message per block connected (`C`) or disconnected (`D`). Ethereum's log subscription marks reverted logs with `removed: true`. Both help, and neither is enough alone, because notifications can be lost and a pipeline restarted mid-reorg must work out the fork point from its own records.

```go tab="Go"
type Block struct {
	Number     uint64
	Hash       string
	ParentHash string
}

type Store interface {
	CanonicalAt(n uint64) (Block, bool) // the stored canonical block at height n
	OrphanFrom(n uint64) error          // marks n and above orphaned and emits reversals
}

type Node interface {
	BlockByNumber(n uint64) (Block, error)
}

// ForkPoint returns the highest height at or below head where the stored chain and the
// node's agree. It never searches below finalized: disagreement there is an incident.
func ForkPoint(s Store, node Node, head, finalized uint64) (uint64, error) {
	for n := head + 1; n > finalized; {
		n-- // visits head down to finalized without wrapping at zero
		ours, ok := s.CanonicalAt(n)
		if !ok {
			continue // not ingested yet
		}
		theirs, err := node.BlockByNumber(n)
		if err != nil {
			return 0, err
		}
		if ours.Hash == theirs.Hash {
			return n, nil
		}
	}
	return 0, fmt.Errorf("finalized block %d disagrees with node", finalized)
}

// Rewind orphans everything above the fork point; ingestion then resumes at fork+1.
func Rewind(s Store, node Node, head, finalized uint64) (uint64, error) {
	fork, err := ForkPoint(s, node, head, finalized)
	if err != nil {
		return 0, err
	}
	return fork + 1, s.OrphanFrom(fork + 1)
}
```

```rust tab="Rust"
pub struct Block {
    pub number: u64,
    pub hash: String,
    pub parent_hash: String,
}

pub trait Store {
    fn canonical_at(&self, n: u64) -> Option<Block>;  // the stored canonical block at height n
    fn orphan_from(&mut self, n: u64) -> anyhow::Result<()>;  // marks n and above orphaned
}

pub trait Node {
    fn block_by_number(&self, n: u64) -> anyhow::Result<Block>;
}

/// Highest height at or below `head` where the stored chain and the node's agree.
/// Never searches below `finalized`: disagreement there is an incident.
pub fn fork_point(s: &impl Store, node: &impl Node, head: u64, finalized: u64) -> anyhow::Result<u64> {
    for n in (finalized..=head).rev() {
        let Some(ours) = s.canonical_at(n) else { continue }; // not ingested yet
        if ours.hash == node.block_by_number(n)?.hash {
            return Ok(n);
        }
    }
    anyhow::bail!("finalized block {finalized} disagrees with node")
}

/// Orphans everything above the fork point; ingestion then resumes at fork + 1.
pub fn rewind(s: &mut impl Store, node: &impl Node, head: u64, finalized: u64) -> anyhow::Result<u64> {
    let fork = fork_point(s, node, head, finalized)?;
    s.orphan_from(fork + 1)?;
    Ok(fork + 1)
}
```

### Three streams, not one

A platform's consumers want different guarantees, so the pipeline publishes three streams per chain:

- **Head:** every block as seen, with reversals when blocks are orphaned. For showing pending deposits and for monitoring.
- **Safe or confirmed:** blocks past a shallower threshold (Ethereum's `safe` tag, Solana's `confirmed`). For risk scoring and early warnings.
- **Final:** blocks past the chain's finality rule. The only stream allowed to move money in the ledger.

Each consumer is idempotent on `(chain, block_hash, log_index)` or the chain's equivalent, so replaying a stream after a restart changes nothing ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)), and the pipeline itself is replayable from any block ([Pipelines Must Be Replayable](/docs/data/data-pipelines#pipelines-must-be-replayable)).

## Logs, Traces and Balances

### Event logs

Contracts report what happened by emitting logs. Per the Solidity ABI specification, a non-anonymous event's first topic is keccak-256 of its signature (`Transfer(address,address,uint256)` gives `0xddf252ad...b3ef`), up to three indexed parameters follow as further topics, and the rest are ABI-encoded in the log's data. `eth_getLogs` filters by contract address and topics over a block range, or over one block by `blockHash` (EIP-234), in which case "neither fromBlock nor toBlock are allowed." Filtering by hash is the reorg-safe form: a query by number can return logs from whichever branch the node follows at that moment.

To find deposits of a token to the platform's addresses, the filter is the token contract, topic 0 = the Transfer hash, and topic 2 = the recipient padded to 32 bytes. Two rules from [Tokens & Token Standards](/books/investing-and-digital-assets/tokens-and-standards#token-metadata-and-spoofed-tokens) apply here: only logs from contracts in `asset_networks` count, and tokens that rebase or charge transfer fees credit by balance change, not by the log.

### Traces for native transfers

Logs come only from contract code that chooses to emit them. A plain ETH transfer from an account shows in the transaction's `value`; an ETH transfer made by a contract (a multisig paying out, a forwarder sweeping, a smart account executing a batch) shows in neither, only as a call frame with a nonzero `value` inside the transaction's trace. Geth's `callTracer` "tracks all the call frames executed during a transaction," each with `type`, `from`, `to` and `value`. A deposit watcher that reads only top-level values and token logs misses native deposits sent from smart wallets and exchanges, which is a common way customers' ETH arrives. The fix is to trace transactions touching the platform's addresses, or to reconcile by balance (below) and investigate the difference.

### Solana: accounts, not logs

On Solana the state that matters is in accounts: a token deposit changes the balance of the recipient's associated token account. Geyser plugins stream account updates, slots, blocks and transactions out of a validator to external stores, with slot status moving through `Processed`, `Confirmed` and `Rooted`; the documentation warns that a confirmed notification can arrive before the processed one. An exchange's Solana watcher keys deposits by slot and signature, follows each slot to the commitment its finality rule requires, and treats account balance changes as the deposit signal, not program log lines.

### Balances at a block

The cleanest reconciliation is the chain's own answer: the balance of each platform address at a finalized block, read with `eth_getBalance` or a token's `balanceOf` at that block number, compared with the sum of the ledger's postings to that address through the same block. Reading past state needs a node that keeps it (an archive node for anything beyond recent history, per [What a Node Is](/books/hosting-and-cloud/blockchain-nodes-and-validators#what-a-node-is)). For Bitcoin the equivalent is the UTXO set for the wallet's addresses at a height. The difference between the two sides is the break: a missed native transfer, a rebase, a fee-on-transfer token, an airdrop nobody listed, or a real problem ([Reconciliation](/docs/money/payment-states#reconciliation)).

## Indexers and Data Providers

Three ways to get from raw chain data to queryable records:

- **Build it.** Run nodes, follow heads, decode logs and traces into the platform's own tables. The most control, and the only option for the ledger-facing path, because the crediting rules and the audit trail belong to the platform.
- **Use an indexing protocol or managed pipeline.** The Graph's subgraphs map events to entities queried by GraphQL; Substreams transforms blocks in parallel in Rust compiled to WASM and writes to a sink; managed pipelines such as Goldsky's stream indexed data into a database the platform chooses. Good for product features (history screens, portfolio views, analytics) where a delay or a provider outage degrades a page rather than a balance.
- **Use a data warehouse provider.** Hosted SQL over decoded chain data serves analytics, research and investigations, joined with the platform's own data in its warehouse ([Separating Production and Analytics](/docs/data/separating-production-and-analytics)).

My default: the ledger-facing path (deposits, withdrawals, reconciliation, proof of reserves) is built in-house on the platform's own nodes with a provider as second source; everything customer-facing that isn't a balance can use an indexer; analytics use whatever is cheapest to query, with the chain as the tiebreaker.

## Pricing Data and Oracles for Marks

A crypto platform marks positions around the clock: for portfolio values, margin and liquidation, collateral haircuts, tax lots and statements. Unlike a listed equity there is no single closing price or consolidated tape, so the mark is a methodology, and the platform has to choose and document it.

### Sources

- **The platform's own order books.** Always available, and dangerous alone. On October 10, 2025, USDe "traded in the mid-$0.60s on Binance" while it "stayed much closer to $1" elsewhere, and because "many leveraged products priced collateral using the venue's own spot price," accounts that would have been solvent under cross-venue pricing were liquidated (FTI Consulting's analysis). The lesson FTI draws: "Multi-venue, liquidity-weighted oracles with outlier controls" should "become standard."
- **External venue data.** Trades and books from other exchanges, aggregated by the platform or bought from a market data vendor; the methodology (which venues, how weighted, how outliers are excluded) is the vendor's product.
- **On-chain oracles.** For DeFi integrations and for marking tokens that trade mostly on chain. Pyth's documentation describes two models: one where "Each transaction carries a signed price, verified on the spot," and one where "A signed update is verified and stored on-chain" and "Any contract can read the stored price until a newer update replaces it." Chainlink's push-model feeds start a new aggregation round when off-chain values deviate beyond a threshold or when a heartbeat interval has passed since the last update ("The first condition that is met triggers an update"), and `latestRoundData` returns an `updatedAt` timestamp "for checking data freshness," so a reader compares it with the feed's heartbeat before trusting a value.

### A mark methodology

The rules I'd write down for a platform's marks:

- **Several venues, weighted by liquidity,** with a median or trimmed mean and an outlier band; a venue that diverges beyond the band drops out until it converges.
- **A staleness limit per source.** A price older than its limit is not used; if too few sources remain, the mark freezes and the instrument goes to a reduced-risk mode (no new leverage) instead of marking on one venue.
- **The platform's own book as one input, never the only one,** especially for collateral that is supposed to be worth a dollar.
- **Stablecoins marked to their peg only while the market agrees** within a band, and to market otherwise, with the switch logged.
- **Every mark stored with its inputs,** so a liquidation, a statement value or a tax lot can be reconstructed. Market data entitlements and fan-out are [Market Data](/books/investing-and-digital-assets/market-data); portfolio performance at 24/7 marks is [Portfolio Accounting & Performance](/books/investing-and-digital-assets/portfolio-accounting); oracle manipulation is [Oracles & MEV](/books/investing-and-digital-assets/oracles-and-mev#oracle-manipulation).

## How to Build It

The pipeline's records sit under the core `chains` and `onchain_transactions` ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)) and on the `blocks` and `chain_heads` tables from [Blockchains for Platform Engineers](/books/investing-and-digital-assets/blockchains-for-engineers#how-to-build-it), where each block carries its hash, parent and canonical state. This chapter adds consumer cursors, the decoded movements the pipeline observes, balance checkpoints for reconciliation, and price marks with their sources.

```sql
CREATE TABLE ingest_cursors (             -- where each consumer is, per chain and stream
  consumer      TEXT NOT NULL,            -- 'deposits', 'recon', 'history_api'
  chain_id      UUID NOT NULL REFERENCES chains (id),
  stream        TEXT NOT NULL CHECK (stream IN ('head', 'safe', 'final')),
  block_number  BIGINT NOT NULL,
  block_hash    TEXT NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (consumer, chain_id, stream)
);

CREATE TABLE observed_transfers (         -- decoded logs, trace transfers, account changes
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  chain_id         UUID NOT NULL REFERENCES chains (id),
  block_hash       TEXT NOT NULL,
  block_number     BIGINT NOT NULL,
  tx_hash          TEXT NOT NULL,
  position         TEXT NOT NULL,          -- log index, trace path ('0.2.1') or Solana instruction
  kind             TEXT NOT NULL CHECK (kind IN ('token_transfer', 'native_transfer',
                     'native_internal', 'approval', 'account_balance')),
  asset_network_id UUID REFERENCES asset_networks (id),  -- null for unlisted contracts
  contract_address TEXT,
  from_address     TEXT,
  to_address       TEXT,
  amount_base      NUMERIC(78,0),
  touches_platform BOOLEAN NOT NULL,       -- any platform address involved
  FOREIGN KEY (chain_id, block_hash) REFERENCES blocks (chain_id, hash),
  UNIQUE (chain_id, block_hash, tx_hash, position)
);

CREATE TABLE balance_checkpoints (        -- the chain's answer, for reconciliation
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  address_id       UUID NOT NULL REFERENCES addresses (id),
  asset_network_id UUID NOT NULL REFERENCES asset_networks (id),
  block_number     BIGINT NOT NULL,
  block_hash       TEXT NOT NULL,
  balance_base     NUMERIC(78,0) NOT NULL,
  source           TEXT NOT NULL,
  reconciliation_id UUID REFERENCES reconciliations (id),
  observed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (address_id, asset_network_id, block_hash, source)
);

CREATE TABLE price_sources (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  name          TEXT NOT NULL,            -- a venue, a vendor index, an on-chain feed
  kind          TEXT NOT NULL CHECK (kind IN ('own_book', 'external_venue', 'vendor_index', 'oracle')),
  max_staleness INTERVAL NOT NULL
);

CREATE TABLE price_marks (                -- one mark per instrument per interval, with its inputs
  instrument_id UUID NOT NULL REFERENCES instruments (id),
  quote_instrument_id UUID NOT NULL REFERENCES instruments (id),  -- USD
  as_of         TIMESTAMPTZ NOT NULL,
  price         NUMERIC(38,18) NOT NULL,
  method        TEXT NOT NULL,            -- 'liquidity_weighted_median_v3', 'peg', 'frozen'
  inputs        JSONB NOT NULL,           -- source id, price, size, age, included or excluded and why
  sources_used  SMALLINT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('ok', 'degraded', 'frozen')),
  PRIMARY KEY (instrument_id, quote_instrument_id, as_of)
);
```

Notes on the sketch:

- **Observations are keyed by block hash,** and the foreign key to `blocks` finds everything derived from an orphaned hash. The same transaction in a new block is a new row; the old one is reversed, not edited.
- **Only the final stream posts.** A deposit becomes a `transfers` row credited to the customer only from an `observed_transfers` row whose block is `final` in `blocks`; head and safe observations feed pending displays and risk checks.
- **Cursors make restarts boring.** A consumer resumes from its cursor's block and hash; if the hash is no longer canonical, it rewinds first.
- **Balances are observations, not truth.** Each checkpoint names its source and block; reconciliation compares checkpoints from two sources with ledger sums at the same block, records a `reconciliations` row, and opens `recon_breaks` on differences.
- **Marks carry their inputs.** A frozen or degraded mark is a status the margin and liquidation engines read, so a thin or diverging market reduces risk-taking instead of triggering liquidations. On-chain oracle feeds as protocol inputs are [Oracles & MEV](/books/investing-and-digital-assets/oracles-and-mev#price-oracles).
- **Events:** `chain.final_advanced`, `chain.source_disagreement`, `price_mark.degraded` and `price_mark.frozen` go through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **Block lineage:** every block ingested, its source, whether it was orphaned and when, and the second source for final blocks.
- **Reversals:** every chain event reversed by a reorg and the ledger postings it touched (ideally none, because only final events post).
- **Daily balance reconciliation** per address and asset network at a final block, with breaks and resolutions.
- **Mark history** with inputs and methodology version for every instrument, so any valuation can be reproduced.
- **Source incidents:** periods when a node or provider lagged, disagreed or was excluded.

## What This Means for the System You Build

- **Key every derived record by block hash,** keep the canonical chain yourself, and walk back to the fork point on any parent mismatch.
- **Publish head, safe and final streams,** and let only the final stream move money.
- **Require two sources to agree** before a block is final for crediting.
- **Read traces or reconcile by balance,** because contract-made native transfers don't emit logs.
- **Filter logs by contract address from your own asset table,** never by symbol or by topic alone.
- **Mark from several liquidity-weighted venues with staleness limits,** never from your own book alone, and freeze rather than mark on one source.
- **Store marks with their inputs** so every liquidation and statement value can be rebuilt.

## References

**Standards and protocols**

- [Ethereum: JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/), block tags, `eth_getLogs` filters including `blockHash`, and the `removed` flag on reorg
- [Solidity: Contract ABI specification](https://docs.soliditylang.org/en/latest/abi-spec.html), event topics, indexed parameters and log data
- [Ethereum execution-apis](https://github.com/ethereum/execution-apis), the standard JSON-RPC method collection

**Vendor documentation**

- [Alchemy: eth_getLogs](https://www.alchemy.com/docs/reference/eth-getlogs), block range limits by plan and chain and the 150 MB response cap
- [Geth: Built-in tracers](https://geth.ethereum.org/docs/developers/evm-tracing/built-in-tracers), `callTracer` call frames and `prestateTracer`
- [Bitcoin Core: ZMQ notifications](https://raw.githubusercontent.com/bitcoin/bitcoin/master/doc/zmq.md), topics, lost notifications, sequence numbers and connect and disconnect messages
- [Anza: Geyser plugins](https://docs.anza.xyz/validator/geyser), streaming accounts, slots, blocks and transactions and slot statuses
- [The Graph: Subgraphs](https://thegraph.com/docs/en/subgraphs/developing/introduction/), custom APIs over blockchain data queried with GraphQL
- [The Graph: Substreams](https://thegraph.com/docs/en/substreams/overview/), parallel indexing in Rust compiled to WASM
- [Goldsky: Mirror](https://docs.goldsky.com/mirror/introduction), streaming subgraph entities into a chosen database and Turbo superseding Mirror for new pipelines
- [Pyth: Pull updates](https://docs.pyth.network/price-feeds/core/pull-updates), per-transaction signed prices and stored on-chain updates
- [Chainlink: Decentralized data model (documentation source)](https://github.com/smartcontractkit/documentation/blob/main/src/content/architecture-overview/architecture-decentralized-model.mdx), deviation and heartbeat thresholds and the first one met triggering an update
- [Chainlink: Data Feeds API reference (documentation source)](https://github.com/smartcontractkit/documentation/blob/main/src/content/data-feeds/api-reference.mdx), `latestRoundData` and its `updatedAt` timestamp for checking freshness

**In practice**

- [FTI Consulting: The October 2025 crypto crash, when leverage met liquidity](https://fticonsulting.com/insights/articles/crypto-crash-october-2025-leverage-met-liquidity), USDe at mid-$0.60s on one venue, collateral priced on the venue's own spot, and multi-venue liquidity-weighted oracles
