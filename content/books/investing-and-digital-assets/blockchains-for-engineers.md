+++
title = "Blockchains for Platform Engineers"
nav_title = "Blockchains for Engineers"
description = "UTXO and account models, nonces, EIP-1559 and Bitcoin fee markets, RBF and CPFP, finality per chain, reorgs, and a ledger that agrees with a chain."
category = "Investing & Digital Assets Industry"
order = 2536
part = "Chains and Wallets"
tags = ["blockchain", "bitcoin", "ethereum", "solana", "finality", "fees", "ledger"]
+++

A blockchain is a ledger that nobody owns, kept in agreement by thousands of machines that don't trust each other. For a broker or an exchange it is the one external system that can't be called on the phone: no operations desk, no correction file, no business day. A deposit is a fact on the chain before it is a fact in the platform's ledger, a withdrawal is a signed message that can't be recalled once it is final, and "final" means something different on every chain the platform supports. Bitcoin never declares a block final; it only makes reversal more expensive with every block on top. Ethereum declares finality in checkpoints a few minutes apart and can, in a bad week, stop declaring it. Solana switched consensus protocols on mainnet in October 2026 and with it changed what its own commitment levels promise.

This chapter is the chain mechanics a platform engineer needs before building custody, deposits or trading on top: the two ledger models (Bitcoin's unspent outputs and Ethereum's accounts), blocks and transactions, nonces, the fee markets with worked numbers (EIP-1559's base fee, Bitcoin's fee rates, replace-by-fee and child-pays-for-parent), finality chain by chain, reorganizations, mempools, and what all of it changes for a ledger that must agree with a chain. It extends the `chains` and `onchain_transactions` tables of [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business. Running the nodes that answer these questions is Hosting & Cloud's [Blockchain Nodes, RPC & Validators](/books/hosting-and-cloud/blockchain-nodes-and-validators); tokens on top of a chain are [Tokens & Token Standards](/books/investing-and-digital-assets/tokens-and-standards); keys are [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing); reading the chain at scale is [Chain Data & Indexing](/books/investing-and-digital-assets/chain-data-and-indexing); rollups are [Layer 2s, Bridges & Cross-Chain](/books/investing-and-digital-assets/layer-2s-and-bridges). A payment provider's view of the same mechanics, for stablecoin pay-ins, is the Payments volume's [Confirmations, Reorgs and Monitoring the Chain](/books/payments/stablecoins#confirmations-reorgs-and-monitoring-the-chain).

## How the Chains and Platforms Do It

The chains a platform supports differ on every axis that matters to its ledger. As of November 2026:

| | Bitcoin | Ethereum | Solana | OP Stack and Arbitrum rollups |
| --- | --- | --- | --- | --- |
| **Ledger model** | Unspent transaction outputs (UTXOs) | Accounts with balances and a per-account nonce | Accounts, with tokens in separate token accounts | Accounts, as Ethereum |
| **Fee unit** | Satoshis per virtual byte (sat/vB); vsize is weight / 4 | Gas, priced in gwei: a burned base fee plus a priority fee (EIP-1559) | Lamports: a fee per signature, plus an optional priority fee | L2 gas plus the cost of posting data to Ethereum |
| **Block cadence** | About ten minutes on average, by proof of work | 12-second slots, 32-slot epochs | Short slots, each with a scheduled leader | Set by the sequencer |
| **Finality signal** | None; probability of reversal falls with depth | Checkpoints justified then finalized by two-thirds of stake; `safe` and `finalized` block tags | `processed`, `confirmed`, `finalized` commitment; under Alpenglow (live October 21, 2026) confirmed and finalized are the same | Inherited from Ethereum once the batch is posted and finalized there; withdrawals wait for a proof or challenge window |
| **Can a confirmed transaction vanish?** | Yes, in a reorg; less likely with every block | Before finality, yes; after, only if one-third of stake is burned | Under Tower BFT a `processed` block could roll back; Alpenglow's confirmed status "cannot be rolled back" | A sequencer's soft confirmation is a promise until the batch is final on L1 |

What platforms publish follows from that. Kraken's deposit page, updated October 22, 2026, credits Bitcoin "after three confirmations, which takes approximately 45 minutes" and describes Solana deposits as near-instant. Circle's cross-chain transfer protocol publishes the depth it waits for before attesting a burn: about 65 Ethereum blocks (15 to 19 minutes) on Ethereum, and the same Ethereum-block wait on Arbitrum and Base, against 32 blocks (about 17 seconds) on Solana for a standard transfer; its fast transfer attests after 2 Ethereum blocks and covers the reorg risk with its own allowance. Those are two different answers to one question, how much reversal risk a credit can carry, and the rest of this chapter is how to answer it per chain.

## A Short History

| Date | Event | What it changed for a platform |
| --- | --- | --- |
| 2008 | The Bitcoin whitepaper, with the attacker-catch-up probability table in section 11 | Confirmations as a probability, not a rule |
| Mar 2013 | A Bitcoin 0.8 node accepts a block that 0.7 nodes reject; the chain splits until miners downgrade (BIP-50) | Software versions are part of consensus; a fork can run for hours, with "one large double spend" |
| Nov 22, 2016 | EIP-155 replay protection (Spurious Dragon, block 2,675,000) | Signatures bound to a chain ID; a transaction for one EVM chain can't be replayed on another |
| Nov 15, 2016 | SegWit (BIP-141) signaling begins; a block weight limit of 4,000,000 | Fees quoted per virtual byte, not per byte |
| Aug 5, 2021 | London upgrade, EIP-1559 (block 12,965,000) | A protocol base fee that is burned; type-2 transactions with a fee cap and a tip |
| Sep 15, 2022 | The Merge: Ethereum moves to proof of stake | Finality as an explicit checkpoint, roughly every epoch |
| Mar 13, 2024 | Dencun, EIP-4844 blobs | Rollups post data cheaply; L2 fees fall |
| Oct 2, 2024 | Bitcoin Core 28.0 turns on full replace-by-fee by default | Any unconfirmed Bitcoin transaction can be replaced, signaled or not |
| May 7, 2025 | Pectra (EIP-7702, more blobs, 2,048 ETH validators) | Plain accounts can run contract code ([Wallets](/books/investing-and-digital-assets/wallets)) |
| Dec 3, 2025 | Fusaka: 60 million default gas limit, a per-transaction cap of 2^24 gas, PeerDAS | Batch transactions that fit a block may no longer fit one transaction |
| Oct 21, 2026 | Solana's Alpenglow consensus live on mainnet-beta; TowerBFT retired | Commitment levels redefined; finality targeted at 150 milliseconds |

## Two Ledger Models

### Unspent outputs

Bitcoin has no balances. A transaction consumes earlier outputs in full and creates new ones: "Each [output] then waits as an Unspent Transaction Output (UTXO) until a later input spends it," and "the full value of the included UTXOs must be spent or given to a miner as a transaction fee." Whatever the inputs hold beyond the outputs is the fee; the surplus the sender wants back is a change output to an address it controls. A balance is the sum of the UTXOs a wallet's keys can spend.

A worked spend. A customer withdraws 0.5 BTC. The hot wallet holds UTXOs of 0.3 and 0.4 BTC, so the transaction takes both as inputs (70,000,000 sats) and creates two outputs: 50,000,000 sats to the customer and the change back to the platform. At a fee rate of 12 sat/vB on a transaction whose weight is 832 units (vsize 832 / 4 = 208 vB), the fee is 208 × 12 = 2,496 sats, so the change output is 70,000,000 − 50,000,000 − 2,496 = 19,997,504 sats. Three ledger consequences follow:

- **The fee is not a field.** It is inputs minus outputs, and a bug that forgets the change output gives the whole remainder to a miner. A signer that checks "fee below a cap" catches it; a signer that checks only the destination doesn't.
- **Coin selection is treasury work.** Which UTXOs to spend changes the fee (more inputs, more bytes), the privacy of the wallet, and how many small outputs pile up. Sweeping many small deposit outputs costs real money when fees are high, so platforms consolidate when blocks are cheap.
- **The ledger tracks outputs, not just amounts.** Reconciling a Bitcoin wallet means reconciling the set of UTXOs the platform believes it controls with the set the node reports, including outputs created by transactions not yet confirmed.

### Accounts and nonces

Ethereum keeps balances per account, and every transaction from an account carries a nonce, "a sequentially incrementing counter which indicates the transaction number from the account." The chain executes an account's transactions strictly in nonce order. That gives the account model a property UTXOs don't have: a withdrawal pipeline for one hot address is a single queue. If nonce 8 is stuck with too low a fee, nonces 9 and 10 wait behind it however much they pay; the fix is to replace nonce 8 (same nonce, higher fee) or to cancel it with a zero-value transfer to self at that nonce. A platform that sends from one address assigns nonces in one place, under a lock, and records them before signing, because two workers that pick the same nonce produce two transactions of which only one can land (withdrawal pipelines are in Deposits & Withdrawals).

Since EIP-155 the chain ID is part of what is signed, so a signed transaction for chain 1 is invalid on any other chain. Solana uses accounts too, but a token balance lives in a separate token account per owner and mint, which matters for deposits ([Tokens & Token Standards](/books/investing-and-digital-assets/tokens-and-standards#spl-tokens-and-token-extensions)).

## Fee Markets

### EIP-1559 on Ethereum

Since London, an Ethereum block has a gas target of half its gas limit and a base fee that every transaction in it pays. The base fee moves by at most one-eighth per block: if the parent used more than the target, `delta = max(parent_base_fee × (used − target) / target / 8, 1)` and the new base fee is the parent's plus delta; if it used less, the same formula subtracts. "The base fee is not given to anyone (it is burned)." A type-2 transaction states two caps, `max_fee_per_gas` and `max_priority_fee_per_gas`, and pays

`priority_fee = min(max_priority_fee_per_gas, max_fee_per_gas − base_fee)` and `effective_gas_price = base_fee + priority_fee`.

The validator receives only `gas_used × priority_fee`. Worked numbers at a 60 million gas limit (the default Fusaka shipped), so a 30 million target:

| Block | Gas used | Base fee in that block | Base fee of the next block |
| --- | --- | --- | --- |
| N | 60,000,000 (full) | 10.00 gwei | 10 + 10 × 30M / 30M / 8 = 11.25 gwei |
| N+1 | 60,000,000 (full) | 11.25 gwei | 12.65625 gwei |
| N+2 | 30,000,000 (on target) | 12.65625 gwei | 12.65625 gwei |
| N+3 | 0 (empty) | 12.65625 gwei | 12.65625 − 12.65625 / 8 = 11.07421875 gwei |

A withdrawal of ETH (a plain transfer, 21,000 gas) signed with `max_fee_per_gas` 30 gwei and `max_priority_fee_per_gas` 2 gwei and included in block N+2 pays an effective price of 12.65625 + min(2, 30 − 12.65625) = 14.65625 gwei. The fee is 21,000 × 14.65625 = 307,781.25 gwei, or 0.00030778125 ETH: 265,781.25 gwei burned and 42,000 gwei to the validator. The sender is charged up front for the gas limit at the effective price and refunded the unused gas. The arithmetic that sets the cap: at most one-eighth up per block means 1.125^6 ≈ 2.03, so a fee cap of twice the current base fee plus the tip keeps a transaction includable through six consecutive full blocks. A cap below the base fee leaves the transaction waiting in the mempool, not failed, which is how withdrawals get stuck during a spike.

Three rules for a platform's ledger: the fee is paid in ETH even when the transfer is a token, so every sending address holds an ETH float ([Gas, Fees and Who Pays Them](/books/payments/stablecoins#gas-fees-and-who-pays-them)); a transaction that reverts still pays for the gas it used; and the fee posted to the ledger is the one in the receipt (`gasUsed × effectiveGasPrice`), never the estimate.

### Fee rates on Bitcoin

Bitcoin fees are bid per unit of block space. Since SegWit, "Transaction weight is defined as Base transaction size * 3 + Total transaction size," virtual size is weight divided by four rounded up, and a block holds at most 4,000,000 weight units. Wallets and miners speak in sat/vB. There is no base fee and no protocol price: miners take the highest fee rates first, so the fee a platform pays depends on the backlog at the moment it broadcasts, and an estimate that was right when the transaction was built can be wrong an hour later.

### Replace-by-fee

BIP-125 made replacement explicit: a transaction "is considered to have opted in to allowing replacement of itself if any of its inputs have an nSequence number less than (0xffffffff - 1)," and a replacement must pay "an absolute fee of at least the sum paid by the original transactions," pay for its own bandwidth at the node's minimum relay rate, and evict no more than 100 transactions. Bitcoin Core 28.0 (October 2, 2024) changed the `-mempoolfullrbf` default "from 0 to 1," so nodes running it accept a replacement for any unconfirmed transaction, signaled or not.

For a receiving platform the consequence is blunt: an unconfirmed Bitcoin deposit is a promise the sender can withdraw by paying a higher fee to send the same coins elsewhere. Nothing short of a confirmation makes it real. For a sending platform, RBF is the tool for a stuck withdrawal: rebuild the transaction with the same inputs and a higher fee, and record the replacement as the same withdrawal, because only one of the two can confirm and the ledger must not book both.

### Child pays for parent

When the stuck transaction is one the platform received, it can't replace it, but it can spend its output. Miners evaluate a parent and child together, so a child with a high fee pulls its parent into a block. Worked numbers: a deposit of 200 vB sits in the mempool at 2 sat/vB (400 sats). The platform wants the package to clear at 20 sat/vB. A 150 vB child spending the deposit output must bring the package to (200 + 150) × 20 = 7,000 sats, so the child pays 7,000 − 400 = 6,600 sats, 44 sat/vB on its own. Bitcoin Core 28.0 added limited package relay for "1-parent-1-child packages" and made version 3 transactions (BIP-431, TRUC) standard with "a maximum transaction size of 10,000vB," which lets a parent below the mempool minimum be carried by its child; the release notes caution that this is "not yet reliable under adversarial conditions."

## Mempools

A broadcast transaction sits in each node's mempool until a block includes it, and there is no single mempool: each node keeps its own, with its own policy on minimum fees, replacement and size. Three things follow for a platform:

- **Seen is not received.** A pending transaction is evidence of intent. Show it to the customer as pending if the product wants to, never as a balance.
- **A broadcast can disappear without failing.** A node can evict a low-fee transaction, and the platform's own transaction can be dropped from every mempool while its record still says `pending`. A withdrawal that hasn't been included after a deadline is rebroadcast or replaced, and the record moves to a state that says so.
- **The mempool leaks intent.** On Ethereum a pending transaction is public before it is included, which is the source of front-running and sandwiching ([Oracles & MEV](/books/investing-and-digital-assets/oracles-and-mev#sandwiches) covers what that costs a user).

## Finality Per Chain

### Bitcoin: probability by depth

Bitcoin never finalizes. Section 11 of the whitepaper computes the probability that an attacker with a share q of the hash rate ever catches up from z blocks behind. With q = 0.1, the probability is 0.2045873 at one block, 0.0009137 at five and 0.0002428 at six; with q = 0.3 it is still 0.1773523 at five blocks and 0.0416605 at ten, and it takes 24 blocks to push it below 0.1%. Six confirmations became the convention because of the first column, not because the protocol says so. A platform choosing a depth is choosing how much hash rate it is prepared to defend against relative to the value at stake, which is why depth should scale with deposit size and with the chain's security: a small proof-of-work chain whose entire hash rate can be rented for an hour deserves far more depth than Bitcoin, or no support at all (Listing & Delisting Assets).

### Ethereum: checkpoints

"Time in proof-of-stake Ethereum is divided into slots (12 seconds) and epochs (32 slots)." At each epoch boundary validators vote on checkpoints; a checkpoint with "at least two-thirds of the total staked ETH" behind it is justified, and the justified checkpoint before it becomes finalized. Reverting a finalized block would require an attacker to "commit to losing at least one-third of the total supply of staked ETH." In the normal case a block is finalized about two epochs after it is proposed (2 × 32 × 12 s, about 12.8 minutes, which is arithmetic, not a guarantee), consistent with Circle's 15 to 19 minutes for about 65 blocks. The JSON-RPC API exposes the levels as block tags: `latest`, `safe` and `finalized`.

Finality can stall. If the chain fails to finalize "for more than four epochs," the inactivity leak begins draining stake from offline validators until the rest are two-thirds again. During a stall blocks keep coming, `latest` keeps advancing and `finalized` doesn't. A crediting rule written as "N confirmations" keeps crediting through a stall; a rule written as "finalized" stops, which is the behavior a platform wants. My default for Ethereum and every chain that publishes a finality signal is to credit at the signal, with a confirmation count only as a floor for chains that don't.

### Solana: commitment levels

Solana exposes commitment per request. Under Tower BFT, `processed` meant the node had the block on the majority fork; `confirmed` added at least 66% of stake voting on it; `finalized` added 31 or more confirmed blocks on top. Under Alpenglow, live on mainnet-beta since October 21, 2026 per Anza, confirmed and finalized "are equivalent": 60% or more of stake voting to finalize, or 80% or more voting to notarize, after which the transaction "has been permanently committed to the ledger and cannot be rolled back." Anza's headline is "Finality in 150ms." A platform's crediting rule for Solana should name the commitment level (`finalized`), not a time, so that the same rule is right before and after a consensus change. Code written against the old 31-block definition keeps working; code that credited at `processed` was wrong under both.

### Rollups

A rollup's sequencer confirms a transaction in seconds, but that confirmation is the sequencer's word until the batch carrying it is posted to Ethereum and Ethereum finalizes that block, and a withdrawal back to Ethereum waits longer still (seven days on an optimistic rollup's fault-proof window). Each rollup is a chain with its own row in `chains` and a finality rule that refers to its settlement layer; the mechanics are [Layer 2s, Bridges & Cross-Chain](/books/investing-and-digital-assets/layer-2s-and-bridges#withdrawal-delays-and-what-final-means-on-a-rollup).

## Reorgs

A reorganization replaces blocks the node had accepted with a competing branch. Transactions in the abandoned blocks either reappear in the new branch (often in a different block, with a different block hash and position) or return to the mempool, where they may never be mined again, especially if the sender replaced them in the meantime. On Bitcoin, one- and two-block reorgs are an ordinary consequence of two miners finding blocks at nearly the same time; BIP-50 records the 2013 split in which nodes on two software versions followed different chains until miners downgraded. On Ethereum, reorgs of unfinalized blocks happen and the JSON-RPC log objects carry a `removed` flag, true "when the log was removed, due to a chain reorganization."

What a reorg does to a platform depends entirely on when it credited:

- **Credited at finality:** nothing. The deposit was never booked until it couldn't be reorged.
- **Shown as pending, credited later:** the pending record moves back to `pending` (if the transaction reappears) or to `dropped`, and the customer sees it.
- **Credited early and spendable:** the platform has given the customer an asset it may never receive. If the customer withdrew it, the loss is the platform's. This is the double-spend that confirmation policies exist to prevent.

The implementation rule is to store the block hash with the block number on every record, never the number alone, and to treat any block whose hash changes as an event that re-evaluates everything recorded against it ([Reorg-Safe Ingestion](/books/investing-and-digital-assets/chain-data-and-indexing#reorg-safe-ingestion)).

## What Changes for a Ledger That Must Agree With a Chain

Double entry still holds ([Double-Entry Ledger](/docs/money/payment-states#double-entry-ledger)); what changes is that one side of the reconciliation is a public, eventually consistent, occasionally rewritten system.

- **Two balances per asset.** The chain balance of the platform's addresses and the ledger balance of its customers. Customers' claims never exceed what the chain shows the platform controls, net of what is in flight; the difference is the reconciliation, run per asset network ([Reconciliation](/docs/money/payment-states#reconciliation)).
- **Pending is a ledger account, not a flag.** An inbound transfer seen but not final posts to a pending account the customer can see but not spend; finality moves it to the customer's available balance. An outbound withdrawal debits the customer when it is requested and sits in an in-flight account until the chain finalizes it, so a reorg or a drop reverses a posting, not a balance.
- **Fees are a separate line in the native asset.** A token withdrawal produces a token debit and an ETH fee; the platform decides who bears the fee, and its gas float is itself an asset to reconcile.
- **Units come from the chain's precision.** One BTC is 100,000,000 sats, one ETH is 10^18 wei, and the ledger stores integers in base units with the exponent from a table, never from the symbol ([Exponents Come From a Table](/docs/money/amounts#exponents-come-from-a-table)); Ledgers, Positions & Buying Power covers the multi-asset ledger.
- **The chain is never edited, so the ledger corrects itself.** A wrong credit is reversed by a new journal entry referencing the chain record, with the reason; nothing about the chain can be amended to match.
- **Time is block time.** The as-of for a chain fact is a block (number and hash) and its timestamp, which is what an auditor, a tax lot and a dispute all need.

## How to Build It

These are deltas against the core data model's `chains` and `onchain_transactions` ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)). The core `chains` row already carries `native_instrument_id`, a `finality_rule` (`confirmations`, `finalized_tag`, `commitment_finalized` or `l1_settled`) and `confirmations_required`; this chapter adds the platform's own record of each chain's blocks and heads, the reorgs it has seen, a versioned finality rule, and the fee, nonce and replacement fields a transaction needs. Rollup settlement is in [Layer 2s, Bridges & Cross-Chain](/books/investing-and-digital-assets/layer-2s-and-bridges#how-to-build-it).

```sql
ALTER TABLE chains
  ADD COLUMN ledger_model TEXT NOT NULL DEFAULT 'account'
    CHECK (ledger_model IN ('utxo', 'account'));

CREATE TABLE blocks (                      -- the platform's own view of each chain
  chain_id      UUID NOT NULL REFERENCES chains (id),
  number        BIGINT NOT NULL,
  hash          TEXT NOT NULL,
  parent_hash   TEXT NOT NULL,
  block_time    TIMESTAMPTZ NOT NULL,
  base_fee      NUMERIC(78,0),             -- EIP-1559 chains: wei per gas in this block
  canonical     BOOLEAN NOT NULL DEFAULT true,
  finality      TEXT NOT NULL CHECK (finality IN ('head', 'safe', 'final')),
  source        TEXT NOT NULL,             -- which node or provider produced it
  confirmed_by  TEXT,                      -- the second source that agreed, for final blocks
  orphaned_at   TIMESTAMPTZ,
  PRIMARY KEY (chain_id, hash)
);
CREATE UNIQUE INDEX one_canonical_block ON blocks (chain_id, number) WHERE canonical;

CREATE TABLE chain_heads (                 -- latest block per chain and level, as last seen
  chain_id      UUID NOT NULL REFERENCES chains (id),
  level         TEXT NOT NULL CHECK (level IN ('head', 'safe', 'final')),
  block_number  BIGINT NOT NULL,
  block_hash    TEXT NOT NULL,
  observed_at   TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (chain_id, level)
);

CREATE TABLE reorg_events (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  chain_id        UUID NOT NULL REFERENCES chains (id),
  fork_point      BIGINT NOT NULL,         -- last height both branches share
  depth           INT NOT NULL CHECK (depth > 0),
  orphaned_hashes TEXT[] NOT NULL,
  txs_moved       INT NOT NULL DEFAULT 0,  -- reappeared in the new branch
  txs_dropped     INT NOT NULL DEFAULT 0,
  credited_affected INT NOT NULL DEFAULT 0, -- should always be 0 if crediting waits for final
  detected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chain_finality_rules (        -- how this platform decides "final", over time
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  chain_id         UUID NOT NULL REFERENCES chains (id),
  method           TEXT NOT NULL CHECK (method IN ('confirmations', 'finalized_tag',
                     'commitment_finalized', 'l1_settled')),
  min_depth        INT,                    -- 'confirmations': blocks on top; a floor elsewhere
  value_tier_usd   NUMERIC(20,2) NOT NULL DEFAULT 0,  -- larger deposits can need more depth
  valid_during     TSTZRANGE NOT NULL,
  approved_by      UUID NOT NULL,          -- a person; rule changes are reviewed
  reason           TEXT NOT NULL,          -- 'Alpenglow activation', 'reorg of depth 3'
  EXCLUDE USING GIST (chain_id WITH =, value_tier_usd WITH =, valid_during WITH &&)
);

-- onchain_transactions: the core statuses are pending, confirmed, finalized,
-- reorged and failed, with block_hash and fee_paid already present. This
-- chapter adds dropped and replaced, the sender and nonce, and the fee detail.
ALTER TABLE onchain_transactions
  DROP CONSTRAINT onchain_transactions_status_check,
  ADD CONSTRAINT onchain_transactions_status_check CHECK (status IN ('pending', 'confirmed',
    'finalized', 'reorged', 'failed', 'dropped', 'replaced')),
  ADD COLUMN from_address      TEXT,             -- account chains: the signing address
  ADD COLUMN sender_nonce      NUMERIC(20,0),    -- the nonce it was signed with
  ADD COLUMN max_fee_per_unit  NUMERIC(78,0),    -- EIP-1559 max fee per gas, in wei
  ADD COLUMN max_priority_per_unit NUMERIC(78,0),
  ADD COLUMN fee_rate_sat_vb   NUMERIC(12,3),    -- Bitcoin: the rate it was built at
  ADD COLUMN effective_price   NUMERIC(78,0),    -- from the receipt, per gas
  ADD COLUMN units_used        NUMERIC(20,0),    -- gas used, or vsize
  ADD COLUMN fee_burned        NUMERIC(78,0),    -- base fee x gas used on EIP-1559 chains
  ADD COLUMN replaces_id       UUID REFERENCES onchain_transactions (id),  -- RBF or same nonce
  ADD COLUMN finality_rule_id  UUID REFERENCES chain_finality_rules (id), -- rule it was judged by
  ADD COLUMN finalized_at_block BIGINT;

-- One live transaction per sender nonce: a replacement reuses the nonce and
-- the original becomes replaced, so this stays unique.
CREATE UNIQUE INDEX one_live_tx_per_nonce ON onchain_transactions (chain_id, from_address,
  sender_nonce) WHERE sender_nonce IS NOT NULL AND status NOT IN ('replaced', 'dropped');

CREATE TABLE utxos (                       -- Bitcoin-family wallets: outputs the platform controls
  chain_id         UUID NOT NULL REFERENCES chains (id),
  txid             TEXT NOT NULL,
  vout             INT NOT NULL,
  address_id       UUID NOT NULL REFERENCES addresses (id),
  amount_base      NUMERIC(20,0) NOT NULL CHECK (amount_base > 0),   -- sats
  created_by_tx    UUID NOT NULL REFERENCES onchain_transactions (id),
  spent_by_tx      UUID REFERENCES onchain_transactions (id),         -- set at signing
  status           TEXT NOT NULL CHECK (status IN ('unconfirmed', 'confirmed', 'spent_pending',
                     'spent', 'orphaned')),
  PRIMARY KEY (chain_id, txid, vout)
);
```

The transaction states, as the deposit and withdrawal services move them:

| From | Event | To |
| --- | --- | --- |
| `pending` | Included in a block | `confirmed` |
| `confirmed` | The chain's finality rule is met | `finalized` |
| `confirmed` | Its block hash is no longer canonical | `reorged` |
| `reorged` | Reappears in the new branch | `confirmed` |
| `reorged` or `pending` | Never reappears, evicted, or not seen by the deadline | `dropped` |
| `pending` | Another transaction with the same inputs or nonce and a higher fee confirms instead | `replaced` |
| `pending` | Included but reverted (account chains); the fee is still paid | `failed` |

Notes on the sketch:

- **One canonical block per height.** The partial unique index makes the platform's view of a chain unambiguous; a reorg flips `canonical`, sets `orphaned_at` and writes a `reorg_events` row, and everything recorded against an orphaned hash is re-evaluated ([Reorg-Safe Ingestion](/books/investing-and-digital-assets/chain-data-and-indexing#reorg-safe-ingestion)).
- **Final needs two sources.** `confirmed_by` is set only when a second node or provider agrees on the hash at the final height, and `chain_heads` doesn't advance `final` without it.
- **Finality is a rule with a version.** Every credit records the `finality_rule_id` it was judged by, so "why did this deposit credit after 3 blocks" has an answer after the rule changes, and the change itself (who, why, when) is a row.
- **Value tiers raise depth.** A `confirmations` chain can require more blocks for a larger deposit; the rule picks the tier by the deposit's USD value at detection.
- **Replacement is a link, not a new withdrawal.** A fee bump creates a new `onchain_transactions` row with `replaces_id`, and the withdrawal's `transfers` row points at whichever one finalizes. The other ends `replaced`. Withdrawal pipelines and nonce reservations are Deposits & Withdrawals.
- **A failed transaction still has a fee.** `failed` on an account chain means included and reverted; `fee_paid` posts to the ledger in the native asset.
- **UTXOs are inventory.** `spent_by_tx` is set when the platform signs, not when the spend confirms, so two withdrawals never select the same output; a dropped or replaced spend releases it.
- **Payments' `onchain_transfers`** maps to an `onchain_transactions` row plus the `transfers` row that carries its `log_index`: the Payments volume's `seen` and `included` are this model's `pending` and `confirmed`, `final` is `finalized`, and `dropped` is the same.
- **Events:** `onchain_tx.confirmed`, `onchain_tx.finalized`, `onchain_tx.reorged`, `onchain_tx.dropped`, `onchain_tx.replaced`, `chain.reorg` and `chain.finality_stalled` (no new final block within a threshold) go through the [outbox](/docs/architecture/events#the-transactional-outbox); `chain.finality_stalled` pauses crediting on that chain until a person reviews it.

## Auditing

- **The rule behind every credit.** Each finalized deposit references the finality rule and the block (number and hash) at which the rule was met.
- **Every reorg seen.** Depth, affected blocks, the transactions that moved or vanished, and what the ledger did about each.
- **Fee bumps and cancellations.** Every replacement with its original, the fee paid, who approved it and which one finalized.
- **Finality rule changes.** Who changed a chain's rule, when, and why, with the chain event (an upgrade, a reorg) that prompted it.
- **Daily chain-to-ledger reconciliation per asset network,** with breaks as `recon_breaks` and their resolution.

## What This Means for the System You Build

- **Credit at the chain's own finality signal** (`finalized` on Ethereum, `finalized` commitment on Solana), and use confirmation depth only where the chain has no signal, scaled by value.
- **Treat unconfirmed Bitcoin as nothing,** since full RBF made every unconfirmed transaction replaceable.
- **Store block hash with block number** on every chain record, and re-evaluate on any change.
- **Make pending and in-flight ledger accounts,** so reorgs and drops reverse postings, not balances.
- **Book the fee from the receipt,** in the native asset, as its own line, including for failed transactions.
- **Own the nonce in one place** per sending address, and model replacements as links to the same withdrawal.
- **Version the finality rule,** and stop crediting a chain whose finality stalls.

## References

**Standards and protocols**

- [Bitcoin: A Peer-to-Peer Electronic Cash System (Nakamoto Institute copy)](https://nakamotoinstitute.org/library/bitcoin/), section 11's catch-up probabilities for q = 0.1 and q = 0.3 and the depth needed for P < 0.1%
- [BIP-50: March 2013 chain fork post-mortem](https://github.com/bitcoin/bips/blob/master/bip-0050.mediawiki), the 0.7 and 0.8 split, the miners' downgrade and the double spend
- [BIP-125: Opt-in full replace-by-fee signaling](https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki), the nSequence signal and the replacement rules
- [BIP-141: Segregated Witness](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki), transaction weight, virtual size and the 4,000,000 weight limit
- [EIP-155: Simple replay attack protection](https://eips.ethereum.org/EIPS/eip-155), chain ID in the signing hash, block 2,675,000
- [EIP-1559: Fee market change for ETH 1.0 chain](https://eips.ethereum.org/EIPS/eip-1559), the base fee update rule, effective gas price, priority fee and the burn
- [Ethereum: Proof-of-stake](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/), slots and epochs, justification and finality, the cost of reverting and the inactivity leak
- [Ethereum: Transactions](https://ethereum.org/en/developers/docs/transactions/), the nonce, fee fields and 21,000 gas for a transfer
- [Ethereum: JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/), the `safe` and `finalized` block tags and the `removed` flag on logs
- [Ethereum: History of forks](https://ethereum.org/en/ethereum-forks/), dates and blocks for Spurious Dragon, London, the Merge, Dencun, Pectra and Fusaka
- [Ethereum: Pectra](https://ethereum.org/en/roadmap/pectra/), activation at epoch 364032 on May 7, 2025
- [Ethereum: Fusaka](https://ethereum.org/en/roadmap/fusaka/), the December 3, 2025 activation, the 60 million default gas limit and the 2^24 per-transaction cap
- [Anza: Commitments](https://docs.anza.xyz/consensus/commitments), processed, confirmed and finalized under Tower BFT and Alpenglow
- [Anza: Alpenglow](https://www.anza.xyz/alpenglow), live on mainnet-beta (10/21), TowerBFT retired and the 150 ms finality target

**Vendor documentation**

- [Bitcoin Core 28.0 release notes](https://bitcoincore.org/en/releases/28.0/), full RBF by default, TRUC transactions and 1-parent-1-child package relay, October 2, 2024
- [Bitcoin developer guide: Transactions](https://developer.bitcoin.org/devguide/transactions.html), UTXOs, spending in full and change outputs
- [Circle: CCTP required block confirmations](https://developers.circle.com/cctp/required-block-confirmations), standard and fast transfer waits per chain
- [Kraken: Cryptocurrency deposit processing times](https://support.kraken.com/hc/en-us/articles/203325283), three confirmations for Bitcoin, updated October 22, 2026
