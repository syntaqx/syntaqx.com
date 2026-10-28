+++
title = "Blockchain Nodes, RPC & Validators"
nav_title = "Blockchain Nodes & Validators"
description = "Hosting blockchains: node resource profiles, RPC providers metered in compute units, validator hosting and slashing, provider terms and node concentration."
category = "Hosting & Cloud Industry"
order = 2210
part = "Running the Provider"
tags = ["blockchain", "rpc", "validators", "staking", "metering"]
+++

A blockchain node is a server that keeps its own copy of a public ledger and checks every new block against the protocol's rules. To a hosting provider it is an unusual tenant: a stateful database that grows every week, syncs from strangers over the internet, has to stay within seconds of the network's head, and answers queries whose cost differs by a factor of a hundred from one method to the next. Applications rarely run their own. A wallet, an exchange or an indexer reads the chain and submits transactions through an RPC (remote procedure call) endpoint, and a business has grown up to sell those endpoints: Alchemy, Infura, QuickNode, Helius, Chainstack and others run fleets of nodes and meter access in compute units or credits, the same way a cloud meters requests. A validator is a node with a signing key that takes part in consensus and earns rewards, and hosting one adds a failure mode no other workload has: on proof-of-stake chains, the redundancy an operator would normally add can cost the customer part of its stake.

This chapter covers what a node is and what it needs (Ethereum's execution and consensus clients, full and archive history, Solana's validator hardware, Bitcoin Core), RPC as a hosting business (units, plans, rate limits, archive and trace access, dedicated nodes), validator hosting and slashing, the provider terms that ban mining and sometimes more, where nodes actually run, and when to run your own. It adds networks, nodes, RPC method weights, validator keys and signer assignments to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Cryptomining as abuse of stolen or free compute is [Free-Tier Fraud & Stolen Keys](/books/hosting-and-cloud/free-tier-fraud-and-stolen-keys#cryptomining)'; stablecoins as a payment rail are the Payments volume's [Stablecoins & Crypto Rails](/books/payments/stablecoins); bitcoin miners as power and AI landlords are [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation#miners-as-power-hosts) and [GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds#miners-turned-ai-landlords). Metering in general is [Metering & Rating](/books/hosting-and-cloud/metering-and-rating).

## How the Providers Do It

| Provider | What it sells, as of October 2026 | Unit and limit | Archive, trace and dedicated |
| --- | --- | --- | --- |
| **Alchemy** | Shared RPC on many chains; Free, Pay as You Go and Enterprise | Compute units (CU) per method; Free 30M CU a month at 300 CU/s; Pay as You Go $0.52 per million CU at 10,000 CU/s | Archive data billed as CU; Trace API needs Pay as You Go or Enterprise |
| **Infura** (Consensys) | Shared RPC; Core (free), Developer $50, Team $225 a month, Enterprise | Credits per method, a daily credit allowance and credits per second | "Full archive data" on every plan; Debug and Trace API from Developer |
| **QuickNode** | Shared RPC on plans from $49 to $2,999 a month, Enterprise | API credits per call, set by chain tier and method class; plans from 15 to 500 requests per second | Trace and debug at a 2x multiplier; dedicated clusters on Enterprise only |
| **Helius** | Solana RPC, APIs and streaming | Credits (1 per standard call); 10 to 500 requests per second; a separate `sendTransaction` limit | Dedicated nodes "starting from $2,900/mon", for gRPC streaming, without historical data |
| **Chainstack** | Shared RPC and dedicated nodes | Request units: 1 per full-node call, 2 per archive call; 25 to 600 requests per second | Dedicated nodes from $0.50 an hour plus storage |
| **AWS** | Amazon Managed Blockchain: dedicated Ethereum nodes, Access and Query APIs | Per second with a 1-minute minimum for nodes; per million calls for Access | Closing: no new customers from October 29, 2026 |
| **Google Cloud** | Blockchain Node Engine, "a fully managed node-hosting service" | Not verified here | Ethereum first |
| **Contabo** | VPS and servers marketed for nodes and validators | Ordinary server prices | Bitcoin nodes and Ethereum staking allowed; proof-of-work not allowed on VPS |

Four patterns run through the table:

- **The unit is weighted calls, not requests.** Every shared RPC provider prices a method by what it costs to serve, so `eth_blockNumber` and `debug_traceTransaction` are different prices for the same HTTP request. The weights are the provider's own and differ widely.
- **History and introspection are the upsell.** Recent state is cheap to serve from a full node; archive state and execution traces need archive nodes and non-standard client APIs, so they are gated by plan or multiplied in price.
- **Dedicated means a named machine.** A dedicated node is a server or VM priced by the hour or month, with none of the shared pool's rate limits and none of its redundancy unless the customer buys several.
- **The hyperscalers are stepping back.** AWS is closing its managed blockchain product and pointing customers to RPC specialists and self-managed nodes on EC2, which says where the margin is.

## How Node Hosting Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 27 Oct 2020 | EIP-3076 defines a slashing protection interchange format | Moving a validator between clients without losing its signing history | A file that has to travel with the key, every time |
| Feb 2021 | Staked: 75 validators slashed after it disabled Prysm's slashing protection database for performance (press) | (A performance shortcut) | About 18 ETH, and the first well-known operator slashing |
| 27 Oct 2021 | Hetzner's terms (version 2.0.0) prohibit "mining, farming and plotting of cryptocurrencies" | Hardware wear and abuse from proof-of-work and proof-of-space workloads | A broad clause that later reached nodes |
| Sep 2022 | Geth's documentation puts a hash-based Ethereum archive node at nearly 12 TB | (The cost of keeping every historical state) | Archive access priced as a premium product |
| Nov 2022 | More than 1,000 Solana validators go offline when Hetzner blocks them (press) | (A provider enforcing its terms) | A fifth of Solana's stake delinquent at once |
| 16 Dec 2024 | Anza publishes SIMD-0204, on-chain verification of slashable events, without penalties | A first step toward slashing on Solana | Operators' failover tooling becomes a safety question |
| 10 Sep 2025 | 40 validators slashed when an operator ran a parallel instance outside its distributed validator cluster | (A maintenance mistake) | The case for redundancy inside the signing protocol |
| By Feb 2026 | Geth's archive documentation puts a path-based archive node at about 2 TB | Archive history on one ordinary server | Historical queries still slower and pricier than recent ones |
| 29 Oct 2026 | Amazon Managed Blockchain stops accepting new customers | (A hyperscaler leaving the market) | Migration to self-managed nodes or RPC providers |

The arc is a market sorting itself out. Running a node got cheaper (archive history fell from tens of terabytes to a few), running a validator got riskier as stake and slashing penalties became real money, and the general-purpose clouds learned that blockchain nodes are either an abuse problem (mining), a workload like any other (a node on a VM), or a specialist product they would rather leave to specialists.

## What a Node Is

On Ethereum since proof of stake, "There are two separate pieces of software (known as 'clients') required to form a node." The execution client "listens to new transactions broadcasted in the network, executes them in EVM, and holds the latest state"; the consensus client "implements the proof-of-stake consensus algorithm." The two talk over the Engine API, authenticated by a JWT signed with a shared 256-bit secret (`HS256`), on port 8551 by default, separate from the public JSON-RPC port. A host running Ethereum nodes therefore runs pairs of processes with a secret between them, and a pair is the unit that fails, upgrades and syncs. Client choice is part of the product: Geth, Nethermind, Besu, Erigon, Reth and ethrex on the execution side, Lighthouse, Prysm, Teku, Nimbus, Lodestar and Grandine on the consensus side, and ethereum.org argues that "Multiple client implementations can make the network stronger by reducing its dependency on a single codebase."

Three history modes decide the disk:

- **Pruned or full.** A full node keeps "relatively recent data (typically the most recent 128 blocks)" of state and can verify everything from there. Bitcoin Core can prune further, keeping only a configured amount of raw blocks (the minimum `prune` value is 550 MiB).
- **Archive.** Every historical state back to genesis, so a query can ask for a balance or a contract call at any past block. Geth's hash-based archive "can exceed 20TB"; its path-based archive needs "around 2 TB," or about 6.5 TB with full flat states alongside.
- **Syncing.** A new node syncs from peers. Geth's snap sync "starts from a relatively recent block and syncs from there to the head of the chain"; Erigon and Reth execute every block from genesis. A provider's time to deliver a node is its sync time, unless it clones a node from a recent snapshot, which is why node hosts keep snapshot pipelines the way VM hosts keep images.

The JSON-RPC interface is standard in part. The execution-apis repository defines "a standard collection of methods that all execution clients implement" (the `eth_`, `net_` and `web3_` namespaces). Tracing is not in it: Geth's `debug_` namespace provides "several non-standard RPC methods," and the `trace_` namespace provides Parity-style traces in Reth and Erigon. An RPC provider that sells tracing is selling a client-specific API from specific clients, which constrains which clients its archive pool runs.

## Resource Profiles, Dated

What each kind of node needs, from the projects' own documentation:

| Node | CPU | Memory | Disk | Network | Source date |
| --- | --- | --- | --- | --- | --- |
| **Ethereum node, minimum** | 2+ cores | 16 GB (32 GB recommended for stability) | 2 TB NVMe, "likely exceeded by 2027" | 25+ Mbit/s | ethereum.org, August 2026 |
| **Ethereum node, recommended** (EIP-7870) | 4+ cores, 8+ if validating | 32 GB, 64 GB if validating | 4 TB NVMe; DRAM-less and QLC discouraged | 50 down, 15+ up (25+ up if validating) | ethereum.org, August 2026 |
| **Erigon full** | 4 to 8 cores | 16 GB required, 32 GB recommended | 534.94 GB used, 2 TB recommended | 10 Mbps required for staking, 50 recommended | September 2026 measurement |
| **Erigon archive** | 8 to 16 cores | 32 GB required, 64 GB recommended | 2.25 TB used, 4 TB recommended | Same | September 2026 measurement |
| **Reth full / archive** | Clock speed over core count | 8 GB+ / 16 GB+ | At least 1.2 TB / 2.8 TB, TLC NVMe | 24 Mbps+ | June 2025 measurement |
| **Solana validator (Agave)** | 12 cores / 24 threads, 2.8 GHz base or faster | ECC suggested; a motherboard with 512 GB capacity suggested | NVMe: accounts 1 TB, ledger 1 TB, snapshots 500 GB, high write endurance | 1 Gbit/s symmetric unstaked; at least 2 Gbit/s staked, 10 recommended | Anza docs, October 2026 |
| **Solana RPC node** (in addition) | 16 cores / 32 threads | 256 GB, 512 GB for all account indexes | Accounts and ledger on separate disks; a larger ledger for more history | As above | Anza docs, October 2026 |
| **Bitcoin Core** | Not stated | 2 GB | Over 750 GB unpruned, about 7 GB pruned | 400 kbit/s up; about 20 GB down a month after an initial ~740 GB | bitcoin.org, October 2026 |

What the numbers mean for a host:

- **Disk is the product.** Every profile asks for NVMe with high write endurance, and Solana asks for separate drives for accounts, ledger and snapshots. A VPS plan sized by vCPU with a small network volume is the wrong shape; a node wants local NVMe, which is why nodes cluster on bare metal ([Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers)).
- **Solana is a data center workload.** A staked validator needs at least 2 Gbit/s symmetric. Anza's documentation is blunt about clouds: running a node there "requires significantly greater operational expertise to achieve stability and performance," and "Do not expect to find sympathetic voices should you chose this route." It also discourages Docker for mainnet validators. Voting costs money too: a vote transaction for each block the validator agrees with "can cost up to 1.1 SOL per day."
- **Growth is a planning input.** ethereum.org expects the 2 TB minimum to be exceeded by 2027; Geth's older guidance had a full node growing about 14 GB a week before pruning. A node host sells disk headroom the way a database host does, and migrates customers when a chain outgrows a server class.
- **Bitcoin is the light one.** A pruned Bitcoin node fits on a home machine; that is a design goal of the project, and why the Bitcoin network's nodes look so different from Solana's (see [Where Nodes Run](#where-nodes-run)).

## RPC as a Hosting Business

An RPC provider is a load balancer in front of a pool of nodes, with a meter. Its costs are the nodes (archive nodes most of all), the bandwidth, and the engineering to keep a pool consistent near the chain's head; its revenue is weighted calls.

### Units per method

Each provider publishes a weight per method. As of October 2026:

| Method | Alchemy (CU) | Infura (credits) | QuickNode (API credits, Ethereum) |
| --- | --- | --- | --- |
| `eth_blockNumber` | 10 | 80 | 20 |
| `eth_getBalance` | 20 | 80 | 20 |
| `eth_call` | 26 | 80 | 20 |
| `eth_sendRawTransaction` | 40 | 80 | 20 |
| `eth_getLogs` | 60 | 255 | 20 |
| `trace_transaction` | 40 | 300 | 40 |
| `debug_traceTransaction` | 40 (1,000 against throughput) | 1,000 | 40 |

Alchemy derives its weights "from global average durations of each method." Infura sets unlisted methods at 80 credits. QuickNode doesn't publish per-method weights; it charges a flat rate per chain tier (20 credits per call on Ethereum, 30 on Solana, 10 on Bitcoin) with a "2x chain multiplier" for trace and debug and 4x for specialized calls, so the QuickNode column is my application of its rule. Helius charges 1 credit for most Solana calls and 10 for `getProgramAccounts`; Chainstack charges 1 request unit for a full-node call and 2 for an archive call.

The weights make plans comparable only through arithmetic. One million `eth_call` requests are 26 million CU at Alchemy, $13.52 at its $0.52 per million; at QuickNode they are 20 million credits, $12.40 at the Build plan's $0.62 per million overage (my arithmetic, list prices). The same million `eth_getLogs` calls cost 2.3 times as much at Alchemy and the same at QuickNode. A customer whose traffic is logs and traces is a different customer at each provider, and an RPC provider's weights are a statement of which customers it wants.

### Plans and limits

| Provider | Plans, as of October 2026 | Included | Throughput limit |
| --- | --- | --- | --- |
| **Alchemy** | Free; Pay as You Go; Enterprise | 30M CU a month free; then $0.52 per million CU | 300 CU/s free, 10,000 CU/s on Pay as You Go, a 10-second token bucket |
| **Infura** | Core free; Developer $50; Team $225; Enterprise | 3M, 15M and 75M credits a day | 500, 4,000 and 40,000 credits a second |
| **QuickNode** | Build $49 to Business+ $2,999 a month | 80M to 7B API credits a month; overage $0.62 to $0.50 per million | 50 to 500 requests a second (15 on the free trial) |
| **Helius** | Free; Developer $49; Business $499; Professional $999 | 1M to 200M credits a month; overage $5 per million | 10 to 500 requests a second; `sendTransaction` 1 to 100 a second |
| **Chainstack** | Developer free to Business $499; Enterprise from $990 | 3M to 400M request units; extra $20 to $5 per million | 25 to 600 requests a second |

Infura's own page disagrees with itself: the plan table gives the free plan 3 million credits a day at 500 a second, and the FAQ on the same page says 6 million at 2,000. I use the table.

The limit mechanics are where an RPC provider's engineering shows:

- **Throughput is measured in the same unit as price.** Alchemy limits compute units per second, "evaluated over a 10-second rolling window using a token bucket algorithm," so a free account at 300 CU/s can spend "up to 3,000 CUs over any 10-second period." Some methods carry a separate throughput weight: `debug_traceTransaction` costs 40 CU on the bill but 1,000 against the throughput limit, so tracing is cheap to buy and slow to burst. The general technique is the playbook's [Admission, Rate Limiting and Load Shedding](/docs/architecture/admission-control#admission-rate-limiting-and-load-shedding).
- **Two limits, two status codes.** Infura answers a throughput breach with 429 and an exhausted daily allowance with 402, and charges for neither; other 4xx errors cost 5 credits and 5xx errors are free. Which failures bill is a decision every metered API has to write down, and Infura's is the clearest published one.
- **Writes get their own lane.** Helius limits `sendTransaction` separately from reads, and its dedicated nodes support it but warn "most transactions will not land," because landing a Solana transaction depends on staked connections to the current leader, a network property and not a server one.

### Archive, trace and dedicated nodes

Archive and trace access is what separates tiers. Alchemy requires Pay as You Go or Enterprise for its Trace API and bills archive calls as compute units; Infura includes "Full archive data" on every plan and adds the Debug and Trace API from Developer up; QuickNode multiplies trace and debug calls; Chainstack doubles archive calls. Behind that pricing is a pool split: archive nodes running clients that serve `trace_` and `debug_`, separate from the full nodes that serve recent state, with a router that sends a call for an old block to the archive pool.

Dedicated nodes are the hosting product underneath the API. Chainstack prices compute "from $0.50/hour" per node and storage at "$0.01 per 20 GB/hour"; Helius starts at $2,900 a month for gRPC streaming nodes "specifically designed for gRPC streaming applications," without historical data, and keeps its APIs, webhooks and staked connections on shared plans; QuickNode lists dedicated clusters on Enterprise without a public price. Amazon Managed Blockchain priced dedicated Ethereum nodes per second with a 1-minute minimum plus storage per GB-month, the same shape as a VM. AWS is closing that product: no new customers from October 29, 2026, and existing customers until September 29, 2027 by its end-of-support page (September 30 on the product page), with migration to "self-managed blockchain nodes on AWS" or "a managed node/RPC service from an AWS Partner, such as Alchemy, QuickNode, or Kaleido."

## Validators and Slashing

A validator is a node plus a key that signs consensus messages. On Ethereum, a validator activates with 32 ETH (`MIN_ACTIVATION_BALANCE`) and, since the Electra upgrade, can hold an effective balance of up to 2,048 ETH (`MAX_EFFECTIVE_BALANCE_ELECTRA`). It earns rewards for attesting and proposing, loses small amounts for being offline, and can be slashed for signing contradictions. Hosting validators is a business with three common shapes: a staking provider that holds the keys and runs the fleet for depositors, a node host that rents the machine and leaves the key with the customer, and distributed validator clusters where several operators each hold a share of the key.

### What is slashable

The consensus specifications define three offenses, all of which are the same key signing two incompatible things:

- **Double proposal.** Two different block headers for the same slot from the same proposer (`header_1.slot == header_2.slot`, `header_1 != header_2`).
- **Double vote.** Two different attestations with the same target epoch.
- **Surround vote.** An attestation whose source and target epochs surround, or are surrounded by, another from the same validator.

Being offline is not slashable. Signing twice is. The penalty since Electra has three parts: an immediate penalty of the effective balance divided by 4,096 (`MIN_SLASHING_PENALTY_QUOTIENT_ELECTRA`); a forced exit with withdrawal delayed by `EPOCHS_PER_SLASHINGS_VECTOR`, 8,192 epochs, about 36 days (my arithmetic at 32 slots of 12 seconds per epoch); and a correlation penalty halfway through that window that grows with the total balance slashed around the same time, scaled by a multiplier of 3 since Bellatrix. The correlation term is the one that matters for a host: one validator slashed alone loses little, but a fleet whose validators are all slashed by the same mistake is penalized as a coordinated attack.

### Redundancy causes slashing

Every other chapter in this volume treats a hot standby as good practice. For a validator key it is the classic way to get slashed. Two machines with the same key both see the same duty and both sign; if the messages differ at all (a different head, a different block), the network has proof of a double vote. The client documentation says so directly:

- **Lighthouse:** "even with doppelganger protection enabled, it is not safe to run two instances of the same validator," and "Do not restart the VC until you are certain there is no other instance of that validator running elsewhere!"
- **Teku:** its slashing protection "does not provide protection if the same validator key is being used by multiple nodes."
- **Prysm:** failover is "very easy to misconfigure and you could easily end up slashed," and "slashing happens to innocent validators quite often which set up their system incorrectly, or are using complicated failover mechanisms."

The protections each client ships are local. Slashing protection is a database of what this key has signed, consulted before signing again, and it only works if every signature goes through the same database; EIP-3076's interchange format exists because "changing clients (from client A to client B, say) can result in a slashing risk," and lets the history move with the key. Doppelganger protection listens for the key's activity on the network for two to three epochs before signing (Lighthouse) or two epochs (Teku), at the cost of a few missed attestations; both projects call it imperfect, Teku "a last resort option." The public record matches the warnings. SSV's post-mortem of 10 September 2025 traces 40 slashed validators to "an internal maintenance mistake that ran a parallel validator instance outside of SSV"; the press account of Staked's 75 slashed validators in February 2021 traces them to the operator having disabled Prysm's slashing protection database "in pursuit of better performance."

The safe forms of redundancy move it into the protocol:

- **Distributed validators.** Obol and SSV split the key so that "A distributed validator key is a group of BLS private keys which together operate as a threshold key"; a signature needs a quorum of operators, ceiling(2n/3) in Obol's configuration, so a 4-node cluster tolerates one failure and a 7-node cluster two. Redundancy is then a property of the cluster, and Obol is explicit that "Running the same Charon node in two places is considered a malicious (or byzantine) act."
- **A single remote signer.** Keys live in one signing service with one slashing protection database, and validator clients become stateless consumers of it. The validator clients can be redundant; the signer can't be duplicated.
- **Cold failover with a gap.** Stop the old instance, confirm it is stopped, move the protection history, wait out doppelganger detection, start the new one. Downtime is cheap (missed rewards); a double signature is not.

### Solana

Solana has no enforced slashing as of October 2026. Anza wrote in December 2024 that "Solana has historically never had an automatic slashing mechanism," and SIMD-0204, which would verify and record violations on chain without penalties, is in review; SIMD-0212's proposed penalty curve is under discussion. Agave's design documents already call "producing two different blocks for the same slot" a slashable offense, so I treat it as design intent rather than enforcement. Agave documents a hot-spare failover that avoids "any safety issues that would otherwise be associated with running two instances of your validator": the active machine switches to an unstaked identity, the tower file (or, under Alpenglow, the vote history file) is copied to the standby, and the standby takes the staked identity with `set-identity --require-tower`. It is the same rule as Ethereum's: one machine holds the signing identity at a time, and the history travels with it.

## Provider Terms on Mining and Nodes

Most providers' terms name mining. Few name nodes. As of October 2026:

| Provider | Clause | What it covers |
| --- | --- | --- |
| **AWS** | Service Terms §1.25 (October 22, 2026): "You will not use, and will not facilitate or allow End Users to use, the Services to mine cryptocurrency." Promotional credits exclude "any Services for mining for cryptocurrency" | Mining only; AWS sold blockchain nodes itself and documents self-managed nodes on EC2 |
| **Google Cloud** | Terms §3.3(d)(iv) (October 12, 2026): not "to engage in cryptocurrency mining without Google's prior written approval" | Mining, with an approval path; Google sells Blockchain Node Engine |
| **Microsoft** | Online Services acceptable use: not "to mine cryptocurrency" | Mining only |
| **DigitalOcean** | Acceptable Use Policy (March 20, 2026): "Mining any cryptocurrency ... without explicit written permission" | Mining, with a permission path |
| **Hetzner** | Terms §8.3 (version 2.0.0, October 27, 2021): "The operation of applications for mining cryptocurrencies remains prohibited," including "mining, farming and plotting of cryptocurrencies" | Proof-of-work and proof-of-space; nodes are not named |
| **Contabo** | Crypto page: "Yes, you are allowed to run Bitcoin Nodes"; validators for Lido, SSV, Obol and Rocket Pool marketed; "Proof-of-Work applications or mining are not allowed on our VPS product line" | Nodes allowed; mining restricted by product |

Two things follow for a provider writing its own terms. First, the clauses are about the workload's cost to the provider (sustained full CPU or GPU, disk wear, and the fraud that mining attracts, which [Free-Tier Fraud & Stolen Keys](/books/hosting-and-cloud/free-tier-fraud-and-stolen-keys#cryptomining) covers), not about blockchains, and a node or validator is a different workload from a miner: steady, disk- and bandwidth-heavy, not CPU-bound. Second, a broad clause gets read broadly. Hetzner's terms name only mining, farming and plotting, yet the press reported in 2022 that Hetzner applied its ban to blockchain nodes generally and, in November 2022, that more than 1,000 Solana validators went offline when Hetzner blocked them; I could not find a primary Hetzner statement.
<!-- source-gap: hetzner-nodes-2022 | secondary | Hetzner applied its crypto ban to blockchain nodes and blocked Solana validators in 2022 | closes with: a Hetzner statement, status post or terms FAQ on nodes; the press attributes the 2022 statement to Hetzner's own account on r/hetzner (August 2022), which my browser tools can't open | checked: 2026-10-28 -->
A provider that intends to allow nodes and ban mining should say both in the terms; one that intends to ban nodes should name them, because a customer's validator taken offline without notice loses rewards every epoch.

## Where Nodes Run

The decentralization of a chain is partly a question about hosting providers, and for two of the three chains here there is a public dataset:

- **Solana concentrates in a few bare-metal networks.** validators.app's mainnet data-center view (664 validators, read October 28, 2026) puts 13.71% of active stake in TeraSwitch's Frankfurt network alone and 5.88% more in its Amsterdam network, with OVH Paris and Latitude.sh Frankfurt at 4.23% each and Cherry Servers Frankfurt at 3.37%. By autonomous system, TeraSwitch (AS20326) carries 23.83% of stake across 92 validators and Latitude.sh (AS396356) 7.22% across 86, on the site's per-ASN pages, whose denominator differs from the data-center view. Hetzner's AS24940 shows one validator with 0.01%.
- **Bitcoin's reachable nodes are mostly not on the clearnet.** The Bitnodes snapshot of October 28, 2026 counts 23,114 reachable nodes: 12,106 on Tor (52.4%), 4,702 on I2P (20.3%), 5,671 on IPv4 (24.5%) and 631 on IPv6 (2.7%) (shares are my arithmetic). A node behind Tor has no hosting provider anyone can count.
- **Ethereum's dataset is gone.** Ethernodes was the usual source for execution nodes by hosting provider; it refused access when I checked, and clientdiversity.org notes that "The Ethernodes data has been removed." The last widely reported figure, from August 2022, had Hetzner hosting 16% of hosted Ethereum nodes (press).
<!-- source-gap: ethereum-node-hosting-share | missing | current share of Ethereum nodes by hosting provider | closes with: an accessible Ethernodes, Miga Labs or similar dataset with a date; ethernodes.org's hosting page returns 404 and Miga Labs' monitoreth.io failed its TLS check on 2026-10-28 | checked: 2026-10-28 -->

For a provider, concentration is a reputational and contractual fact as much as a statistic: a network whose stake sits largely in one provider's ASN makes that provider's routing incidents, maintenance and terms enforcement into chain events. Solana's 2022 experience with Hetzner is the example: the provider that hosted a fifth of its stake in the press reports of that year shows a single validator in the 2026 data.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Cost shape | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Shared RPC provider** | Weighted calls under a plan, with limits | No nodes to run; many chains; archive and trace on demand | Rate limits at peaks; weights that change; one provider's view of the chain | Per call, cheapest at low and spiky volume | Wallets, dapps, analytics |
| **Dedicated node from a provider** | A named machine by the hour or month | No shared limits; provider handles sync and upgrades | One machine is one failure; feature gaps (no history, no writes at Helius) | Flat per node | Indexers, trading, streaming |
| **Own node on a cloud VM** | Self-managed on EC2 or similar | Next to the rest of the stack; full control of clients | Disk and egress costs; Solana's warnings about clouds; terms to read | VM, NVMe and egress | Teams with infrastructure staff |
| **Own node on bare metal or colo** | Rented or owned servers | Local NVMe, bandwidth, best cost at steady load | Hardware, sync and upgrades are yours; provider terms | Server per month | Validators, RPC providers themselves |
| **Staking provider** | Provider holds or co-holds keys and runs the fleet | No validator operations | Custody and slashing risk sit with the provider; correlated slashing across its fleet | A share of rewards | Depositors |
| **Distributed validator cluster** | A threshold key across operators | Redundancy without double-signing; no single operator | Coordination, more operators to vet | Operators' fees | Staking pools, institutions |

## My Default

For an application that reads or writes a chain, my default is two shared RPC providers behind the application's own client with failover between them, priced on the application's actual method mix rather than on headline requests, and a dedicated or self-run node only once the workload is steady, history-heavy or latency-sensitive enough that the shared limits and weights cost more than a server. I'd run my own archive node before paying trace prices at volume, because a path-based archive now fits on one server.

For a host that wants node customers, my default is to sell bare-metal or large-NVMe servers with terms that say plainly that nodes and validators are allowed and proof-of-work mining isn't, and to treat a validator as a workload with one rule the platform enforces: one active signer per key, recorded and checked, with failover as a gap and not an overlap. For a staking business, I'd put redundancy in a distributed validator or a single remote signer, never in two copies of a key, and spread the fleet across client implementations and providers so one bug or one outage can't slash or stall it all at once. What would change it: a chain whose clients or economics make a different trade (Solana without enforced slashing tolerates hot spares that Ethereum doesn't), or a customer base large enough that running the RPC pool is itself the business.

## How to Build It

The core model holds most of this already: nodes are `resources` on `servers` or `virtual_machines`, RPC calls are `usage_events` rated by `skus`, rate limits are `quotas`, and API keys are [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#how-to-build-it)' `api_credentials`. This chapter adds the networks, the node and endpoint side tables, a versioned table of method weights, and the validator tables whose job is to make "one signer per key" a constraint rather than a hope.

```sql
-- resources.kind gains 'blockchain_node', 'rpc_endpoint', 'validator'

CREATE TABLE chain_networks (            -- a chain and network the provider serves
  id           TEXT PRIMARY KEY,         -- 'ethereum-mainnet', 'solana-mainnet', 'bitcoin-mainnet'
  family       TEXT NOT NULL CHECK (family IN ('evm', 'solana', 'bitcoin', 'other')),
  chain_id     BIGINT,                   -- the EVM chain ID; null elsewhere
  slashing     TEXT NOT NULL CHECK (slashing IN ('enforced', 'proposed', 'none')),
  min_failover_gap INTERVAL NOT NULL,    -- the wait between signers: two epochs or more on Ethereum
  status       TEXT NOT NULL CHECK (status IN ('preview', 'available', 'deprecated', 'retired'))
);

CREATE TABLE blockchain_nodes (          -- side table: kind = 'blockchain_node'
  resource_id      UUID PRIMARY KEY REFERENCES resources (id),
  network_id       TEXT NOT NULL REFERENCES chain_networks (id),
  host_resource_id UUID NOT NULL REFERENCES resources (id),  -- the server or VM
  history_mode     TEXT NOT NULL CHECK (history_mode IN ('pruned', 'full', 'archive')),
  execution_client TEXT NOT NULL,        -- 'geth', 'reth', 'erigon', 'agave', 'bitcoin-core'
  consensus_client TEXT,                 -- 'lighthouse', 'teku'; null where there is none
  namespaces       TEXT[] NOT NULL,      -- 'eth', 'net', 'web3', 'debug', 'trace'
  pool_id          UUID REFERENCES resources (id),  -- kind = 'rpc_endpoint'; null if dedicated
  synced_from      TEXT CHECK (synced_from IN ('genesis', 'snap', 'snapshot_clone'))
);

CREATE TABLE rpc_endpoints (             -- side table: kind = 'rpc_endpoint'
  resource_id   UUID PRIMARY KEY REFERENCES resources (id),
  network_id    TEXT NOT NULL REFERENCES chain_networks (id),
  tenancy       TEXT NOT NULL CHECK (tenancy IN ('shared', 'dedicated')),
  archive       BOOLEAN NOT NULL,        -- routes historical calls to archive nodes
  namespaces    TEXT[] NOT NULL          -- what the plan exposes, a subset of the nodes'
);

CREATE TABLE rpc_method_weights (        -- the published price of a call, over time
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  network_family  TEXT NOT NULL,         -- weights are usually per chain family or tier
  method          TEXT NOT NULL,         -- 'eth_call', 'debug_traceTransaction', '*' default
  billed_units    INT NOT NULL CHECK (billed_units >= 0),
  throughput_units INT NOT NULL CHECK (throughput_units >= 0),  -- weight against the limit
  archive_multiplier NUMERIC NOT NULL DEFAULT 1,
  valid_during    TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (network_family WITH =, method WITH =, valid_during WITH &&)
);

CREATE TABLE validator_keys (            -- side table: kind = 'validator'
  resource_id    UUID PRIMARY KEY REFERENCES resources (id),
  network_id     TEXT NOT NULL REFERENCES chain_networks (id),
  public_key     TEXT NOT NULL,          -- BLS public key, or the vote identity on Solana
  custody        TEXT NOT NULL CHECK (custody IN ('provider_signer', 'customer_signer',
                   'distributed')),
  dv_operators   SMALLINT,               -- distributed: cluster size
  dv_threshold   SMALLINT,               -- distributed: signatures needed
  withdrawal_ref TEXT,                   -- the customer's withdrawal address; never the host's
  status         TEXT NOT NULL CHECK (status IN ('pending', 'active', 'exiting', 'exited',
                   'slashed')),
  UNIQUE (network_id, public_key),
  CHECK ((custody = 'distributed') = (dv_operators IS NOT NULL AND dv_threshold IS NOT NULL)),
  CHECK (dv_threshold IS NULL OR dv_threshold * 2 > dv_operators)
);

CREATE TABLE slashing_protection_transfers (  -- EIP-3076 history moved between signers
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  validator_id     UUID NOT NULL REFERENCES validator_keys (resource_id),
  from_signer_ref  TEXT,                 -- null for a new key with no history
  to_signer_ref    TEXT NOT NULL,
  interchange_sha256 BYTEA,              -- the file as exported
  exported_at      TIMESTAMPTZ,
  imported_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE signer_assignments (        -- which signer may sign for a key, over time
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  validator_id      UUID NOT NULL REFERENCES validator_keys (resource_id),
  signer_ref        TEXT NOT NULL,       -- the validator client or remote signer instance
  host_resource_id  UUID REFERENCES resources (id),
  transfer_id       UUID NOT NULL REFERENCES slashing_protection_transfers (id),
  held_during       TSTZRANGE NOT NULL,  -- signing time plus the failover gap after it
  ended_reason      TEXT CHECK (ended_reason IN ('migration', 'failover', 'exit',
                      'host_retired')),
  EXCLUDE USING GIST (validator_id WITH =, held_during WITH &&)  -- one signer at a time
);
```

Rating a call is a lookup of the weight in effect when it happened, applied per method and outcome, then summed into the account's meter:

```sql
-- RPC usage arrives from the gateway pre-aggregated per key, method and minute:
-- usage_events.meter = 'rpc.calls', dimensions {"method", "network_family", "outcome",
-- "archive"}. Billed units for one rating window:
SELECT e.account_id,
       SUM(e.quantity * w.billed_units *
           CASE WHEN (e.dimensions->>'archive')::boolean THEN w.archive_multiplier ELSE 1 END)
         AS billed_units
FROM usage_events e
JOIN LATERAL (
  SELECT billed_units, archive_multiplier
  FROM rpc_method_weights w
  WHERE w.network_family = e.dimensions->>'network_family'
    AND w.method IN (e.dimensions->>'method', '*')
    AND w.valid_during @> lower(e.occurred_during)
  ORDER BY (w.method = '*')             -- the specific method wins over the default
  LIMIT 1
) w ON TRUE
WHERE e.meter = 'rpc.calls'
  AND e.dimensions->>'outcome' NOT IN ('rate_limited', 'allowance_exhausted', 'server_error')
  AND lower(e.occurred_during) <@ :window
GROUP BY e.account_id;
```

Notes on the sketch:

- **Weights are price versions.** A method weight changes the customer's bill as surely as a price change does, so it is effective-dated and announced like one ([Pricing Catalogs](/books/hosting-and-cloud/pricing-catalogs#how-to-build-it)); a call is rated at the weight in effect when it was made. The unit's price per million is an ordinary SKU on `price_versions`.
- **Which outcomes bill is data.** The rating query excludes throttled, over-allowance and server-error outcomes, Infura's published rule; a provider that bills client errors adds a weight for that outcome rather than a code path.
- **Throughput has its own weight.** `throughput_units` feeds the gateway's token bucket, a `quotas` row with code `rpc.units_per_second` per account, separately from billing, which is how a trace can be cheap to buy and expensive to burst.
- **One signer per key is an exclusion constraint.** `held_during` covers the time a signer may sign plus the network's failover gap after it, so a second assignment can't start until the first has ended and the gap has passed; the switch procedure closes the old range only after confirming the old signer is stopped. The constraint stops the control plane from creating a double signer; doppelganger detection and the client's own protection database remain the last line for a machine that ignores the control plane.
- **History travels with the key.** Every assignment points at the slashing protection transfer that seeded it, so "what had this key signed before this signer started" is answerable after an incident.
- **The withdrawal address is the customer's.** A host or staking provider runs the signing key; principal and rewards go to an address the customer controls, recorded and never editable by the host's staff without the customer's signed request.
- **Events:** `node.synced`, `node.lagging`, `node.client_upgraded`, `rpc.weights_changed`, `validator.signer_assigned`, `validator.signer_released`, `validator.doppelganger_detected` and `validator.slashed` go through the [outbox](/docs/architecture/events#the-transactional-outbox); `validator.slashed` also freezes every assignment on the same host and client version until a person reviews them, because slashings correlate.

## Auditing

- **Every signer assignment and transfer.** Which machine held which key, when, with what protection history, so a slashing can be traced to the overlap or the missing history that caused it.
- **Weight and price changes.** Every method weight with its validity range and announcement, because a customer disputing a bill asks what a call cost on the day it was made.
- **Billed and unbilled outcomes.** Counts of throttled, exhausted and errored calls per account, which show that the published rule on what bills was applied.
- **Node versions and sync state.** Client versions and lag per node, since a chain's hard fork has a deadline and a node on an old version after it serves a different chain.
- **Terms enforcement on blockchain workloads.** Every action taken against a node, validator or miner, with the clause relied on, because the difference between a banned miner and an allowed node is exactly what a customer will contest.

## What This Means for the System You Build

- **Size node products by disk and bandwidth,** with local NVMe and headroom for growth, not by vCPU.
- **Meter RPC in weighted units** with effective-dated method weights, and publish which outcomes are billed.
- **Separate the billing weight from the throughput weight,** so expensive methods are rate-limited by their cost to serve.
- **Route history to archive pools** and price archive and trace access as what they are: different nodes running different clients.
- **Never make validator redundancy a second copy of the key.** One signer per key, enforced as a constraint, failover as a gap, and redundancy inside distributed validators or a single signer.
- **Move slashing protection history with every key move,** in the EIP-3076 format, and keep the record.
- **Write terms that name nodes as well as mining,** whichever way you decide, and give notice before enforcement takes a validator offline.
- **Watch your share of a network,** because a provider that hosts a large share of a chain's stake makes its own incidents into the chain's.

## References

**Specifications**

- [Ethereum consensus specs: Phase 0 beacon chain](https://raw.githubusercontent.com/ethereum/consensus-specs/master/specs/phase0/beacon-chain.md), slashable attestations and proposals, the slashings vector and withdrawal delay
- [Ethereum consensus specs: Bellatrix beacon chain](https://raw.githubusercontent.com/ethereum/consensus-specs/master/specs/bellatrix/beacon-chain.md), the proportional slashing multiplier of 3
- [Ethereum consensus specs: Electra beacon chain](https://github.com/ethereum/consensus-specs/blob/master/specs/electra/beacon-chain.md), the 4,096 penalty quotient, 32 ETH activation and 2,048 ETH maximum effective balance
- [Ethereum consensus specs: Phase 0 honest validator](https://github.com/ethereum/consensus-specs/blob/master/specs/phase0/validator.md), recording signed blocks before broadcast
- [EIP-3076: Slashing Protection Interchange Format](https://eips.ethereum.org/EIPS/eip-3076), creation date, purpose and the client-switching risk
- [Ethereum execution-apis](https://github.com/ethereum/execution-apis), the standard JSON-RPC method collection
- [Ethereum execution-apis: Engine API authentication](https://github.com/ethereum/execution-apis/blob/main/src/engine/authentication.md), JWT with HS256, port 8551, the 256-bit secret
- [Solana SIMD-0204: Slashable event verification](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0204-slashable-event-verification.md), status and scope

**Client and protocol documentation**

- [ethereum.org: Run a node](https://ethereum.org/en/developers/docs/nodes-and-clients/run-a-node/), minimum and recommended hardware, EIP-7870
- [ethereum.org: Nodes and clients](https://ethereum.org/en/developers/docs/nodes-and-clients/), execution and consensus clients, full and archive data, sync modes, client diversity
- [ethereum.org: JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/), the standard namespaces
- [Geth: Hardware requirements](https://geth.ethereum.org/docs/getting-started/hardware-requirements), full node disk and weekly growth
- [Geth: Sync modes](https://geth.ethereum.org/docs/fundamentals/sync-modes), snap sync and the 2022 archive size
- [Geth: Archive node](https://geth.ethereum.org/docs/fundamentals/archive), hash-based and path-based archive sizes
- [Geth: debug namespace](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-debug), non-standard methods
- [Reth: System requirements](https://reth.rs/run/system-requirements), full and archive disk, memory, bandwidth
- [Reth: trace namespace](https://reth.rs/jsonrpc/trace), Parity-style traces
- [Erigon: Hardware requirements](https://docs.erigon.tech/get-started/hardware-requirements), measured disk by mode, CPU, memory and bandwidth
- [Agave: Validator requirements](https://docs.anza.xyz/operations/requirements), CPU, memory, disks, network, cloud and Docker warnings, vote costs
- [Agave: Validator failover](https://docs.anza.xyz/operations/guides/validator-failover), identity switching with the tower or vote history file
- [Agave: Fork generation](https://docs.anza.xyz/consensus/fork-generation), duplicate blocks as a slashable offense by design
- [Anza: SIMD-0204, the first step to slashing on Solana](https://anza.xyz/blog/simd-0204-the-first-step-to-slashing-on-solana), no automatic slashing to date, duplicate blocks
- [Anza: SIMD-0212, slashing on Solana](https://www.anza.xyz/blog/simd-0212-slashing-on-solana), the proposed penalty curve under discussion
- [bitcoin.org: Running a full node](https://bitcoin.org/en/full-node), memory, disk, bandwidth and pruning minimum
- [Lighthouse: Doppelganger protection](https://lighthouse-book.sigmaprime.io/validator_doppelganger.html), the waiting period and the warning against two instances
- [Teku: Detect doppelgangers](https://docs.teku.consensys.com/how-to/prevent-slashing/detect-doppelgangers), two epochs, "a last resort option"
- [Teku: Slashing protection](https://docs.teku.consensys.com/concepts/slashing-protection), no protection for keys used on multiple nodes
- [Prysm: Slashing protection](https://prysm.offchainlabs.com/docs/wallet/slashing-protection), failover warnings and EIP-3076 export
- [Obol: Key concepts](https://docs.obol.org/learn/readme/key-concepts), threshold keys and the duplicate-node warning
- [Obol: Cluster configuration](https://docs.obol.org/learn/charon/cluster-configuration), quorum of ceiling(2n/3) and fault tolerance
- [SSV: Introduction](https://docs.ssv.network/learn/introduction/), key shares and operation through node failures

**Provider pricing and documentation**

- [Alchemy: Pricing](https://www.alchemy.com/pricing), plans, included CU, price per million, throughput
- [Alchemy: Compute unit costs](https://www.alchemy.com/docs/reference/compute-unit-costs), CU and throughput CU per method
- [Alchemy: Compute units](https://www.alchemy.com/docs/reference/compute-units), weights from average method durations
- [Alchemy: Throughput](https://www.alchemy.com/docs/reference/throughput), CU per second and the 10-second token bucket
- [Alchemy: Trace API quickstart](https://www.alchemy.com/docs/reference/trace-api-quickstart), plan requirement
- [Infura: Pricing](https://www.infura.io/pricing), plans, daily credits, credits per second, archive and trace access, and the FAQ's differing free-plan figures
- [Infura: Credit cost](https://docs.infura.io/get-started/pricing/credit-cost/), credits per method and which errors are charged
- [QuickNode: Pricing](https://www.quicknode.com/pricing), plans, credits, requests per second, overage, dedicated clusters
- [QuickNode: API credits](https://www.quicknode.com/api-credits), credits by chain tier and the trace and debug multipliers
- [Helius: Pricing](https://www.helius.dev/pricing), plans, credits, limits, overage and dedicated node price
- [Helius: Dedicated nodes](https://www.helius.dev/docs/dedicated-nodes), gRPC streaming, no history, transaction landing
- [Chainstack: Pricing](https://chainstack.com/pricing/), request units, plans and dedicated node prices
- [AWS: Amazon Managed Blockchain end of support](https://docs.aws.amazon.com/managed-blockchain/latest/hyperledger-fabric-dev/managed-blockchain-end-of-support.html), dates and migration paths
- [AWS: Amazon Managed Blockchain](https://aws.amazon.com/managed-blockchain/), the product page's end date
- [AWS: Amazon Managed Blockchain pricing](https://aws.amazon.com/managed-blockchain/pricing/), per-second nodes with a 1-minute minimum, storage and call pricing
- [Google Cloud: Blockchain Node Engine overview](https://docs.cloud.google.com/blockchain-node-engine/docs/overview), the managed node service and Ethereum support
- [Contabo: Crypto](https://contabo.com/en/crypto/), nodes and validators allowed, proof-of-work not allowed on VPS

**Terms**

- [AWS: Service Terms](https://aws.amazon.com/service-terms/), §1.25 on mining, October 22, 2026
- [AWS: Promotional credit terms](https://aws.amazon.com/awscredits/), the mining exclusion
- [Google Cloud: Terms of Service](https://cloud.google.com/terms), §3.3(d)(iv), October 12, 2026
- [Microsoft: Universal License Terms for Online Services](https://www.microsoft.com/licensing/terms/product/ForOnlineServices/all), the acceptable use clause on mining
- [DigitalOcean: Acceptable Use Policy](https://www.digitalocean.com/legal/acceptable-use-policy), mining without written permission, March 20, 2026
- [Hetzner: Terms and Conditions](https://www.hetzner.com/legal/terms-and-conditions/), §8.3, version 2.0.0 of October 27, 2021

**Datasets**

- [validators.app: Solana mainnet data centers](https://www.validators.app/data-centers?network=mainnet), stake share by data center, October 28, 2026
- [validators.app: AS20326](https://www.validators.app/asns/20326?network=mainnet), TeraSwitch's stake share and validator count
- [validators.app: AS396356](https://www.validators.app/asns/396356?network=mainnet), Latitude.sh's stake share and validator count
- [validators.app: AS24940](https://www.validators.app/asns/24940?network=mainnet), Hetzner's single validator
- [Bitnodes: Latest snapshot](https://btcnodes.io/api/v1/snapshots/?limit=1), reachable Bitcoin nodes by network, October 28, 2026
- [clientdiversity.org](https://clientdiversity.org/), the removal of the Ethernodes data

**In practice**

- [SSV: Slashing post-mortem, September 2025](https://ssv.network/blog/slashing-post-mortem-september-2025), 40 validators and the parallel instance outside SSV
- [The Block: Staked validators slashed](https://www.theblock.co/post/93730/eth2-validators-slashed-staked-bug), February 2021, 75 validators and the disabled protection database (press)
- [The Block: Hetzner and Ethereum nodes](https://www.theblock.co/post/165976/security), August 2022, Hetzner's reported stance on nodes and its 16% share of hosted nodes (press)
- [The Block: 1,000 Solana validators go offline](https://www.theblock.co/post/182283/1000-solana-validators-go-offline-as-hetzner-blocks-server-access), November 2022 (press)
