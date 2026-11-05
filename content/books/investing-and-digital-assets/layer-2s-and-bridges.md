+++
title = "Layer 2s, Bridges & Cross-Chain"
nav_title = "Layer 2s & Bridges"
description = "Optimistic and ZK rollups, sequencers and withdrawal delays, Base as an exchange-run L2, bridge designs from lock-and-mint to CCTP, and the bridge hacks."
category = "Investing & Digital Assets Industry"
order = 2541
part = "Chains and Wallets"
tags = ["layer-2", "rollups", "bridges", "cctp", "base", "security"]
+++

Most of the transactions an exchange's customers send on Ethereum-family chains no longer happen on Ethereum. They happen on rollups (Base, Arbitrum, OP Mainnet and others), chains that execute transactions themselves and post the data, and either a proof or a claim open to challenge, to Ethereum. A rollup is cheaper and faster than Ethereum because it borrows Ethereum's security for its history instead of buying its own, and the borrowing has terms: a sequencer, usually one company, orders transactions and can stall the chain; withdrawals back to Ethereum wait for a challenge window or a proof; and the contracts that hold users' funds on Ethereum can often be upgraded by a multisig. Every rollup's terms are different and they change.

Bridges move assets between chains that don't share a ledger, and they have been the most expensive place in crypto to get security wrong: in August 2022 Chainalysis counted about $2 billion stolen "across 13 separate cross-chain bridge hacks," 69% of everything stolen that year to that point. This chapter covers optimistic and ZK rollups, sequencers and their failure, withdrawal delays and what final means on a rollup, the maturity stages a platform can read, Base as an L2 run by an exchange, bridge designs (lock-and-mint, burn-and-mint like Circle's CCTP, and messaging networks like LayerZero), the bridge hacks (Ronin, Wormhole, Nomad, Multichain), and how an exchange decides which chains and bridges to support. It extends `chains`, `asset_networks` and `transfers` from [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business. Chain mechanics are [Blockchains for Platform Engineers](/books/investing-and-digital-assets/blockchains-for-engineers); multichain stablecoin supply and CCTP from the issuer's side are Issuing a Stablecoin; a payment provider's view of chain choice is the Payments volume's [Wrong Addresses and Wrong Chains](/books/payments/stablecoins#wrong-addresses-and-wrong-chains).

## How the Rollups and Bridges Do It

As published by the projects and by ETHBEAT (the risk tracker formerly called L2BEAT), as of November 2026:

| System | Kind | Who orders or attests | Withdrawal or settlement to Ethereum | Upgrade and exit terms |
| --- | --- | --- | --- | --- |
| **OP Stack** (OP Mainnet and chains built on it) | Optimistic rollup | A sequencer | Initiate on L2, prove on L1 against a fault dispute game, finalize after "the fault challenge period (7 days on mainnet)" | Per chain |
| **Base** | OP Stack optimistic rollup, chain ID 8453 | One sequencer, which "can be modified by Base Multisig 1"; batch sender, output proposer and challenger are each an "EOA managed by Coinbase Technologies" | ETHBEAT lists a 5-day challenge period; OP Stack fault proofs since October 30, 2024, and TEE and ZK proof arms added May 26, 2026 | ETHBEAT: Stage 1; exit window "None" for unwanted upgrades |
| **Arbitrum One** | Optimistic rollup | A sequencer | Messages via `ArbSys.sendTxToL1`, executed on L1 with a Merkle proof once the assertion is confirmed; the docs give the dispute window as "~6.4 days" in one place and "approximately 7-day" in another | Per its governance |
| **ZK rollups** (generic) | Validity rollup | An operator | "There are no delays when moving funds from a ZK-rollup to Ethereum" once the L1 contract accepts the validity proof | Per chain |
| **Circle CCTP** | Burn-and-mint for USDC (and registered tokens) | Circle's attestation service (Iris) | Standard: waits about 65 Ethereum blocks (15 to 19 minutes) on Ethereum, Arbitrum and Base; fast: 2 blocks on Ethereum, 1 on Base, with a fee of 0 to 13 basis points by source chain | "Standard Transfers are free" on most deployments |
| **LayerZero v2** | Messaging; tokens via the OFT standard | Decentralized verifier networks (DVNs) chosen per application pathway as "X-of-Y-of-N" | The destination executes once the configured DVNs verify | Each application sets its own security |

The column that matters most for a custodian is the last one: who can change the contracts that hold the money, and whether users get time to leave first.

## Rollups

### Optimistic and ZK

An optimistic rollup posts transaction data to Ethereum and a claim about the resulting state; the claim is accepted unless someone proves it wrong during a challenge window, so withdrawals wait out a challenge period that ethereum.org describes as "lasting roughly seven days". A ZK (validity) rollup posts a cryptographic proof that the state transition is correct, and "L2 transactions are finalized only if the L1 contract accepts the validity proof"; once it does, there is no wait. Both let users escape a censoring operator: optimistic rollups "allow users to submit a transaction directly to the onchain rollup contract" after a delay, and ZK rollups let users "submit transactions directly to the rollup contract on Mainnet," which "allows users to force an exit."

### Data on Ethereum: blobs

Since Dencun (March 13, 2024), rollups post data as blobs under EIP-4844: each blob is 4,096 field elements of 32 bytes, 131,072 bytes, priced by a separate blob base fee that rises or falls exponentially with demand above or below a target (the update fraction of 3,338,477 gives roughly 1.125x per block, like EIP-1559's one-eighth), and burned. The original target was 3 blobs per block with a maximum of 6; Pectra raised them to 6 and 9, and Fusaka added blob-parameter-only forks to raise them between upgrades. Nodes keep blobs for 4,096 epochs, about 18 days (4,096 × 32 × 12 s), after which a rollup's history depends on archivers, not Ethereum.

### Sequencers

The sequencer "has priority access to the rollup chain" and decides the order of transactions. On most rollups there is one, run by the rollup's operator, which brings three consequences an exchange has to plan for:

- **A sequencer outage stops the chain.** Ethereum keeps producing blocks, but the rollup produces none; deposits and withdrawals on it stop, and the forced-inclusion path works only after its delay. <!-- source-gap: base-sequencer-outage-2025 | secondary | Base sequencer outage on Aug 5, 2025 (about 33 minutes, failover to an unprovisioned sequencer) | closes with: Base status page or Base engineering post-mortem opened | checked: 2026-11-05 --> Rollup sequencer outages have happened in production; this chapter gives no incident durations because only press accounts of them were available.
- **The sequencer's confirmation is a promise.** A transaction is ordered in seconds, but it is final only when the batch carrying it is posted to Ethereum and Ethereum finalizes that block.
- **The sequencer sees order flow first,** which is a conflict when the operator also trades (below).

### Stages

ETHBEAT's stages framework gives a platform a published scale for how much a rollup depends on its operators. **Stage 0** "represents a project who is fully controlled by few entities," though it must post state roots and data on L1 and have a proof system. **Stage 1** requires that L2-to-L1 messages can be blocked or forged only "by compromising ≥75% of the Security Council" and that upgrades outside the Council give "at least a 7 days exit window." **Stage 2** "represents a project that is fully controlled by code": permissionless fraud proofs and at least 30 days to exit before an unwanted upgrade. A platform's support decision and its risk disclosure for each rollup should name its stage and date it, because stages are reassessed.

## Withdrawal Delays and What Final Means on a Rollup

Three different events get called "final" on a rollup:

1. **Sequencer inclusion:** seconds. The rollup's own nodes show the transaction in a block.
2. **L1 finality of the batch:** the batch containing it is in an Ethereum block that Ethereum has finalized. Circle waits about 65 Ethereum blocks (15 to 19 minutes) before attesting a standard burn on Base or Arbitrum, the same as on Ethereum.
3. **L1 withdrawal finality:** a message from the rollup to Ethereum can be executed on Ethereum. On the OP Stack: initiate on L2 (the withdrawal hash is recorded in `L2ToL1MessagePasser`), wait until "a proposal covering the withdrawal's block reaches L1," prove it against that proposal's dispute game on `OptimismPortal`, then wait out the challenge period and call `finalizeWithdrawalTransaction`. Re-proving resets the timer.

For crediting deposits made on the rollup, event 2 is the right rule: the deposit is as irreversible as Ethereum's block once the batch is final there. Event 3 matters for the platform's own treasury: moving ETH or tokens from a rollup back to Ethereum through the canonical bridge locks them for the challenge window. Worked: if an exchange's customers withdraw on average 2,000 ETH a day more on Ethereum than they deposit there, while deposits pile up on a rollup, rebalancing through the canonical bridge needs 2,000 × 7 = 14,000 ETH in transit at any time on a 7-day window, all of it unavailable for withdrawals. That is why exchanges hold separate inventories per chain, let customers withdraw directly on the rollup, and use faster paths (CCTP for USDC, third-party liquidity bridges for ETH, with their own risk) for rebalancing.

## Base and the Exchange-Run L2

Base is an OP Stack rollup whose documented operating roles (batch sender, output proposer, challenger, registrar) are each an "EOA managed by Coinbase Technologies," and whose sequencer "can be modified by Base Multisig 1." ETHBEAT rates it Stage 1, with a challenge period of 5 days and no exit window for unwanted upgrades. For an engineer at any exchange, Base is the case study for a question that will recur as other platforms launch chains: what changes when the company that runs the chain is also an exchange that lists its assets and custodies its users' funds.

- **Order flow.** The sequencer orders every transaction on the chain, including transactions that interact with venues the operator competes with or trades on. Policies on sequencer ordering, and their disclosure, are the operator's to publish; a platform listing tokens on another exchange's L2 reads them.
- **Outages are correlated.** An incident at the operator can affect the exchange and the chain it runs at once, so the exchange's own deposits and withdrawals on that chain need the same failover planning as any external chain.
- **Upgrades are a counterparty risk.** With no exit window, a malicious or mistaken upgrade by the keyholders could affect assets in the bridge before users can leave; the custody risk disclosure for assets on the chain says so.
- **Listing conflicts.** Tokens native to the operator's chain are listing decisions with a conflict of interest, handled by the same written framework and recusal as any listing (Listing & Delisting Assets).

## Bridges

### Designs

| Design | How it works | Who you trust | Example |
| --- | --- | --- | --- |
| **Canonical rollup bridge** | Lock on L1, mint on L2; burn on L2 and prove to unlock on L1 | Ethereum plus the rollup's proof system and upgrade keys | OP Stack and Arbitrum bridges |
| **Lock-and-mint (external)** | Assets locked in a contract on chain A; a wrapped token minted on chain B when validators or signers attest | The attesters: a multisig, a validator set or an MPC group | Ronin, Wormhole, Multichain |
| **Burn-and-mint by the issuer** | The issuer's token is burned on chain A and the issuer mints the same token on chain B after attesting the burn | The issuer, already trusted for the token | Circle CCTP for USDC |
| **Liquidity network** | A provider pays out on chain B from its own inventory and is repaid on chain A | The provider's solvency and the settlement contracts | Third-party fast bridges |
| **Messaging layer** | Generic messages verified by configurable verifiers; tokens built on top | Whichever verifiers the application configured | LayerZero (DVNs, OFT) |

The distinction that matters for an exchange: a wrapped token from a lock-and-mint bridge is a claim on the bridge's locked collateral, not on the original issuer, and it is worth what the bridge's security is worth. Circle says as much of bridged `USDC.e`: it "is not issued or backed by Circle" ([What a Payment Stablecoin Is](/books/payments/stablecoins#what-a-payment-stablecoin-is)). In the core model, native USDC on Base and bridged USDC.e are different `asset_networks` rows, and the second may belong to a different instrument entirely.

### Circle's CCTP

CCTP is "a permissionless onchain utility" that burns USDC on the source chain and mints it on the destination after Circle's attestation, with no liquidity pool in between. A standard transfer waits for the source chain's hard finality (about 65 blocks on Ethereum and the rollups that settle to it, 32 blocks or about 17 seconds on Solana); a fast transfer attests after a few blocks (2 on Ethereum, about 20 seconds; 1 on Base, about 8 seconds) and is backed by "Circle's Fast Transfer allowance," for a fee of 0 to 13 basis points depending on the source chain; Circle's documentation says "Do not hardcode fee values" and to read them from its fee API. Hooks let the destination chain run an action on arrival. For an exchange rebalancing USDC between chains, CCTP replaces a 7-day canonical withdrawal with minutes and replaces a third-party bridge's risk with the issuer's, which it already carries by holding USDC at all.

### Messaging networks

LayerZero v2 lets each application configure, per pathway, which verifiers must attest a message: "required DVNs" that must always witness it, a threshold of required plus optional DVNs, out of a total set, written as X-of-Y-of-N. Its fungible token standard (OFT) moves ERC-20s across chains on top. The security of a token bridged this way is the configuration the token's deployer chose, which an exchange listing the token must read and record, and re-read when it changes.

## The Bridge Hacks

| Date | Bridge | Loss | What broke | Design lesson |
| --- | --- | --- | --- | --- |
| Feb 2, 2022 | Wormhole (Solana to Ethereum) | 120,000 wETH minted without backing (about $320 million) | `verify_signatures` used a deprecated function that didn't check that the supplied sysvar account was the real one, so a fake account passed verification | Verification code is the bridge; one unchecked input mints unlimited supply |
| Mar 2022 | Ronin (Axie Infinity) | About 173,600 ETH and 25.5 million USDC (about $624 million) | Withdrawals needed 5 of 9 validator signatures; the attacker held four Sky Mavis validators and got a fifth through an Axie DAO allowlist from November 2021 that was never revoked; found six days later when a user couldn't withdraw | Threshold of independent signers is the security; revoke temporary access; monitor outflows |
| Aug 2022 | Nomad | Over $190 million; about $36 million returned | An upgrade initialized the trusted root to `0x00`, which "also matches the value for an untrusted root, so all messages are automatically viewed as proven"; hundreds of copycats replayed transactions with their own addresses | An upgrade is a deployment of new security; test the failure path, not only the happy path |
| May to Jul 2023 | Multichain | At least $200 million moved (press) | Per the team's statements as reported, the CEO, detained in May, had sole access to the servers behind the MPC nodes; assets locked in MPC wallets were later moved out | A threshold controlled by one person is a single key |

The US Treasury added an Ethereum address to the Lazarus Group's sanctions entry on April 14, 2022, and Chainalysis estimated in August 2022 that North Korea-linked hackers had stolen "approximately $1 billion" that year, all from bridges and other DeFi protocols. For an exchange the hacks matter three ways: a wrapped asset it lists can lose its backing overnight (Wormhole's wETH was made whole only because Jump Trading replaced the ETH); stolen funds arrive at exchanges to be cashed out, so deposits from addresses linked to a hack must be screened and frozen fast ([On-Chain Analytics & Investigations](/books/investing-and-digital-assets/blockchain-analytics)); and an exchange's own bridge or cross-chain treasury tooling is the same kind of target ([Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing#mpc-and-threshold-signatures)).

## Which Chains and Bridges to Support

The questions I'd put in an exchange's chain and bridge support framework, answered in writing per chain and per bridged asset, and re-answered on any change:

- **Security of history.** L1 with its own consensus, rollup (which stage, which proof system, who holds upgrade keys, how long the exit window), or sidechain with its own validator set?
- **Finality rule.** What signal the platform credits at, and how long it takes ([Finality Per Chain](/books/investing-and-digital-assets/blockchains-for-engineers#finality-per-chain)).
- **Operator dependence.** Who runs the sequencer, what happens during its outage, and whether forced inclusion works.
- **Asset provenance.** For each token on the chain: issued natively by the issuer, or bridged; if bridged, by which bridge, under which security configuration, and whether the issuer stands behind it.
- **Treasury path.** How the platform rebalances inventory to and from the chain (canonical bridge and its delay, CCTP, a liquidity provider) and the in-transit float that requires.
- **Operations.** Node clients, RPC providers, indexer support and fee asset for the chain ([Chain Data & Indexing](/books/investing-and-digital-assets/chain-data-and-indexing)).
- **Customer error surface.** Address formats shared with other chains (every EVM rollup uses the same address format, so a customer can send to the right address on the wrong chain), and whether the platform can recover such deposits.

## How to Build It

The core `chains` row says how a chain is final (`l1_settled` for a rollup) but not what it settles to or on what terms; `asset_networks` says where a token lives but not where its backing is ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)). This chapter adds the relationship between a rollup and its settlement chain, the bridge routes the platform has approved, provenance for bridged tokens, and the platform's own cross-chain treasury moves: canonical rollup exits as `l2_withdrawals` and every other route as `bridge_transfers`. A customer's deposit or withdrawal on a rollup is an ordinary `transfers` row with an `onchain_transactions` row on that rollup.

```sql
CREATE TABLE chain_relationships (         -- a rollup and what it settles to, dated
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  chain_id           UUID NOT NULL REFERENCES chains (id),     -- the L2
  settles_to_id      UUID NOT NULL REFERENCES chains (id),     -- Ethereum
  kind               TEXT NOT NULL CHECK (kind IN ('optimistic_rollup', 'zk_rollup',
                       'validium', 'sidechain')),
  stage              SMALLINT CHECK (stage BETWEEN 0 AND 2),   -- as published by a tracker
  stage_source       TEXT,
  withdrawal_window  INTERVAL,               -- challenge period or proof delay
  exit_window        INTERVAL,               -- notice before upgrades; zero if none
  sequencer_operator TEXT,
  upgrade_keyholders TEXT,                   -- multisig and council, as published
  valid_during       TSTZRANGE NOT NULL,
  CHECK (chain_id <> settles_to_id),
  EXCLUDE USING GIST (chain_id WITH =, valid_during WITH &&)
);

CREATE TABLE bridge_routes (                -- approved paths for moving an asset between chains
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  from_asset_network UUID NOT NULL REFERENCES asset_networks (id),
  to_asset_network   UUID NOT NULL REFERENCES asset_networks (id),
  mechanism          TEXT NOT NULL CHECK (mechanism IN ('canonical_rollup', 'issuer_burn_mint',
                       'lock_mint', 'liquidity_network', 'messaging')),
  provider           TEXT NOT NULL,          -- 'OP Stack bridge', 'Circle CCTP', ...
  trust_model        TEXT NOT NULL,          -- 'Ethereum + fault proofs', 'issuer attestation',
                                             -- '3-of-5 DVNs'
  security_config    JSONB,                  -- DVN set or signer threshold, as read on chain
  expected_duration  INTERVAL NOT NULL,      -- 7 days, 20 minutes, 8 seconds
  max_in_transit     NUMERIC(78,0),          -- exposure limit in base units
  approved_by        UUID NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('active', 'paused', 'retired')),
  UNIQUE (from_asset_network, to_asset_network, provider)
);

ALTER TABLE asset_networks
  ADD COLUMN provenance TEXT NOT NULL DEFAULT 'native_issuer' CHECK (provenance IN
    ('native_issuer', 'canonical_bridge', 'third_party_bridge')),
  ADD COLUMN bridge_route_id UUID REFERENCES bridge_routes (id),  -- how its backing got here
  ADD CONSTRAINT bridged_has_route CHECK ((provenance = 'native_issuer') = (bridge_route_id IS NULL));

CREATE TABLE l2_withdrawals (               -- the platform's canonical exits from a rollup
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  route_id           UUID NOT NULL REFERENCES bridge_routes (id),  -- mechanism canonical_rollup
  amount_base        NUMERIC(78,0) NOT NULL CHECK (amount_base > 0),
  initiate_tx_id     UUID NOT NULL REFERENCES onchain_transactions (id),  -- on the L2
  prove_tx_id        UUID REFERENCES onchain_transactions (id),           -- on L1
  dispute_game       TEXT,                   -- the proposal it was proven against
  finalize_tx_id     UUID REFERENCES onchain_transactions (id),           -- on L1
  status             TEXT NOT NULL CHECK (status IN ('initiated', 'awaiting_proposal',
                       'proven', 'claimable', 'finalized', 'reprove_needed', 'stuck')),
  claimable_at       TIMESTAMPTZ,            -- proven at + withdrawal window; reset on re-prove
  journal_entry_id   UUID REFERENCES journal_entries (id),  -- the in-transit posting
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bridge_transfers (             -- every other route: issuer burn-mint, messaging, liquidity
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  route_id           UUID NOT NULL REFERENCES bridge_routes (id),
  amount_base        NUMERIC(78,0) NOT NULL CHECK (amount_base > 0),
  fee_base           NUMERIC(78,0) NOT NULL DEFAULT 0,
  source_tx_id       UUID NOT NULL REFERENCES onchain_transactions (id),
  attestation_ref    TEXT,                   -- CCTP attestation, verifier proofs
  dest_tx_id         UUID REFERENCES onchain_transactions (id),
  status             TEXT NOT NULL CHECK (status IN ('initiated', 'source_final', 'attested',
                       'completed', 'failed', 'stuck')),
  journal_entry_id   UUID REFERENCES journal_entries (id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at       TIMESTAMPTZ
);
```

The states:

| Record | Path | Off the path |
| --- | --- | --- |
| `l2_withdrawals` | `initiated`, `awaiting_proposal` (until a proposal covering the block reaches L1), `proven`, `claimable` (after the window), `finalized` | `reprove_needed` if the dispute game it was proven against fails, which resets the window; `stuck` past the expected duration |
| `bridge_transfers` | `initiated`, `source_final`, `attested` (by the issuer or the configured verifiers), `completed` | `stuck` past the expected duration plus a margin; `failed` if the source transaction reverted |

Notes on the sketch:

- **In transit is a ledger account.** Initiating either kind of move posts from the source chain's treasury account to an in-transit account in the same instrument; completion posts from in transit to the destination chain's treasury. Chain-by-chain reconciliation then balances with the in-transit amount as a known item, and `max_in_transit` caps exposure per route.
- **Provenance is per asset network.** A bridged token points at its route, so a bridge incident finds every listed asset and every customer balance exposed to it in one query.
- **Security configuration is read, not remembered.** For messaging and lock-and-mint routes a job reads the verifier set or signer threshold on chain and pauses the route if it changes.
- **Stages and windows are dated data.** A rollup's stage, exit window and challenge period come from published sources with an as-of range, and a new range opens a review of the chain's support.
- **Events:** `l2_withdrawal.claimable`, `l2_withdrawal.reprove_needed`, `bridge_transfer.completed`, `bridge_transfer.stuck`, `bridge_route.config_changed` and `chain_relationship.changed` go through the [outbox](/docs/architecture/events#the-transactional-outbox); `bridge_route.config_changed` pauses the route.

## Auditing

- **Chain support decisions** with each rollup's stage, proof system, keyholders and exit window as of the decision, and every re-review.
- **Bridged asset provenance** for every listed asset network, with the route and its security configuration over time.
- **Every treasury bridge transfer** with both legs, attestation or proof, fees and time in transit.
- **In-transit balances** reconciled daily against open bridge transfers.
- **Bridge incident responses:** what was paused, which balances were exposed, and what customers were told.

## What This Means for the System You Build

- **Treat each rollup as its own chain** with a finality rule tied to its settlement layer, and credit deposits at L1 finality of the batch.
- **Record each rollup's stage, keyholders and exit window,** dated, and disclose them in the custody risk disclosure.
- **Hold inventory per chain** and size the in-transit float to the slowest rebalancing path you rely on.
- **Prefer issuer burn-and-mint for stablecoins** over third-party bridges, and list bridged tokens as different assets from native ones.
- **Read and watch bridge security configurations,** and pause a route when they change.
- **Plan for sequencer outages** on every rollup you support, with status messaging and withdrawal fallbacks.
- **Screen deposits against known bridge-hack addresses,** because stolen funds come to exchanges to be cashed out.

## References

**Regulators and guidance**

- [OFAC: Recent actions, April 14, 2022](https://ofac.treasury.gov/recent-actions/20220414), the Ethereum address added to the Lazarus Group entry

**Standards and protocols**

- [EIP-4844: Shard blob transactions](https://eips.ethereum.org/EIPS/eip-4844), blob size, original target and maximum, the blob base fee and retention
- [Ethereum: Optimistic rollups](https://ethereum.org/en/developers/docs/scaling/optimistic-rollups/), the sequencer, direct submission to the rollup contract and the seven-day challenge period
- [Ethereum: ZK-rollups](https://ethereum.org/en/developers/docs/scaling/zk-rollups/), no withdrawal delay after proof acceptance, the operator and forced exits
- [Ethereum: Pectra](https://ethereum.org/en/roadmap/pectra/), the blob target and maximum raised to 6 and 9
- [Ethereum: Fusaka](https://ethereum.org/en/roadmap/fusaka/), blob-parameter-only forks
- [Ethereum: History of forks](https://ethereum.org/en/ethereum-forks/), Dencun on March 13, 2024

**Vendor documentation**

- [Optimism: Withdrawal flow](https://docs.optimism.io/stack/transactions/withdrawal-flow), initiate, prove and finalize, dispute games and the 7-day challenge period
- [Arbitrum: L2-to-L1 messaging](https://docs.arbitrum.io/how-arbitrum-works/deep-dives/l2-to-l1-messaging), `sendTxToL1`, assertions, the Outbox and the dispute window
- [Base: Connecting to Base](https://docs.base.org/base-chain/quickstart/connecting-to-base), chain ID 8453 and the sequencer endpoint
- [Base: Contracts](https://docs.base.org/base-chain/network-information/base-contracts), operating roles as EOAs managed by Coinbase Technologies
- [ETHBEAT: Base](https://ethbeat.org/scaling/projects/base), Stage 1, the sequencer and Base Multisig 1, fault proofs since October 30, 2024, the added proof arms, the 5-day challenge period and no exit window
- [ETHBEAT: Stages](https://ethbeat.org/stages), the Stage 0, 1 and 2 requirements and the rename from L2BEAT
- [Circle: CCTP](https://developers.circle.com/cctp), burn-and-mint, attestation and hooks
- [Circle: CCTP required block confirmations](https://developers.circle.com/cctp/required-block-confirmations), standard and fast waits per chain
- [Circle: CCTP fees](https://developers.circle.com/cctp/concepts/fees), fast transfer fees by source chain, the fast transfer allowance and free standard transfers
- [Circle: USDC contract addresses](https://developers.circle.com/stablecoins/usdc-contract-addresses), bridged USDC.e not issued by Circle
- [LayerZero: Message security](https://docs.layerzero.network/v2/concepts/protocol/message-security), DVNs per pathway and X-of-Y-of-N configuration
- [LayerZero v2 documentation](https://docs.layerzero.network/v2), the OFT standard

**In practice**

- [Chainalysis: Cross-chain bridge hacks in 2022 (August 2, 2022)](https://www.chainalysis.com/blog/cross-chain-bridge-hacks-2022/), $2 billion across 13 hacks, 69% of funds stolen and about $1 billion by North Korea-linked hackers
- [CertiK: Wormhole bridge exploit incident analysis](https://www.certik.com/resources/blog/wormhole-bridge-exploit-incident-analysis), the 120,000 wETH mint, the unchecked sysvar account and Jump's replacement (secondary)
- [Halborn: Explained, the Ronin hack (March 2022)](https://www.halborn.com/blog/post/explained-the-ronin-hack-march-2022), amounts, the 5-of-9 threshold, the unrevoked Axie DAO allowlist and discovery six days later (secondary)
- [Mandiant: Dissecting the Nomad bridge hack](https://cloud.google.com/blog/topics/threat-intelligence/dissecting-nomad-bridge-hack), the zero trusted root, `process()`, copycats and funds returned (secondary)
- [Decrypt: Multichain shutters operations (July 14, 2023)](https://decrypt.co/148559/multichain-shutters-operations-chinese-police-take-ceo-sister-custody), the CEO's detention, server access and assets moved from MPC wallets (press)
