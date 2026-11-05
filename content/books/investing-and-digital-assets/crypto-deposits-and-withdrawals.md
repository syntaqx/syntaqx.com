+++
title = "Deposits & Withdrawals"
description = "Moving crypto in and out of an exchange: deposit addresses and tags, confirmation policy per chain, reorgs, sweeps and gas, withdrawal pipelines and recovery."
category = "Investing & Digital Assets Industry"
order = 2543
part = "Crypto Exchanges"
tags = ["crypto", "exchanges", "deposits", "withdrawals", "confirmations", "travel-rule"]
+++

Deposits and withdrawals are where an exchange's ledger meets the chain, and where nearly every irreversible mistake happens. A deposit credited too early can vanish in a reorganization after the customer has traded it away; a deposit to the right address on the wrong chain can sit in a wallet nobody watches; a withdrawal signed to the wrong address, or signed twice, is gone. The chain offers no chargeback and no return code. Everything that protects the exchange and its customers is in the pipeline the exchange builds around the chain: how it assigns addresses, how long it waits, when it sweeps, how it pays gas, what it checks before it signs, and what it does when a transaction gets stuck.

This chapter covers address generation per customer and memo and tag chains, confirmation policies per chain with the finality rule behind each, crediting and reorg handling, sweeping and gas funding with worked numbers, the withdrawal pipeline as a state machine (risk checks, allowlists, holds, batching, nonce management, stuck transactions and fee bumping), wrong-network deposits and recovery, and where the Travel Rule hooks in. The ledger it posts to is [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture); the wallets the coins move between are [Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets). Chain mechanics (fee markets, finality, reorgs) are explained in [Blockchains for Platform Engineers](/books/investing-and-digital-assets/blockchains-for-engineers), and the account-level view of crypto transfers in [Funding & Account Transfers](/books/investing-and-digital-assets/funding-and-transfers).

## How the Platforms Do It

What exchanges and custody vendors publish about moving coins in and out, as of November 2026:

| Platform | Deposit side | Withdrawal side |
| --- | --- | --- |
| **Binance** | Network chosen by the customer must match the sending platform's; memo required on some networks and tag for XRP or the deposit "cannot be detected"; a wrong network means funds "might be lost and cannot be recovered" | Proof of reserves covers liabilities; withdrawal policy not detailed on the deposit pages |
| **BitGo** | Every wallet is 2-of-3 (user, backup, BitGo key); Ethereum receive addresses are forwarder contracts whose ERC-20 balances BitGo can consolidate with one signature (`flushForwarderTokens`); the BitGo-key address is the gas tank | Custody wallets are all cold; on-chain withdrawals from custody completed within a 24-hour SLA after verification and review |
| **Circle** (CCTP) | Publishes the blocks it waits for per chain: hard finality, and a faster soft-finality option on some chains | Burn-and-mint across chains, attested after the source chain's finality |
| **Coinbase** | Trading entities hold customer crypto in omnibus wallets with a ledger; custody entities in dedicated addresses | Discloses that it may "experience temporary process-related withdrawal delays"; reimbursed retail customers socially engineered into sending funds after its 2025 support-data theft |
| **Fireblocks** | Each asset wallet has at least one deposit address; in retail omnibus setups, a completed deposit to an end-client vault triggers a sweep to the omnibus vault | Gas Station auto-fuels a vault with the base asset when a deposit or withdrawal is detected; hot, warm and cold defined by where the approving key share sits |
| **Gemini** | Customer custodial funds in segregated bank accounts | Address allowlisting restricts withdrawals to approved addresses; 2FA required for withdrawals |
| **Kraken** | Bitcoin credited after 3 confirmations; privacy-feature deposits (Litecoin MWEB, Dash PrivateSend, private Aleo transfers) and Zcash block rewards not credited; a published fee table for recovering mistaken deposits | Email confirmation to add a withdrawal address; a global settings time lock |

The shared design is visible across them: **attribution at the address** (or at a tag where the chain makes addresses expensive), **credit at a per-chain finality rule**, **consolidation into shared wallets with a gas float**, and **withdrawals gated by an allowlist and a policy before anything is signed**.

## Deposit Addresses

### One address per customer per network

The exchange needs to know whose deposit just arrived without asking. On chains where addresses are free, the answer is an address per customer per network, generated on demand and never reused across customers.

On Bitcoin and other UTXO chains, the addresses come from a hierarchical deterministic wallet. BIP-32 lets a server holding only an extended public key (xpub) derive receive addresses without being able to spend from them, so the deposit service never holds a private key, and an auditor can be given the same xpub for a watch-only view. The standard warns of one trap: a leaked non-hardened child private key together with the parent xpub reveals the parent private key, which is why BIP-44's path `m/44'/coin'/account'/change/index` hardens the first three levels. BIP-44 also sets a gap limit of 20 unused addresses for discovery during recovery, so an exchange that hands out millions of addresses and sees most of them unused needs its own index of issued addresses rather than relying on wallet discovery. Address derivation and key custody are covered in [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing).

On Ethereum and other account-model chains, there are two patterns:

- **Externally owned accounts per customer.** Each customer gets an address with its own key (derived from an HD seed held by the signing service). Simple to watch; but to sweep an ERC-20 token out, the address needs native ETH for gas first, so every sweep costs two transactions.
- **Forwarder or smart-contract receive addresses.** Each customer gets a contract address that forwards native coin to the main wallet and lets the main wallet pull tokens out. BitGo's Ethereum wallets do this: multiple receive addresses per wallet, ERC-20 consolidation from forwarders "without your signature" using one key, and the gas paid from a gas tank address rather than from each deposit address. Contract addresses can be computed before deployment (CREATE2), so the exchange can show an address and deploy only when funds arrive.

### Memo and tag chains

Some chains make a per-customer address expensive. On the XRP Ledger every account must hold a reserve set aside indefinitely, so the XRPL documentation says the per-address model "is costly" and recommends one address with a **destination tag** per customer instead: a 32-bit unsigned integer carried in the payment. An exchange using tags should enable `RequireDest`, so the ledger rejects a payment with no tag "instead of giving you money you don't know what to do with," and should assign tags in an unpredictable order within each range, checking for collisions with old tags, since sequential tags give customers less privacy. Stellar memos, EOS and BEP2 memos, and the like play the same role; Binance's deposit page warns that on those networks "you must fill in the Memo when making a transfer, or your address cannot be detected."

A missing or wrong tag is the most common recoverable deposit error, because the coins are in the exchange's wallet and only the attribution is missing. Kraken charges the network fee to recover one, and nothing to credit a deposit it simply failed to credit. The address record carries the tag, and the deposit matcher treats address plus tag as the key:

| Chain style | Attribution key | Typical failure |
| --- | --- | --- |
| UTXO (Bitcoin, Litecoin) | Address per customer | Privacy features the watcher can't see; reused addresses |
| Account, EOA per customer (Ethereum, EVM chains) | Address per customer | Tokens stranded without gas to sweep |
| Account, contract per customer | Contract address per customer | Funds sent to the address on a chain where the contract isn't deployed |
| Shared address with tag (XRP, Stellar, some Cosmos chains) | Address plus tag or memo | Missing or mistyped tag |

## Confirmation Policies per Chain

A deposit is credited when the exchange believes the chain won't take it back. Each chain defines that differently, and the exchange's table of rules is one of its most important pieces of configuration.

| Chain | Finality rule | Exchange-relevant numbers |
| --- | --- | --- |
| **Bitcoin** | Probabilistic: each block on top makes a reorg less likely | Kraken credits after 3 confirmations. Since Bitcoin Core 28.0 (October 2, 2024), `mempoolfullrbf` defaults to on, so any unconfirmed transaction can be replaced: zero-confirmation credit is unsafe regardless of whether the sender signaled replaceability |
| **Ethereum** | Checkpoint finality: 12-second slots, 32-slot epochs; a checkpoint is finalized when a later one is justified by votes from two-thirds of staked ETH | Reverting a finalized block costs at least one-third of all staked ETH. JSON-RPC exposes `safe` and `finalized` block tags. Circle waits about 65 blocks, 15 to 19 minutes, for hard finality |
| **Ethereum rollups** (Arbitrum, Base, OP Mainnet) | The sequencer's quick confirmation, then the batch's finality on Ethereum | Circle's hard finality is about 65 Ethereum blocks, 15 to 19 minutes; its soft finality is 1 block, about 8 seconds. Withdrawals from a rollup to Ethereum are a separate, days-long process (below) |
| **Solana** | Commitment levels: processed (may roll back), confirmed (66%+ of stake voted), finalized (31+ confirmed blocks on top) under Tower BFT | Circle waits 32 blocks, about 17 seconds. Under the Alpenglow consensus, live on mainnet-beta since October 21, 2026, confirmed and finalized are the same status |
| **Polygon PoS** | Milestone finality | Circle waits 2 to 3 blocks, about 8 seconds |
| **BNB Smart Chain** | Fast finality | Circle waits 3 blocks, about 2 seconds |
| **Avalanche, Stellar** | Single-block finality | Circle waits 1 block: about 8 seconds on Avalanche, about 5 on Stellar |

Anza's Alpenglow page reports the consensus live on mainnet-beta since October 21, 2026, with TowerBFT retired ([Finality per Chain](/books/investing-and-digital-assets/blockchains-for-engineers#finality-per-chain)); a policy that keys on the `finalized` commitment is correct under both designs, so blocks credited before and after the switch follow one rule. Read the table as the chain's rule plus one vendor's choice, not as the answer. The policy that belongs in an exchange's configuration has three more dimensions.

**Amount bands.** The risk of a reorg is the amount that could be double-spent. A policy that waits the same time for $20 and $2 million of bitcoin is either too slow for the small deposit or too fast for the large one. Banding by value (with the threshold in the asset's fiat value at detection) lets small deposits credit after fewer confirmations and large ones wait for more, or for a second independent source.

**Two stages of credit.** The ledger posts a deposit only at the chain's finality rule; before then a reorg would have to undo a journal entry, and the core model's rule is that nothing posts that a reorg can take back. An exchange that wants customers to trade sooner extends **provisional buying power** against a deposit that has reached a lower, banded threshold: the customer can trade inside the exchange, nothing can leave it, and the exposure is a credit decision with a limit, exactly like an instant ACH deposit at a broker ([Funding & Account Transfers](/books/investing-and-digital-assets/funding-and-transfers)). If the chain reorganizes before finality, the provisional credit disappears and any shortfall it funded is the customer's debt and the exchange's loss to collect, bounded by the limit. My default is a trade threshold by band, provisional credit capped per account, and posting and withdrawal at the chain's finality, always.

**Chain health.** A chain that stops finalizing (Ethereum enters an inactivity leak after more than four epochs without finality), halts, or reorganizes deeper than the policy assumed must pause crediting automatically. A deposit service that keeps crediting by confirmation count while the chain's finality gadget is stalled is relying on the one assumption that just failed.

### Worked numbers: one policy, three deposits

A policy for bitcoin, with provisional credit by band and posting at six confirmations (the exchange's choice; Bitcoin has no protocol finality):

| Band (USD value at detection) | Provisional credit at | Posts and withdrawable at |
| --- | --- | --- |
| Under $10,000 | 1 confirmation | 6 confirmations |
| $10,000 to $1,000,000 | 3 confirmations | 6 confirmations |
| Over $1,000,000 | 6 confirmations, second node agrees | 6 confirmations, second node agrees |

At roughly ten minutes a block, a $500 deposit trades in about 10 minutes and leaves after about an hour; a $50,000 deposit trades in about 30 minutes; a $3 million deposit waits about an hour and a second source before anything. The exchange's maximum exposure to a one-block reorg is the sum of under-$10,000 deposits given provisional credit at one confirmation in the reorged block, which the chain watcher can compute per block and alert on.

## Crediting and Reorgs

### The deposit state machine

| State | Meaning | Ledger |
| --- | --- | --- |
| `detected` | Seen in the mempool or a block, attributed to an account | Nothing posted |
| `confirming` | In a block, below the trade threshold | Nothing posted |
| `credited` | At the trade threshold for its band | Nothing posted; provisional buying power up to the account's limit |
| `final` | At the chain's finality rule | The deposit posts: customer line against the omnibus line naming the wallet; withdrawable |
| `held` | Screening hit, missing Travel Rule data, unsupported token, missing tag, or a frozen account | Posted to suspense, not to the customer |
| `reorged` | Its block left the canonical chain | Nothing to reverse; provisional credit withdrawn; back to `detected` if the transaction is seen again, else `dropped` |
| `dropped` | Gone from the chain and the mempool | Nothing posted; trades funded by provisional credit leave the account short, which is a collection case |
| `returned` | Sent back under the recovery policy | Out of suspense, less the fee |

Allowed transitions: `detected → confirming → credited → final`; any pre-final state `→ reorged`; `reorged → detected | dropped`; any pre-final state `→ held`; `held → credited | final | returned`. A `final` deposit never moves again. The chain watcher drives the confirmation transitions, the screening and Travel Rule services drive `held`, and the ledger posts once, on entry to `final` (or to suspense on entry to `held`), keyed by `(transfer_id, to_status)` so a watcher restart can't post twice.

### Reorg detection

Store the block hash with every block number you act on. On each new head, walk back from the head until the stored hash at some height matches the chain's; every deposit whose stored block hash no longer matches above that height is reorged. Checking only that "the transaction still exists" misses the case where it's included again in a different block, at a different height, possibly with a different outcome. The ingestion side of this, including reading balances at a block and running two sources, is [Chain Data & Indexing](/books/investing-and-digital-assets/chain-data-and-indexing); the hosting side is the Hosting & Cloud volume's [Blockchain Nodes, RPC & Validators](/books/hosting-and-cloud/blockchain-nodes-and-validators).

### A crediting check in code

The confirmation decision is a pure function of the deposit, the policy and the chain's current view, which makes it easy to test against recorded chain histories.

```go tab="Go"
type Stage int

const (
	Confirming Stage = iota
	Credited
	Final
)

type Band struct {
	MaxUSD      int64 // exclusive upper bound in cents; 0 means no bound
	TradeConfs  uint64
	NeedsSecond bool
}

type Policy struct {
	Bands      []Band // ascending by MaxUSD
	FinalByTag bool   // true: use the chain's finalized height
	FinalConfs uint64 // used when FinalByTag is false
}

type View struct {
	Head, Finalized uint64
	SecondAgrees    bool
}

func StageOf(p Policy, blockNumber uint64, valueUSD int64, v View) Stage {
	if blockNumber == 0 || blockNumber > v.Head {
		return Confirming
	}
	confs := v.Head - blockNumber + 1
	final := confs >= p.FinalConfs
	if p.FinalByTag {
		final = blockNumber <= v.Finalized
	}
	band := p.Bands[len(p.Bands)-1]
	for _, b := range p.Bands {
		if b.MaxUSD == 0 || valueUSD < b.MaxUSD {
			band = b
			break
		}
	}
	if band.NeedsSecond && !v.SecondAgrees {
		return Confirming
	}
	if final {
		return Final
	}
	if confs >= band.TradeConfs {
		return Credited
	}
	return Confirming
}
```

```rust tab="Rust"
#[derive(Debug, PartialEq, Eq)]
pub enum Stage { Confirming, Credited, Final }

pub struct Band { pub max_usd: i64, pub trade_confs: u64, pub needs_second: bool } // max_usd 0 = unbounded

pub struct Policy { pub bands: Vec<Band>, pub final_by_tag: bool, pub final_confs: u64 }

pub struct View { pub head: u64, pub finalized: u64, pub second_agrees: bool }

pub fn stage_of(p: &Policy, block_number: u64, value_usd: i64, v: &View) -> Stage {
    if block_number == 0 || block_number > v.head {
        return Stage::Confirming;
    }
    let confs = v.head - block_number + 1;
    let is_final = if p.final_by_tag { block_number <= v.finalized } else { confs >= p.final_confs };
    let band = p
        .bands
        .iter()
        .find(|b| b.max_usd == 0 || value_usd < b.max_usd)
        .unwrap_or_else(|| p.bands.last().expect("policy has bands"));
    if band.needs_second && !v.second_agrees {
        return Stage::Confirming;
    }
    if is_final {
        Stage::Final
    } else if confs >= band.trade_confs {
        Stage::Credited
    } else {
        Stage::Confirming
    }
}
```

The function never moves a deposit backward; reorgs are detected separately from block hashes and reset the deposit's `block_number` to zero, after which the function returns `Confirming` again.

## Sweeping and Gas Funding

### Why sweep

Deposit addresses are for attribution, not storage. The exchange consolidates them into hot or omnibus wallets so withdrawals can be paid from a few addresses, hot-wallet limits can be enforced, and cold storage can be topped up from one place. Fireblocks documents the omnibus pattern directly: on a `COMPLETED` deposit to an end-client vault, "trigger a sweep from the end-client vault account to your omnibus deposits vault account," noting that the move is on chain and pays gas. A sweep changes no customer balance; it moves the asset side of the ledger from one wallet account to another and books the network fee as the firm's expense.

### The gas problem on account chains

An ERC-20 token in an EOA deposit address can't move until the address holds ETH to pay gas, because "gas fees have to be paid in" the native coin and are paid whether or not the transaction succeeds. So a token sweep from an EOA is two transactions: a gas top-up from a gas tank to the deposit address, then the token transfer out. Every top-up leaves dust (unspent ETH) behind, and that dust is in an address that holds customer funds. New York's 2023 custody letter is explicit that when a firm funds transaction costs such as gas for customers, it "should consider these as customer funds"; the safe reading is to track every top-up, recover the dust in later sweeps, and never let gas floats blur into the corporate treasury.

Two designs remove most of the cost. Forwarder contracts (BitGo's model) let the main wallet pull tokens from every receive address with one transaction paid from the gas tank, so deposit addresses never need ETH. Vendor gas stations (Fireblocks' Gas Station) automate top-ups: it "auto-fuels a vault account with the required base asset" when a deposit or withdrawal is detected, from a tank the operator funds.

### Worked numbers: when a sweep is worth it

Ethereum's fee is gas used times (base fee plus priority fee); a plain ETH transfer uses exactly 21,000 gas, and the base fee moves at most 12.5% per block. Assume a token transfer uses 60,000 gas (it varies by token contract), a base fee of 2 gwei, a 0.1 gwei tip, and ETH at $3,000.

| Step | Gas | Cost in ETH | Cost in USD |
| --- | --- | --- | --- |
| Top up the deposit address with ETH | 21,000 | 21,000 × 2.1 gwei = 0.0000441 | $0.13 |
| Sweep the token to the hot wallet | 60,000 | 60,000 × 2.1 gwei = 0.000126 | $0.38 |
| Total for an EOA sweep | 81,000 | 0.0001701 | $0.51 |
| Forwarder pull (assume 50,000 gas) | 50,000 | 0.000105 | $0.32 |

A sweep rule I'd start from: sweep a deposit address when its balance is at least 20 times the sweep cost (so fees stay under 5% of what's moved), or when it's older than a day and above a dust floor, or immediately when a hot wallet needs the liquidity. At these prices, 20 × $0.51 is about $10, so a $5 USDC deposit waits for the next deposit to the same address or for cheaper gas. At a 50 gwei base fee the same sweep costs about $12.50 and the threshold rises to $250; the rule is in gas terms, so it adapts by itself. Sweeps are batched when the base fee is low and never block a withdrawal: a withdrawal is paid from the hot wallet, and the sweep refills the hot wallet later.

### UTXO chains: consolidation, not sweeping

On Bitcoin, the HD wallet already owns every deposit address, so there's nothing to sweep; what accumulates is unspent outputs. Each output spent later costs fee per virtual byte of its input. Assume a native SegWit input of about 68 vbytes: at 5 sat/vB it costs 340 sats to spend, at 100 sat/vB it costs 6,800 sats. An exchange with a million small deposit outputs pays for them whenever it spends them, so it consolidates many inputs into a few outputs in quiet periods when fee rates are low, and keeps enough large outputs that a busy day's withdrawals don't have to spend thousands of small ones at peak rates.

## The Withdrawal Pipeline

A withdrawal is the one operation that can drain the exchange, so it runs through a pipeline where every stage can stop it, and a hold on the customer's balance is placed before any check runs, so the same balance can't be withdrawn twice while the checks are in flight. The hold isn't a journal entry; available balance is the position less open holds ([Reservations & Holds](/docs/building-blocks/reservations-and-holds#where-a-hold-lives)). The journal entry posts when the signed transaction is broadcast, as the core model specifies.

### The withdrawal state machine

| State | Meaning | Ledger |
| --- | --- | --- |
| `requested` | The customer asked; amount, asset, network and address recorded with an idempotency key | Hold amount plus fee against available balance |
| `checking` | Authentication, address and risk checks running | Held |
| `held` | A check wants a human or a timer: new address cooling period, risk review, Travel Rule data, a locked account | Held |
| `approved` | Every check passed; eligible for the next batch | Held |
| `signing` | In a batch, a transaction built and sent to the signer under its policy | Held |
| `broadcast` | Signed and sent to the network; hash recorded | Posts: customer debited for amount plus fee, omnibus line for the hot wallet credited, withdrawal fee to fees, network fee to firm expense; hold released |
| `confirming` | Included in a block, below finality | Posted |
| `completed` | Final on chain | Posted; the transfer completes |
| `replaced` | A fee bump or cancel replaced the transaction; the new hash is linked | Unchanged; follows the replacement |
| `failed` | Included but reverted (a contract call failed); fee paid | Reversing entry for the amount and withdrawal fee; the network fee stays a firm expense |
| `rejected` / `canceled` | Stopped before signing | Hold released; nothing posted |

Allowed transitions: `requested → checking → (held ↔ checking) → approved → signing → broadcast → confirming → completed`; `checking | held | approved → rejected | canceled`; `broadcast | confirming → replaced` (the successor transaction continues from `broadcast`); `confirming → failed`; `confirming → broadcast` on a reorg that drops the block; a transaction that leaves the mempool without landing is rebroadcast or replaced, never re-signed as a new payment, and only a deliberate cancel that lands posts a reversing entry. Once a withdrawal reaches `signing`, a customer cancel can no longer stop it safely; the button disappears.

### The checks

What runs in `checking`, roughly in order of cost:

- **Authentication and session:** a second factor at the time of the withdrawal, not just at login; Gemini requires 2FA for withdrawals by default.
- **Address controls.** An allowlist (Gemini restricts withdrawals to allowlisted addresses; Kraken emails a confirmation before a new withdrawal address can be used, and offers a global settings time lock), a cooling period on newly added addresses, and address validation for the chain: format and checksum, not a known token contract, the right network.
- **Account risk:** recent password, 2FA or email changes, a new device, a recent fiat deposit that could still be returned, velocity against the account's history. The account takeover patterns these defend against are in [Account Security & Fraud](/books/investing-and-digital-assets/account-security#withdrawal-holds-and-allowlists) and the Banking & Lending volume's [Account Takeover](/books/banking-and-lending/account-takeover-and-scams#account-takeover).
- **Destination screening:** sanctions and exposure scoring of the destination address with a blockchain analytics provider, recorded with the provider, list version and result; the program behind it is in the Banking & Lending volume's [Sanctions Screening](/books/banking-and-lending/sanctions-screening).
- **Travel Rule:** if the destination is another virtual asset service provider and the amount is over the threshold, the originator and beneficiary data must go with it (below).
- **Hot wallet liquidity:** if the hot wallet can't cover the withdrawal within its limits, it waits for a refill from warm or cold storage rather than drawing the hot wallet below its floor ([Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets#withdrawal-liquidity)).

Address controls matter more after a data breach than after a hack. Coinbase's May 2025 incident wasn't key theft: a threat actor paid support contractors to pull customer data from internal tools, and used it to socially engineer customers into sending funds. Coinbase estimated the cost at $180 million to $400 million and paid $311.2 million in 2025, much of it reimbursing customers. Address poisoning works the same seam from the other side: a USENIX Security 2025 study counted 270 million attack attempts against 17 million victims on Ethereum and BNB Smart Chain over two years, with at least $83.8 million lost, by planting look-alike addresses in a victim's history. A withdrawal form that autocompletes from transaction history invites it; one that picks from a verified address book doesn't. The exchange side of both is in [Exchange Security & Hacks](/books/investing-and-digital-assets/exchange-security); the scams themselves are the User-Generated Platforms volume's [Crypto Investment Scams](/books/user-generated-platforms/crypto-investment-scams).

### Batching

Batching pays many withdrawals in one transaction. On Bitcoin a transaction can carry many outputs, so a batch of 100 withdrawals pays for one set of inputs and one change output instead of 100 of each, and the exchange typically batches on a timer (every few minutes) or a count. On Ethereum a batch needs a payout contract, and since Fusaka (December 3, 2025) EIP-7825 caps a transaction at 16,777,216 (2^24) gas, which bounds how many transfers one batch transaction can carry. Batching trades latency for cost: a customer waits for the next batch, and one bad output (an address the contract can't pay) can fail the whole batch on account chains, so the batcher validates each destination first and keeps large or urgent withdrawals out of the queue.

### Nonce management

On account chains, each sending address has a nonce, and transactions from that address are processed strictly in nonce order. Three rules keep a hot wallet moving:

- **One allocator per sending address.** Nonces are allocated inside a database transaction that records which withdrawal or batch holds which nonce, never by asking a node for the pending count at send time (two workers asking at once get the same number).
- **Gaps block everything after them.** A transaction with nonce 41 that never reaches the network leaves 42 and later stuck; geth keeps non-executable transactions queued for up to three hours by default. The allocator either fills the gap (rebroadcast or replace nonce 41) or the address stops.
- **Several sending addresses** spread throughput and failure: one stuck nonce stops one address, not every withdrawal.

### Stuck transactions and fee bumping

A transaction priced below what the network now demands sits in the mempool. The exchange's options depend on the chain:

- **Ethereum and EVM chains: replace by nonce.** Send a new transaction with the same nonce and a higher fee. Geth requires at least a 10% price bump (`txpool.pricebump`) for a replacement to be accepted; to cancel instead, send a zero-value transaction to yourself with the same nonce. Whichever lands first wins, so the pipeline tracks both hashes until one is final.
- **Bitcoin: replace by fee or child pays for parent.** Under BIP-125 a replacement must pay a higher absolute fee than the transactions it evicts, pay for its own relay, and evict no more than 100 transactions. With full RBF now the Bitcoin Core default, an exchange can replace its own withdrawal whether or not it signaled. Alternatively, spend the stuck transaction's change output in a child with a high fee, so miners take both; Bitcoin Core 28.0 added limited one-parent-one-child package relay so a low-fee parent can travel with its child, which the release notes call "not yet reliable under adversarial conditions."

Every replacement is a new transaction hash for the same withdrawal. The `withdrawal_transactions` table below keeps all of them, and the withdrawal completes on whichever one reaches finality. The idempotency key on the withdrawal, not the transaction hash, is what stops a retried request from paying twice ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)).

### Withdrawals out of a rollup

Withdrawing from a rollup to Ethereum is a protocol process, not a transfer. On OP Stack chains (Base among them) the withdrawal is initiated on L2, proved on L1 against a dispute game, and finalized after a seven-day challenge period; Arbitrum's is similar with its own dispute window. An exchange holding liquidity on both sides doesn't make customers wait: it pays the customer on Ethereum from its own Ethereum wallet and rebalances between chains on its own schedule, through the native bridge or a burn-and-mint service like CCTP. How bridges and rollup withdrawals work is in [Layer 2s, Bridges & Cross-Chain](/books/investing-and-digital-assets/layer-2s-and-bridges).

## Wrong Networks and Recovery

Customers send the right asset on the wrong network, the wrong asset to the right address, or forget the tag. Binance warns that "if you select the wrong network, your funds might be lost and cannot be recovered." Whether they can be depends on the chain and the address type:

- **Same EOA, another EVM chain.** If the exchange's deposit address is an EOA, the same private key controls that address on every EVM chain, so tokens sent on Arbitrum to an Ethereum deposit address can be recovered by signing on Arbitrum. It's a manual, keyed operation from a cold or warm process, not something the hot path should do.
- **Contract address, another chain.** If the deposit address is a contract deployed only on Ethereum, the same address on another chain has no code. Recovery is possible only if the same factory can deploy the same contract at the same address there, which depends on how the address was derived; often it can't.
- **Unsupported token on a supported chain.** The coins are in an address the exchange controls, but the ledger has no instrument for them; recovery means a manual transfer and a decision about what to credit.
- **Privacy features and special outputs.** Kraken lists deposits it won't credit and that "may be lost": Litecoin MWEB, Dash PrivateSend, private Aleo transfers, and Zcash block rewards.

Kraken's recovery policy is the clearest public model: free when Kraken simply failed to credit a deposit, the network fee for a missing or wrong tag or memo or a deposit to a hot wallet address, $200 for unsupported tokens on supported networks, and $500 for unlisted assets on unsupported networks, under a heading of "No Guarantee of Recovery." Write the policy before the first case: which errors are recoverable, who approves the signing, what it costs, how long it takes, and that screening still applies (a recovered deposit from a sanctioned address is blocked property, not a refund). Prevention does most of the work: show the network as prominently as the address, give each network its own deposit address, and require a tag field where the chain needs one.

## The Travel Rule Hooks

The funds Travel Rule (31 CFR 1010.410(f)) requires a US financial institution sending a transmittal of $3,000 or more to pass the originator's and beneficiary's information along, and FinCEN's 2019 guidance applies it to convertible virtual currency; the EU applies its version with no threshold for crypto-asset transfers involving a CASP. The rule and its messaging networks are covered in the Payments volume's [The Travel Rule](/books/payments/stablecoins#the-travel-rule), and the crypto-specific program in [AML & the Travel Rule for Crypto](/books/investing-and-digital-assets/crypto-aml-and-travel-rule). In the pipeline it is two hooks:

- **Outbound,** in `checking`: determine whether the destination is a hosted wallet at another provider (from address attribution or the customer's declaration), send the required data over a Travel Rule network before or alongside the transfer, and hold the withdrawal if the counterparty can't be reached and policy requires it.
- **Inbound,** on `detected`: match a received Travel Rule message to the deposit; a deposit over the threshold from another provider with no message, or with data that doesn't match the account, goes to `held`.

The record is the Payments volume's `travel_rule_records`, whose `onchain_transfer_id` maps here to an `onchain_transactions` row plus its `transfers` row (the core model's mapping); this chapter adds only the link from deposit credits and withdrawal requests to it.

## How to Build It

These are deltas against the core data model in [The Investing & Digital Assets Business](/books/investing-and-digital-assets/investing-business#the-core-data-model), extending [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture#how-to-build-it). The core already has `chains` (finality rule and confirmations required), `asset_networks` (`memo_required`, `deposits_enabled`, `withdrawals_enabled`), `wallets`, `addresses` (with `memo_tag`, `account_id` and `derivation_path`), `onchain_transactions` (pending, confirmed, finalized, reorged, failed, with the block hash) and one `transfers` table for every way in and out, with `method = 'onchain'`, a hold status, `available_at` and an idempotency key. Following the core's rule, deposits and withdrawals are detail tables keyed by `transfers.id`, not a parallel pipeline. This chapter adds banded confirmation policies, deposit credits, withdrawal requests and their checks, the customer's address allowlist, the several transactions one withdrawal can have, nonce reservations, sweeps and gas top-ups, and misdirected deposits.

```sql
-- How the address type affects sweeping and recovery.
ALTER TABLE addresses
  ADD COLUMN address_kind TEXT NOT NULL DEFAULT 'utxo_hd'
    CHECK (address_kind IN ('utxo_hd', 'eoa', 'contract', 'shared_with_tag')),
  ADD COLUMN deployed     BOOLEAN NOT NULL DEFAULT TRUE;  -- FALSE: a counterfactual contract not yet deployed

CREATE TABLE confirmation_policies (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  asset_network_id      UUID NOT NULL REFERENCES asset_networks (id),
  band_max_usd          BIGINT,                 -- exclusive, in cents; NULL is the top band
  trade_confirmations   INT NOT NULL,           -- provisional buying power from here
  provisional_limit_usd BIGINT NOT NULL,        -- per account, cents
  needs_second_source   BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by           UUID NOT NULL,
  effective_from        TIMESTAMPTZ NOT NULL,
  UNIQUE (asset_network_id, band_max_usd, effective_from)
);  -- posting always waits for chains.finality_rule

CREATE TABLE deposit_credits (                  -- detail of an inbound on-chain transfer
  transfer_id            UUID PRIMARY KEY REFERENCES transfers (id),
  policy_id              UUID NOT NULL REFERENCES confirmation_policies (id),
  stage                  TEXT NOT NULL CHECK (stage IN ('detected', 'confirming', 'credited', 'final',
                           'held', 'reorged', 'dropped', 'returned')),
  value_usd_at_detection BIGINT NOT NULL,
  provisional_usd        BIGINT NOT NULL DEFAULT 0,  -- buying power extended before finality
  hold_reason            TEXT CHECK (hold_reason IN ('screening', 'travel_rule', 'missing_tag',
                           'account_restricted', 'chain_unhealthy')),
  screening_ref          TEXT,                   -- the address screening record
  travel_rule_record_id  UUID,                   -- Payments' travel_rule_records
  credited_at            TIMESTAMPTZ,
  final_at               TIMESTAMPTZ
);

CREATE TABLE address_allowlists (               -- a customer's verified withdrawal addresses
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  asset_network_id UUID NOT NULL REFERENCES asset_networks (id),
  address          TEXT NOT NULL,
  memo_tag         TEXT,
  label            TEXT,
  hosted_by        TEXT,                        -- the counterparty VASP, if known, for the Travel Rule
  confirmed_via    TEXT NOT NULL,               -- 'email_link', 'second_factor', ...
  usable_from      TIMESTAMPTZ NOT NULL,        -- after the cooling period
  removed_at       TIMESTAMPTZ,
  UNIQUE (account_id, asset_network_id, address, memo_tag)
);

CREATE TABLE withdrawal_requests (              -- detail of an outbound on-chain transfer
  transfer_id          UUID PRIMARY KEY REFERENCES transfers (id),
  allowlist_id         UUID REFERENCES address_allowlists (id),
  destination_address  TEXT NOT NULL,
  destination_tag      TEXT,
  fee_charged          NUMERIC(78, 0) NOT NULL, -- the withdrawal fee, in the asset
  stage                TEXT NOT NULL CHECK (stage IN ('requested', 'checking', 'held', 'approved', 'signing',
                         'broadcast', 'confirming', 'completed', 'replaced', 'failed', 'rejected', 'canceled')),
  batch_id             UUID,
  source_wallet_id     UUID REFERENCES wallets (id),
  travel_rule_record_id UUID,
  requested_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at         TIMESTAMPTZ
);

CREATE TABLE withdrawal_checks (                -- every check, every result, append-only
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  transfer_id  UUID NOT NULL REFERENCES withdrawal_requests (transfer_id),
  check_name   TEXT NOT NULL,                   -- 'second_factor', 'allowlist', 'cooling_period', 'velocity',
                                                -- 'destination_screening', 'travel_rule', 'hot_liquidity'
  result       TEXT NOT NULL CHECK (result IN ('pass', 'hold', 'reject')),
  detail       JSONB,
  decided_by   TEXT NOT NULL,                   -- 'risk_engine' or 'reviewer:<id>'
  decided_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A batch can have several transactions: the original and its replacements.
CREATE TABLE withdrawal_transactions (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  batch_id               UUID NOT NULL,
  onchain_transaction_id UUID NOT NULL REFERENCES onchain_transactions (id),
  replaces_id            UUID REFERENCES withdrawal_transactions (id),
  kind                   TEXT NOT NULL CHECK (kind IN ('original', 'fee_bump', 'cancel', 'cpfp_child')),
  fee_offered            NUMERIC(78, 0) NOT NULL, -- max fee (EVM) or absolute fee (UTXO)
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE nonce_reservations (               -- account-model chains
  sending_address_id UUID NOT NULL REFERENCES addresses (id),
  nonce              BIGINT NOT NULL,
  batch_id           UUID NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('reserved', 'broadcast', 'mined', 'replaced', 'abandoned')),
  reserved_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (sending_address_id, nonce)
);

CREATE TABLE sweeps (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  from_address_id        UUID NOT NULL REFERENCES addresses (id),
  to_wallet_id           UUID NOT NULL REFERENCES wallets (id),
  asset_network_id       UUID NOT NULL REFERENCES asset_networks (id),
  amount                 NUMERIC(78, 0) NOT NULL,
  gas_topup_tx_id        UUID REFERENCES onchain_transactions (id),  -- the funding transaction, if any
  topup_amount           NUMERIC(78, 0),          -- native coin sent for gas, tracked as customer funds
  onchain_transaction_id UUID REFERENCES onchain_transactions (id),
  trigger                TEXT NOT NULL CHECK (trigger IN ('threshold', 'age', 'liquidity', 'manual')),
  status                 TEXT NOT NULL CHECK (status IN ('planned', 'funding', 'sending', 'final', 'failed')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE misdirected_deposits (             -- receipts that can't become a transfer yet, or at all
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  onchain_transaction_id UUID NOT NULL REFERENCES onchain_transactions (id),
  log_index              INT NOT NULL DEFAULT 0,
  address_id             UUID REFERENCES addresses (id),
  memo_tag_received      TEXT,
  token_contract         TEXT,                   -- what arrived, if not a listed asset network
  amount                 NUMERIC(78, 0) NOT NULL,
  error_type             TEXT NOT NULL CHECK (error_type IN ('not_credited', 'missing_tag', 'wrong_network',
                           'unsupported_token', 'unlisted_asset', 'privacy_feature')),
  claimed_by_account_id  UUID REFERENCES accounts (id),
  recoverable            BOOLEAN,
  fee_charged            NUMERIC(78, 0),
  approved_by            UUID,
  case_id                UUID REFERENCES cases (id),
  outcome                TEXT CHECK (outcome IN ('credited', 'returned', 'unrecoverable', 'blocked')),
  transfer_id            UUID REFERENCES transfers (id),  -- the transfer created once resolved
  UNIQUE (onchain_transaction_id, log_index)
);
```

The ledger posts on stage transitions, never on rows, each keyed by `(transfer_id, to_status)`: a deposit entering `final` posts the customer line against the omnibus line for the receiving wallet (entering `held` posts to suspense instead), and a withdrawal entering `broadcast` posts the debit, the withdrawal fee and the network fee, with a reversing entry only if it ends `failed` or a cancel lands. The `transfers.status` follows the detail stage (`requested`, then `pending`, `held`, and `completed` at finality, with `available_at` set when a deposit becomes withdrawable). A deposit's provisional credit is checked against `provisional_limit_usd` when buying power is computed and disappears on `reorged`. The nonce table's primary key makes double reservation impossible; the transfer's idempotency key makes a double request a lookup; and a `confirmation_policies` change is an approved, dated row, so every deposit records the exact policy it was credited under. Account-level holds from fraud signals are [Account Security & Fraud](/books/investing-and-digital-assets/account-security)'s `withdrawal_holds`; this chapter's `withdrawal_checks` record why the pipeline itself held or rejected a request.

## Auditing

What an examiner, auditor or incident reviewer asks for, and where it lives:

- **The confirmation policy in force** for every asset and network on any date, who approved each change, and the policy each deposit was credited under.
- **Every reorg** that touched a credited deposit: the blocks, the reversals posted, and any customer balances left short and how they were collected.
- **Withdrawal decisions:** every state change with its actor, every hold and who released it, the screening result and Travel Rule record for each send, and the allowlist entry used.
- **Address book changes,** with the confirmation step and the cooling period, since a changed withdrawal address is the first thing an investigator checks after an account takeover.
- **Signed transactions per withdrawal,** including every replacement and cancel, so an outflow on chain always maps to one approved withdrawal or batch.
- **Gas top-ups and dust,** per deposit address, as customer funds.
- **Recovery cases,** with the error type, approval, fee and outcome, and the policy they were decided under.

## What This Means for the System You Build

- **Attribution at the address, or at address plus tag** where the chain makes addresses expensive, with `RequireDest` set where the chain offers it.
- **A confirmation policy per asset, network and amount band,** with provisional buying power before finality under a limit, posting and withdrawal at finality, and crediting paused automatically when a chain stops finalizing.
- **Store the block hash with every block number,** and post nothing a reorg can take back.
- **Sweep on a rule in gas terms,** never as a precondition of paying a withdrawal, and treat gas sent to customer addresses as customer funds.
- **Hold before you check,** so no balance can be withdrawn twice while checks run; post on broadcast, complete at finality.
- **Allowlists, cooling periods and screening before signing,** with a verified address book instead of autocomplete from history.
- **One nonce allocator per sending address,** several sending addresses, and replacements tracked as transactions of the same withdrawal.
- **A written recovery policy** for wrong networks, missing tags and unsupported tokens, decided before the first case.

## References

**Law and regulation**

- [31 CFR 1010.410](https://www.law.cornell.edu/cfr/text/31/1010.410), the funds Travel Rule for transmittals of $3,000 or more

**Regulators and guidance**

- [NYDFS: Guidance on Custodial Structures (January 23, 2023)](https://www.dfs.ny.gov/industry_guidance/industry_letters/il20230123_guidance_custodial_structures), gas funded for customers treated as customer funds (since superseded by the September 30, 2025 update)
- [FinCEN: Application of FinCEN's regulations to certain business models involving convertible virtual currencies (FIN-2019-G001)](https://www.fincen.gov/resources/statutes-regulations/guidance/application-fincens-regulations-certain-business-models), the Travel Rule applied to convertible virtual currency

**Filings**

- [Coinbase Global: Form 8-K, Item 1.05 (May 14, 2025)](https://www.sec.gov/Archives/edgar/data/1679788/000167978825000094/coin-20250514.htm), support contractors paid to pull customer data, social engineering of customers, and the $180 million to $400 million estimate
- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), omnibus and dedicated-address custody, temporary withdrawal delays, and $311.2 million paid in 2025 for the incident

**Standards and protocols**

- [BIP-32: Hierarchical deterministic wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki), xpub derivation without spend ability, watch-only audit, and the hardened-derivation warning
- [BIP-44: Multi-account hierarchy](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki), the derivation path and the gap limit of 20
- [BIP-125: Opt-in full replace-by-fee](https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki), replacement rules: higher absolute fee, own relay fee, at most 100 evictions
- [Bitcoin Core 28.0 release notes (October 2, 2024)](https://bitcoincore.org/en/releases/28.0/), `mempoolfullrbf` default on, TRUC transactions standard, and one-parent-one-child package relay
- [Ethereum: Proof of stake](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/), 12-second slots, 32-slot epochs, two-thirds justification and finality, the one-third cost of reverting, and the inactivity leak after four epochs
- [Ethereum: JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/), the `safe` and `finalized` block tags
- [Ethereum: Gas and fees](https://ethereum.org/developers/docs/gas/), 21,000 gas for an ETH transfer, base fee changes of at most 12.5% per block, fees paid on failure
- [Ethereum: Fusaka](https://ethereum.org/en/roadmap/fusaka/), live December 3, 2025, and EIP-7825's 2^24 gas cap per transaction
- [Anza: Commitment status](https://docs.anza.xyz/consensus/commitments), processed, confirmed and finalized under Tower BFT, and their meaning under Alpenglow
- [Anza: Alpenglow](https://www.anza.xyz/alpenglow), live on mainnet-beta (10/21), TowerBFT retired
- [OP Stack: Withdrawal flow](https://docs.optimism.io/stack/transactions/withdrawal-flow), initiate, prove and finalize after the seven-day challenge period
- [Arbitrum: L2 to L1 messaging](https://docs.arbitrum.io/how-arbitrum-works/deep-dives/l2-to-l1-messaging), the dispute window and outbox execution
- [XRP Ledger: Source and destination tags](https://xrpl.org/docs/concepts/transactions/source-and-destination-tags), 32-bit tags, the per-address reserve, `RequireDest` and unpredictable assignment

**Vendor documentation**

- [Binance: How to deposit crypto](https://www.binance.com/en/support/faq/how-to-deposit-crypto-to-binance-115003764971), matching networks, memo and tag requirements, and wrong-network losses
- [BitGo: Wallet types](https://developers.bitgo.com/concepts/wallet-types), 2-of-3 keys, cold custody wallets, forwarder consolidation with one signature, the gas tank, and the 24-hour withdrawal SLA
- [Circle: Required block confirmations](https://developers.circle.com/cctp/required-block-confirmations), hard and soft finality per chain
- [Fireblocks: Work with Gas Station](https://developers.fireblocks.com/docs/work-with-gas-station), auto-fueling on detected deposits and withdrawals, and sweeps to an omnibus vault on completion
- [Fireblocks: Capabilities](https://developers.fireblocks.com/docs/capabilities), deposit addresses per asset wallet and hot, warm and cold key-share placement
- [Gemini: Security](https://www.gemini.com/security), address allowlisting and 2FA for withdrawals
- [Geth: Command-line options](https://geth.ethereum.org/docs/fundamentals/command-line-options), the 10% replacement price bump and the three-hour queue lifetime
- [Kraken: Cryptocurrency deposit processing times](https://support.kraken.com/hc/en-us/articles/203325283-Cryptocurrency-deposit-processing-times), bitcoin credited after 3 confirmations, and deposits not credited (MWEB, PrivateSend, private Aleo, Zcash rewards)
- [Kraken: Crypto deposit recovery](https://support.kraken.com/articles/crypto-assets-deposit-recovery), the recovery fee table and no guarantee of recovery
- [Kraken: Security](https://www.kraken.com/features/security), email confirmation for new withdrawal addresses and the global settings time lock

**In practice**

- [Tsuchiya et al., address poisoning on Ethereum and BNB Smart Chain (USENIX Security 2025)](https://www.usenix.org/conference/usenixsecurity25/presentation/tsuchiya), 270 million attempts against 17 million victims and at least $83.8 million lost
