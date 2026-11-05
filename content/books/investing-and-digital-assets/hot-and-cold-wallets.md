+++
title = "Hot, Warm & Cold Wallets"
nav_title = "Hot & Cold Wallets"
description = "Exchange wallet tiers: hot wallet limits and sizing, rebalancing, cold storage ceremonies, withdrawal liquidity, wallet inventory and treasury reconciliation."
category = "Investing & Digital Assets Industry"
order = 2544
part = "Crypto Exchanges"
tags = ["crypto", "exchanges", "custody", "wallets", "cold-storage", "reconciliation"]
+++

An exchange keeps customer coins in tiers because no single kind of wallet can be both fast and safe. A hot wallet signs automatically, in seconds, so it can pay withdrawals around the clock, and anything that can sign automatically can be made to sign for an attacker. A cold wallet's keys never touch a networked machine, so stealing from it means compromising people, places and procedures at once, and moving coins out of it takes hours. Between them sits warm storage, signed by people on approval. The tiering is a float-management problem with a security constraint: keep just enough in the hot wallet to pay the next stretch of withdrawals, refill it before it runs dry, and keep everything else where it's slow and hard to reach.

This chapter covers what each tier is, how exchanges and custody vendors describe theirs, hot wallet limits and how to size them with worked numbers, rebalancing between tiers and why the cold-to-hot move is the most dangerous routine operation an exchange performs, cold storage ceremonies, withdrawal liquidity under stress, the wallet and address inventory, and the daily treasury reconciliation that proves the wallets and the ledger agree. Signing technology (multisig, MPC, HSMs, enclaves) is [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing); the withdrawal pipeline that draws on the hot wallet is [Deposits & Withdrawals](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals); the ledger it reconciles to is [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture); qualified custody for institutions is [Qualified Custody](/books/investing-and-digital-assets/qualified-custody).

## How the Platforms Do It

What exchanges, custodians and vendors disclose about wallet tiers, as of November 2026:

| Company | Tiers and limits, as disclosed | Keys and facilities | Assurance and insurance |
| --- | --- | --- | --- |
| **BitGo** | Custody wallets are all cold; qualified custody "100% supported by cold storage"; hot wallets only for self-custody clients | 2-of-3 keys (user, backup, BitGo) for multisig and MPC; in custody wallets BitGo holds all three | Up to $250 million of insurance for assets in qualified custody; withdrawals from custody within a 24-hour SLA |
| **Coinbase** | "Generally seek to hold no more than 2% of custodied assets in hot wallets at any given time" | Cold wallet key material stored "at facilities within the United States and internationally" | Holds corporate assets in excess of the total in its hot wallets; a commercial crime policy with a one-year term and no automatic renewal |
| **Fireblocks** | Hot, warm and cold defined by where the third MPC key share sits: an API co-signer (automated), a networked phone (warm), or an air-gapped phone approving by two-way QR codes (cold); a workspace is hot and warm, or cold only | MPC-CMP key shares; Admin Quorum for sensitive workspace changes | Vendor platform; the client sets policy |
| **Gemini** | No split published | Not published | SOC 1 Type 2 and SOC 2 Type 2 |
| **iShares Bitcoin Trust** (custodied by Coinbase Custody) | Vault Balance in segregated cold addresses; Trading Balance omnibus at the prime execution agent, swept back daily; vault to trading can take up to 24 hours | Keys in cold storage in undisclosed US and European facilities; no single individual has access to full private keys | The custodian's crime policy is shared across all its customers |
| **Kraken** | "Advanced cold storage and hot wallet solutions"; no split published | Infrastructure in caged facilities under 24/7 armed guard | ISO/IEC 27001:2022, SOC 2 Type 1, periodic proof of reserves with an external auditor |

And the counterexample on the public record. FTX told third parties it had a "standard hot wallet/cold wallet setup" with a two-day trading float in hot wallets; the debtors' first interim report found virtually all crypto in hot wallets, little cold storage outside Japan (where cold storage was required), no multisig or MPC, private keys to over $100 million of ETH in plain text on a server, keys to billions in AWS Secrets Manager or a password vault, and no backups. The intended design FTX described is exactly the one in this chapter. It just didn't exist.

Bank regulators' joint statement of July 14, 2025 on crypto-asset safekeeping describes the same choices from the supervisor's side: control of the private keys is the essence of safekeeping, cold, hot and hybrid storage are each a risk decision, key generation, storage and destruction need controls, and a bank stays responsible for what a sub-custodian does.

## The Tiers

| Tier | Who or what signs | Time to move coins out | Holds | Fails by |
| --- | --- | --- | --- | --- |
| **Deposit addresses** | Sweep service, under policy | Minutes | Customer deposits until swept | Stranded tokens, dust |
| **Hot** | An automated signer under a policy engine, online | Seconds | The next hours of withdrawals | Remote compromise of the signer, the policy or the infrastructure around it |
| **Warm** | People approving on networked devices, under quorum | Minutes to hours | A day or two of peak outflow | Phishing or coercion of approvers; a lying UI |
| **Cold** | People with offline devices in controlled locations, under quorum | Hours to a day | Everything else | Insider collusion, ceremony failures, lost backups, a compromised signing interface |
| **Staking** | Validator or delegation keys, separate from spending keys | The chain's unbonding period | Staked customer assets | Slashing, unbonding delays ([Staking as a Product](/books/investing-and-digital-assets/staking)) |

Two rules cut across the tiers. **Hot wallet losses are the firm's problem first:** Coinbase states that it holds corporate assets in excess of everything in its hot wallets, so a total loss of the hot tier is covered by the firm without touching customer coins. That makes the hot wallet limit a capital decision, not just a security one. **Tier is about the signing path, not the address:** the same address can be hot under one policy and cold under another, which is why Fireblocks defines its tiers by where the approving key share lives.

## Hot Wallet Limits and Sizing

### Floor, target, ceiling

Each hot wallet, per asset and chain, carries three numbers:

- **Ceiling:** the most it may hold. Above it, the excess moves to warm or cold automatically. Coinbase's 2% of custodied assets is a ceiling across all hot wallets.
- **Target:** what a refill brings it back to.
- **Floor:** the level that triggers a refill, set so the refill arrives before the wallet runs out at a high but plausible withdrawal rate.

The floor is the one that takes work. It's the outflow you expect during the time a refill takes:

> floor = peak outflow rate × refill lead time × safety factor

### Worked numbers: sizing a bitcoin hot wallet

Take an exchange with 100,000 BTC of customer bitcoin, a 2% ceiling, and withdrawal history that shows a normal day of 1,500 BTC out, a busy hour of 300 BTC, and deposits running at 80% of withdrawals over a day. Warm storage refills the hot wallet in about one hour (a quorum of approvers on call); cold refills warm in about 24 hours (a scheduled ceremony).

| Number | Calculation | Result |
| --- | --- | --- |
| Ceiling (hot) | 2% × 100,000 BTC | 2,000 BTC |
| Floor (hot) | 300 BTC/hour × 1 hour refill × 2 safety | 600 BTC |
| Target (hot) | Floor plus 4 busy hours of outflow: 600 + 4 × 300 | 1,800 BTC |
| Warm holding | 2 busy days, net of deposits: 2 × (1,500 × 0.2 net) plus a stress buffer of one day at three times normal outflow with no deposits: 600 + 4,500 | 5,100 BTC |
| Cold | The rest | About 93,100 BTC, less what sits in deposit addresses |

Check against the ceiling: the target of 1,800 BTC is under 2,000, so normal operation stays inside the limit, and a refill from 600 to 1,800 is 1,200 BTC from warm. The warm figure is the interesting one: it's sized for a bad day, not a normal one, because cold storage can't respond inside a day. If the stress case (4,500 BTC out in a day with nothing coming in) happens, the hot wallet is refilled from warm about four times, and the cold tier is asked for a scheduled ceremony to refill warm, which is exactly the kind of day a ceremony should be planned for, not improvised.

For an account-model chain, each hot wallet needs one more number per sending address: the native coin float for gas, monitored like any other balance, with its own floor and refill ([Sweeping and Gas Funding](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#sweeping-and-gas-funding)).

### Per-transaction and velocity limits

The balance limit caps what a hot wallet compromise can take; velocity limits cap how fast. A policy engine in front of the hot signer enforces per-transaction maximums, per-destination and per-hour totals, and an allowlist of destination types (customer withdrawal addresses checked by the pipeline, the exchange's own warm and cold addresses, approved counterparties). Anything outside the policy doesn't sign; it goes to warm approval. Turnkey's enclave policy engine, Fireblocks' policy rules and BitGo's custody operator review are three vendor forms of the same control: decide on the decoded transaction, not on a hash.

## Rebalancing Between Tiers

### Downhill is easy, uphill is dangerous

Moving coins down a tier (hot to warm, warm to cold) can be automated, because the destination is fixed: the policy allows the hot signer to send to the exchange's own cold addresses and nowhere else new, so an attacker who triggers it only moves coins somewhere safer. Moving coins up a tier (cold to warm, warm to hot) is the opposite: it brings large amounts toward the automated path, it happens on a schedule an insider or an attacker can learn, and it's signed by people looking at a screen.

Bybit's February 21, 2025 loss, about $1.5 billion and the largest crypto theft on record, happened during exactly that operation. The FBI attributed it to North Korea. During a routine transfer from an ETH multisig cold wallet to a hot wallet, Bybit's signers loaded the Safe{Wallet} web interface, whose JavaScript in Safe's cloud storage had been modified to activate only for Bybit's cold wallet; investigators traced it to a compromised Safe developer machine. The interface showed a normal transfer; the transaction the signers approved changed a `call` into a `delegatecall` to an attacker contract, handing it control of the multisig, and over 400,000 ETH and stETH moved out. The hardware signers displayed a hash, the quorum approved it, and nothing in the path decoded what was actually being signed. The full incident is in [Exchange Security & Hacks](/books/investing-and-digital-assets/exchange-security).

What a cold-to-hot move needs, from that record:

- **The destination is fixed in advance.** The cold policy allows sends only to the exchange's own warm or hot addresses, from an allowlist changed only by its own quorum.
- **Independent decoding.** Each signer sees the decoded transaction (destination, amount, operation type) from a stack separate from the one that built it, and the signing device shows the same fields, not just a hash.
- **Operation-type rules.** On contract wallets, deny `delegatecall` and any change to owners, threshold, modules or guards in the same flow as a transfer.
- **Simulation** of the transaction against current chain state before signing, on infrastructure not shared with the builder.
- **Size and cadence.** Many moderate refills on a varying schedule rather than one large refill at a predictable time.

### Rebalancing across chains

The same asset on several chains (USDC on Ethereum, Solana and Base, for example) is one instrument and several asset networks, and withdrawals don't arrive in proportion to holdings. An exchange rebalances between chains through the issuer's burn-and-mint service where one exists (Circle's CCTP waits for the source chain's finality before minting on the destination), or by redeeming on one chain and minting on another with the issuer. Each cross-chain move is a treasury transfer with in-transit state on both ledgers, covered in [Layer 2s, Bridges & Cross-Chain](/books/investing-and-digital-assets/layer-2s-and-bridges).

## Cold Storage Ceremonies

A ceremony is a scripted, witnessed procedure for generating keys, signing from cold storage, rotating keys or retiring a wallet. The discipline is the same as an HSM key ceremony in card payments ([Key Ceremonies, Split Knowledge and Dual Control](/books/payments/key-management#key-ceremonies-split-knowledge-and-dual-control)), with two differences: a lost crypto key is lost money with no issuer to reissue it, and a cold signing ceremony is routine operations, not a once-a-year event.

What a ceremony record holds:

- **Purpose and script:** key generation, signing a named transaction, rotation, recovery test, decommissioning; the step-by-step script and its version.
- **People and roles:** participants, the quorum required, witnesses, and that no one holds enough shares or keys to act alone. IBIT's custodian represents that no single individual has access to full private keys.
- **Place and equipment:** the facility, the air-gapped devices by serial number, their tamper-evident seals before and after, and the software build used (with its hash).
- **Entropy and backups:** for seed-based keys, BIP-39 encodes 128 to 256 bits of entropy as 12 to 24 words; backups (seed shares, key shares, encrypted copies) are produced, sealed and sent to separate locations, and each location is recorded.
- **What was signed or produced:** the transaction's decoded fields and hash, or the public keys and addresses created, and their entry in the wallet inventory.
- **Exceptions:** anything that deviated from the script and who approved it.

Two kinds of ceremony are easy to skip and shouldn't be. **Recovery tests** restore a wallet from its backups on clean equipment and sign a test transaction, on a schedule, because a backup never restored is a hope. **Decommissioning** retires keys deliberately, moves the funds, and keeps watching the old addresses for deposits, since customers and counterparties will keep sending to them for years.

## Withdrawal Liquidity

The hot wallet is sized for a bad day; a run is worse. When withdrawals exceed what the hot and warm tiers can pay, three things happen in order: withdrawals queue behind refills, cold ceremonies are scheduled (hours to a day each), and customers notice. Coinbase's 10-K warns that "similar to traditional financial institutions, we may experience temporary process-related withdrawal delays." A delay because coins are in cold storage is safe; a delay because coins aren't anywhere is insolvency, and from the outside they look the same.

That's why an exchange should be able to say, per asset, how much it can pay within an hour, a day and a week, and to publish the expected time when withdrawals queue. The queue itself needs a rule: first come, first served by request time within each asset, with large withdrawals that need a cold refill held to their own schedule so they don't block thousands of small ones. And the liquidity plan needs the inventory below, because "how much can be paid today" is a sum over wallets with tier, chain and signing time.

## The Wallet and Address Inventory

Every wallet the exchange controls is a row with an owner, and a wallet that isn't in the inventory doesn't exist as far as reconciliation is concerned, which is how coins get lost. The inventory holds, per wallet:

- **Identity:** chain, address or account, the asset networks it holds, and for HD wallets the account-level xpub.
- **Purpose and tier:** deposit, hot, warm, cold, omnibus, staking; customer or corporate; the legal entity that owns it.
- **Signing:** key scheme (multisig, MPC, HSM), quorum, the signer roles, the policy version in force, where each key or share is held.
- **Limits:** ceiling, target and floor per asset, and velocity limits.
- **Lifecycle:** created (by which ceremony), active, draining, retired, with the date the old addresses stop being watched (ideally never).

The address side is larger: every deposit address ever issued, which account it belongs to, and which wallet derives or controls it. A deposit to an address issued six years ago to a closed account still has to land somewhere, and the inventory is how the watcher knows the address is theirs.

## Treasury Reconciliation

The coverage check in [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture#one-invariant) is the headline; the daily reconciliation is the itemized version that explains every difference. For each instrument, at a stated block height per chain:

| Line | Source |
| --- | --- |
| On-chain balances of every customer wallet, by tier and chain | The chain, from two independent sources |
| Minus withdrawals broadcast but not yet in a block at that height | The withdrawal pipeline (posted on broadcast, still in the wallet on chain) |
| Minus deposits in a block but not yet final | The deposit pipeline (on chain, not yet posted) |
| Plus customer assets staked, by validator or provider | The staking ledger and the chain |
| Plus customer assets at outside venues and sub-custodians | Their statements |
| Equals customer liabilities | The ledger: the sum of customer lines |
| Separately: corporate wallets and their balances | The chain and the corporate ledger |

### Worked numbers: one day's bitcoin reconciliation

| Line | BTC |
| --- | --- |
| Hot wallets on chain (block 925,000) | 1,742.31 |
| Warm wallets | 5,088.90 |
| Cold wallets | 92,950.00 |
| Deposit addresses (unswept) | 214.55 |
| Minus withdrawals broadcast, not yet in a block | −38.20 |
| Minus deposits in a block, not yet final | −12.75 |
| Plus at an outside venue (OTC settlement account) | 25.00 |
| **Customer assets accounted for** | **99,969.81** |
| Ledger: customer balances (26.95 of it held for approved withdrawals) | 99,969.81 |
| **Customer liabilities** | **99,969.81** |
| **Difference** | **0.00** |

The two withdrawal amounts are treated differently on purpose. The 38.20 BTC already broadcast has posted (the ledger debits on broadcast) but isn't in a block at height 925,000, so the hot wallet still shows it and it comes off the asset side. The 26.95 BTC approved or in signing hasn't posted and hasn't left, so it's in both the wallet and the customer balances (as a hold) and needs no adjustment. A difference that isn't zero becomes a break with an owner: a deposit credited twice, a sweep posted to the wrong wallet account, a recovery not yet booked, a fee posted in the wrong asset, or (the one that matters) coins that are gone. Breaks follow the core model's `recon_breaks`, with the reasoning in the Payments volume's [Breaks](/books/payments/ledger-and-reconciliation#breaks) and the Banking & Lending volume's [Daily Reconciliation](/books/banking-and-lending/program-ledgers#daily-reconciliation), which is the same discipline applied to an omnibus bank account.

## How to Build It

These are deltas against the core data model in [The Investing & Digital Assets Business](/books/investing-and-digital-assets/investing-business#the-core-data-model) (`wallets` with `purpose`, chain, key scheme and owner legal entity; `addresses`; `onchain_transactions`; `reconciliations` and `recon_breaks`), and against [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture#how-to-build-it), which added `wallets.holds` and `ledger_wallet_proofs`. This chapter adds limits per wallet and asset, where keys and shares are held, rebalancing transfers, ceremonies, and the itemized treasury snapshot.

```sql
ALTER TABLE wallets
  ADD COLUMN quorum_required SMALLINT,
  ADD COLUMN quorum_of       SMALLINT,
  ADD COLUMN policy_version  TEXT,               -- the signing policy in force
  ADD COLUMN xpub            TEXT,               -- account-level, watch-only
  ADD COLUMN created_by_ceremony_id UUID;
-- purpose (hot, warm, cold, deposit, omnibus, staking, gas) is the tier; status (active, receive_only,
-- retired) is the lifecycle: a draining wallet is receive_only and is still watched once retired.

CREATE TABLE wallet_limits (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  wallet_id         UUID NOT NULL REFERENCES wallets (id),
  asset_network_id  UUID NOT NULL REFERENCES asset_networks (id),
  floor_base_units  NUMERIC(78,0) NOT NULL,
  target_base_units NUMERIC(78,0) NOT NULL,
  ceiling_base_units NUMERIC(78,0) NOT NULL,
  max_per_tx        NUMERIC(78,0),
  max_per_hour      NUMERIC(78,0),
  approved_by       UUID NOT NULL,
  effective_from    TIMESTAMPTZ NOT NULL,
  CHECK (floor_base_units <= target_base_units AND target_base_units <= ceiling_base_units),
  UNIQUE (wallet_id, asset_network_id, effective_from)
);

CREATE TABLE key_holdings (                     -- where each key or share lives, never the key itself
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  wallet_id     UUID NOT NULL REFERENCES wallets (id),
  share_label   TEXT NOT NULL,                  -- 'user', 'backup', 'bitgo', 'share-2-of-3', ...
  holder_role   TEXT NOT NULL,                  -- a role, not a person
  location      TEXT NOT NULL,                  -- facility code or HSM cluster
  form          TEXT NOT NULL CHECK (form IN ('hsm', 'enclave', 'air_gapped_device', 'sealed_backup', 'mpc_node')),
  status        TEXT NOT NULL CHECK (status IN ('active', 'rotated', 'destroyed')),
  last_verified_at TIMESTAMPTZ,                 -- the last recovery test that used it
  UNIQUE (wallet_id, share_label, location)
);

CREATE TABLE rebalance_transfers (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  asset_network_id       UUID NOT NULL REFERENCES asset_networks (id),
  from_wallet_id         UUID NOT NULL REFERENCES wallets (id),
  to_wallet_id           UUID NOT NULL REFERENCES wallets (id),
  direction              TEXT NOT NULL CHECK (direction IN ('down', 'up', 'lateral', 'cross_chain')),
  amount_base_units      NUMERIC(78,0) NOT NULL CHECK (amount_base_units > 0),
  trigger                TEXT NOT NULL CHECK (trigger IN ('above_ceiling', 'below_floor', 'scheduled', 'manual')),
  ceremony_id            UUID,                  -- required for up moves out of cold
  decoded_summary        JSONB NOT NULL,        -- destination, amount, operation type, as each signer saw it
  simulation_result      JSONB,
  onchain_transaction_id UUID REFERENCES onchain_transactions (id),
  status                 TEXT NOT NULL CHECK (status IN ('planned', 'approving', 'signed', 'broadcast', 'final', 'failed', 'canceled')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (direction <> 'up' OR ceremony_id IS NOT NULL OR trigger = 'below_floor')
);

CREATE TABLE ceremonies (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  purpose        TEXT NOT NULL CHECK (purpose IN ('key_generation', 'signing', 'rotation', 'recovery_test', 'decommission')),
  script_version TEXT NOT NULL,
  facility       TEXT NOT NULL,
  software_hash  TEXT NOT NULL,
  scheduled_at   TIMESTAMPTZ NOT NULL,
  completed_at   TIMESTAMPTZ,
  outcome        TEXT CHECK (outcome IN ('completed', 'aborted', 'completed_with_exceptions')),
  exceptions     JSONB
);

CREATE TABLE ceremony_participants (
  ceremony_id   UUID NOT NULL REFERENCES ceremonies (id),
  person_id     UUID NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('key_holder', 'witness', 'operator', 'security')),
  device_serial TEXT,
  seal_before   TEXT,
  seal_after    TEXT,
  PRIMARY KEY (ceremony_id, person_id, role)
);

CREATE TABLE treasury_snapshots (               -- the itemized lines behind one reconciliations row
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  reconciliation_id UUID NOT NULL REFERENCES reconciliations (id),
  instrument_id     UUID NOT NULL REFERENCES instruments (id),
  line              TEXT NOT NULL CHECK (line IN ('wallet_onchain', 'withdrawal_not_in_block', 'deposit_not_final',
                      'staked', 'outside_venue', 'ledger_customer', 'corporate')),
  wallet_id         UUID REFERENCES wallets (id),
  chain_id          UUID REFERENCES chains (id),
  block_number      BIGINT,
  amount_base_units NUMERIC(78,0) NOT NULL,
  source_ref        TEXT NOT NULL                 -- the watcher snapshot, statement or ledger query
);
```

The limits drive two jobs. A **downhill job** watches `ledger_wallet_proofs` against each hot wallet's ceiling and proposes a `rebalance_transfers` row (`down`, `above_ceiling`) to a fixed cold or warm destination, which the hot policy can sign without a human. An **uphill job** proposes refills when a hot wallet drops below its floor; the row waits in `approving` for the warm quorum, and a move out of cold carries a `ceremony_id`. The check constraint makes an unexplained up-move impossible to record (and a trigger that reads the source wallet's tier requires the ceremony whenever the source is cold), and the `decoded_summary` stores what each signer was shown, so after an incident the question "what did they think they were signing" has an answer. `key_holdings` records where shares and backups are, by role and facility, never key material, and its `last_verified_at` turns recovery tests into a column someone can query.

## Auditing

What a custody examiner, SOC auditor or incident reviewer asks for:

- **The wallet inventory** on any date, with purpose, customer or corporate, legal entity, quorum, policy version and status, and the ceremony that created each wallet.
- **Limits and breaches:** every limit in force and its approver, and every time a hot wallet was above its ceiling or below its floor, for how long, and why.
- **Every rebalance,** with direction, trigger, approvers, the decoded summary and simulation, the ceremony if any, and the on-chain transaction.
- **Ceremony records:** scripts, participants, devices and seals, software hashes, exceptions, and the schedule of recovery tests with results.
- **Key holdings:** where every key or share is held by role and facility, every rotation and destruction, and evidence no individual could sign alone.
- **Daily treasury reconciliations** per instrument with every line's source, every break with its owner and resolution, and corporate wallets reported separately.
- **Insurance:** the policy, its limits, whether limits are shared with other customers, and its renewal date (Coinbase's crime policy runs one year without automatic renewal).

## What This Means for the System You Build

- **Size the hot wallet from refill lead time and peak outflow,** with a floor, target and ceiling per asset and chain, and keep the ceiling a capital decision the firm can cover.
- **Size warm for a bad day,** because cold can't respond inside one.
- **Automate downhill, guard uphill:** fixed destinations, independent decoding, operation-type rules and simulation for every move toward the hot path.
- **Ceremonies are records,** with scripts, people, devices, seals, software hashes and exceptions, and recovery tests on a schedule.
- **Every wallet is in the inventory,** retired ones included, and old addresses stay watched.
- **Reconcile daily, itemized,** per instrument at a block, with in-transit, staked and outside-venue lines, and every break owned.
- **Customer and corporate wallets apart,** in the inventory, on chain and in the reconciliation.

## References

**Regulators and guidance**

- [Federal Reserve, FDIC and OCC: Crypto-asset safekeeping by banking organizations (July 14, 2025)](https://www.federalreserve.gov/newsevents/pressreleases/bcreg20250714a.htm), control of keys as safekeeping, cold, hot and hybrid storage, key generation and destruction, and sub-custodian responsibility ([statement PDF](https://www.federalreserve.gov/newsevents/pressreleases/files/bcreg20250714a1.pdf))

**Filings**

- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), no more than 2% of custodied assets in hot wallets, cold key material in US and international facilities, corporate assets above hot wallet totals, the one-year crime policy, and temporary withdrawal delays
- [BitGo Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1740604/000174060426000020/btgo-form10xk.htm), qualified custody fully in cold storage and up to $250 million of insurance
- [iShares Bitcoin Trust ETF: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1980994/000143774926006058/bit20251231_10k.htm), Vault and Trading Balances, cold keys in undisclosed US and European facilities, no individual with full keys, the 24-hour move, and shared crime coverage

**Courts and enforcement**

- [In re FTX Trading Ltd., First Interim Report of John J. Ray III on Control Failures (Doc. 1242-1)](https://storage.courtlistener.com/recap/gov.uscourts.deb.188450/gov.uscourts.deb.188450.1242.1.pdf), the claimed hot/cold setup and two-day float, crypto virtually all in hot wallets, Japan's cold storage, plain-text and cloud-stored keys, and no backups
- [FBI: North Korea responsible for the $1.5 billion Bybit hack (PSA 250226)](https://www.ic3.gov/PSA/2025/PSA250226), attribution and laundering across chains

**Standards and protocols**

- [BIP-39: Mnemonic code for generating deterministic keys](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki), 128 to 256 bits of entropy as 12 to 24 words

**Vendor documentation**

- [BitGo: Wallet types](https://developers.bitgo.com/concepts/wallet-types), 2-of-3 keys, custody wallets all cold, and the 24-hour SLA
- [Circle: Required block confirmations](https://developers.circle.com/cctp/required-block-confirmations), source-chain finality before a cross-chain mint
- [Fireblocks: Capabilities](https://developers.fireblocks.com/docs/capabilities), hot, warm and cold by key-share location, and Admin Quorum
- [Gemini: Security](https://www.gemini.com/security), SOC 1 Type 2 and SOC 2 Type 2
- [Kraken: Security](https://www.kraken.com/features/security), cold storage and hot wallets, physical security, ISO 27001 and SOC 2 Type 1
- [Turnkey: Architecture](https://whitepaper.turnkey.com/architecture), an enclave policy engine deciding on parsed transactions before signing

**In practice**

- [BleepingComputer: Lazarus hacked Bybit via a breached Safe{Wallet} developer machine](https://www.bleepingcomputer.com/news/security/lazarus-hacked-bybit-via-a-breached-safe-wallet-developer-machine/), the modified interface JavaScript targeting Bybit's cold wallet during a cold-to-hot transfer, over 400,000 ETH and stETH, and Safe's remediations
- [Rekt: Not so Safe](https://rekt.news/not-so-safe), the `call` turned into a `delegatecall` to an attacker contract
