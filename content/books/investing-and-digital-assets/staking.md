+++
title = "Staking as a Product"
nav_title = "Staking"
description = "Custodial staking as a product: commissions worked, unbonding and exit queues, slashing pass-through, liquid staking tokens, the SEC record and tax."
category = "Investing & Digital Assets Industry"
order = 2548
part = "Crypto Exchanges"
tags = ["crypto", "staking", "proof-of-stake", "validators", "liquid-staking", "sec"]
+++

Staking is the one crypto product that pays a yield the platform didn't invent. On a proof-of-stake chain, validators lock the chain's native asset as a bond, sign blocks and votes, and earn new coins and fees for it; a customer who stakes through an exchange lends their coins to that machinery and receives the rewards, less the platform's cut. For the platform it is asset-based revenue that doesn't depend on trading: Coinbase booked $85.7 million of blockchain rewards in the third quarter of 2026 (down from $184.6 million a year earlier), and its deck put the quarter's 3% sequential rise down to prices and "growth in native units staked." For the customer it is a deposit that can't be withdrawn on demand, can in principle shrink, and was, until 2025, the product the SEC said was a security when Kraken offered it.

The engineering is mostly about time and attribution. Rewards accrue on chain to validators, not to customers, so the platform's ledger has to allocate them; unstaking takes days to weeks on chain, so a customer's "available" balance and their "staked" balance diverge; and a slashing penalty is a loss on a pooled validator that has to land on somebody's ledger line. This chapter covers proof of stake in brief, custodial staking and how platforms structure it, commissions with a worked reward, unbonding and Ethereum's exit queue with worked numbers, slashing pass-through, liquid staking tokens, the SEC record from the 2023 Kraken settlement to the 2025 staff statement and the Commission's 2026 interpretation, staking in ETPs and tax. It extends `wallets`, `transfers` and `fees` from [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business. Running validators, slashing protection and validator hosting are Hosting & Cloud's [Validators and Slashing](/books/hosting-and-cloud/blockchain-nodes-and-validators#validators-and-slashing); the commission as a revenue line is [How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models#staking-and-custody-fees).

## How the Platforms Do It

How platforms that publish their terms structure staking, as of November 2026:

| Platform | Commission | Liquidity | Slashing | Notes |
| --- | --- | --- | --- | --- |
| **Kraken** | 30% of rewards on Flexible staking and Auto Earn; Bonded tiered by total balance from 25% down to 0% | Flexible: unstake "at any time without being subjected to an unbonding period"; Bonded: on-chain unbonding of "3 or more days, depending on the asset" | Kraken will "compensate you for any slashing penalty or nonpayment of staking rewards," with exceptions (customer action, maintenance, bugs, hacks) | Rewards paid weekly; geographic restrictions apply |
| **BitGo** | "a fixed percentage commission on all staking rewards received by our clients" | Per chain | Not stated in the 10-K excerpt | $15.6 billion of Assets Staked at December 31, 2025; "We do not offer liquid staking"; client keeps custody and ownership |
| **Coinbase** | Not in the 10-Q | Not in the 10-Q | Not in the 10-Q | Blockchain rewards revenue $85.7 million in Q3 2026 |
| **Lido** (protocol) | Fees on rewards, distributed to staking modules (node operators) and the protocol treasury | stETH, a token for the staked position, tradeable at once; redemption through a FIFO withdrawal queue that issues an NFT (unstETH) | Losses reduce every holder's stETH balance | stETH balances rebase daily on the oracle report |

The structures converge on one shape: the customer's coins sit in validators the platform or its provider runs, rewards are passed through net of a percentage commission, the platform decides how much liquidity to promise above what the chain gives, and slashing is either covered by the platform or passed through to every staker in the pool.

## Proof of Stake in Brief

On Ethereum, a validator activates with 32 ETH and, since the Electra upgrade, can carry an effective balance of up to 2,048 ETH; it earns for attesting and proposing, loses small amounts for being offline, and is slashed for signing two incompatible messages (Hosting & Cloud's [What is slashable](/books/hosting-and-cloud/blockchain-nodes-and-validators#what-is-slashable) has the offenses and penalties). Slots are 12 seconds and epochs 32 slots, 6.4 minutes. Other chains differ in the details that matter to a product: the unbonding period, whether slashing is enforced (Solana has no enforced slashing as of the Hosting & Cloud chapter's October 2026 check), whether stake is delegated to a validator chosen by the holder, and how rewards are paid (into the validator's balance, to a withdrawal address, or claimable).

For a platform, three chain facts decide the product: how long it takes to get in, how long to get out, and what can be lost. Everything else is presentation.

## Custodial Staking

A platform offering staking has three decisions to make, and the SEC's May 2025 staff statement (below) turns one of them into the line between a ministerial service and an investment contract:

- **Who decides to stake.** The customer opts in, per asset and amount, or the platform stakes on its own discretion. The staff statement covers custodial arrangements only where "The Custodian does not decide whether, when, or how much of an owner's Covered Crypto Assets to stake"; a platform that stakes customers' coins at its discretion is outside it. My rule: staking is a per-customer, per-asset election recorded as a disclosure acknowledgment, never a default.
- **Whose validators.** The platform runs its own, uses a staking provider, or delegates to third-party operators. The choice determines who holds the signing keys (always the operator), who holds the withdrawal credentials (it should be the platform, never the operator), and where slashing risk sits.
- **What liquidity to promise.** The chain's unbonding period is the floor; the platform can offer faster exits by keeping an unstaked buffer, which is a treasury decision like a hot wallet float ([Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets) covers the wallet tiers).

In the ledger, staking moves where an asset is and what it can do, not whose it is. A customer's 10 ETH staked remains a customer line in ETH; the omnibus side moves from a hot or cold wallet to a `staking` wallet (the validators' withdrawal address); and the customer's balance splits into staked and available states that the platform shows separately. The same NYDFS principle as the rest of custody applies: the internal ledger must say at every moment which customers' coins are in which validators, so a trustee could hand them back ([The Life of a Crypto Trade](/books/investing-and-digital-assets/investing-business#the-life-of-a-crypto-trade)).

## Commissions, Worked

Rewards arrive on chain as validator balance growth or as a sweep to the withdrawal address; the platform allocates them to customers pro rata by stake and time, takes its commission and credits the rest. A worked week of my own, with an illustrative 3.0% gross annual reward rate (not a quoted rate) and integer wei throughout:

```text
customer stake        10 ETH = 10,000,000,000,000,000,000 wei
gross rate            3.00% a year, paid weekly: 10 ETH × 0.03 / 52
gross reward          5,769,230,769,230,769 wei        (0.005769… ETH, floored)

commission 25%
customer credit       5,769,230,769,230,769 × 7,500 / 10,000 = 4,326,923,076,923,076 wei (floored)
commission            5,769,230,769,230,769 − 4,326,923,076,923,076 = 1,442,307,692,307,693 wei

commission 30%
customer credit       4,038,461,538,461,538 wei (floored)
commission            1,730,769,230,769,231 wei

net annual rate       3.00% × (1 − 0.30) = 2.10%
```

The journal entry for the week has three ETH lines: the staking wallet's omnibus line up by the gross reward (the chain's balance grew), the customer's line up by the net, and the firm's fee line up by the commission. Each customer's credit floors; the commission absorbs the residual, which is consistent and auditable (the alternative, flooring the commission, systematically favors customers by a few wei and is also fine if it is the rule). The commission is a `fees` row under a versioned schedule, so a customer's statement shows gross, commission and net. Kraken's Bonded tiers (25% below $1 million of bonded balance down to 0% at $100 million and above) are a fee schedule with tiers, the same structure as maker and taker tiers ([Crypto Trading Products](/books/investing-and-digital-assets/crypto-trading-products#the-order-book-maker-taker-and-tiers) covers those).

Three things make the allocation harder than the arithmetic:

- **Time-weighting.** A customer who staked on Wednesday earns from activation, not from Monday; the allocation needs each customer's stake per reward period, which is a query over staking position states, not a balance.
- **Activation lag.** Stake that is deposited but not yet active earns nothing on chain; a platform that pays from deposit is paying rewards out of its own pocket.
- **Different validators earn different amounts.** Proposals are random; a validator that proposed a block with large fees earns more that day. Pooling across the fleet and paying the pool's rate is the usual answer, and the disclosure should say so.

## Unbonding and Liquidity

### Getting out of Ethereum, worked

An Ethereum validator leaves through an exit queue, then waits, then is swept. The consensus specifications set the pace: the balance churn limit per epoch is the larger of 128 ETH and total active stake divided by 65,536, and activations and exits are capped at 256 ETH per epoch (`MAX_PER_EPOCH_ACTIVATION_EXIT_CHURN_LIMIT`). After exit, a validator waits `MIN_VALIDATOR_WITHDRAWABILITY_DELAY`, 256 epochs, before it is withdrawable; then the withdrawal sweep, which processes at most 16 withdrawals per block, pays it out. My arithmetic for a busy queue:

```text
churn cap             256 ETH per epoch whenever total stake exceeds 256 × 65,536 = 16,777,216 ETH
epochs per day        86,400 s / (32 × 12 s) = 225
exit capacity         256 × 225 = 57,600 ETH a day

ETH ahead in queue    2,000,000 ETH
queue wait            2,000,000 / 57,600 = 34.7 days
withdrawability       256 epochs × 6.4 min = 27.3 hours
sweep                 up to about 7 days at 800,000 validators (ethereum.org's estimate)

customer's wait       roughly 36 to 43 days from request to coins in the platform's wallet
```

The same queue governs entry, which is why the time to start earning also varies. The point for the product is that "unstaking takes N days" is not a constant: it is a function of how many others are leaving, and it can move from hours to weeks in a market event. The product must show an estimate computed from the current queue, not a promise.

### Partial withdrawals and compounding

Rewards on Ethereum arrive differently by credential type. Validators with 0x01 (legacy) credentials have everything above the maximum effective balance swept to the withdrawal address automatically; 0x02 (compounding) validators keep earning on balances up to 2,048 ETH and are swept only above it. For a platform, 0x01 means rewards show up as small on-chain receipts the chain watcher must recognize as rewards rather than deposits (the withdrawal address is a `staking` wallet, and sweeps into it are a known transaction type); 0x02 means rewards accrue inside the validator and are realized only on withdrawal, so the platform credits customers from the beacon chain balance it observes, not from cash it has received.

### Faster than the chain

Kraken's Flexible staking ("unstake your assets at any time") shows the product answer: the platform keeps part of the pool unstaked, or stakes only what it expects to keep, and pays exits from the buffer. That turns a chain wait into a liquidity risk the platform carries. The SEC staff statement treats "Early Unbonding," which "merely shortens the protocol's effective unbonding period," as an ancillary service within its view, so the structure doesn't change the analysis; it does change the treasury, because a wave of exits drains the buffer and leaves the platform waiting on the queue. My rule: size the buffer against the platform's own worst week of exits, and when it runs out, switch the product to the chain's timeline and say so on the screen.

## Slashing Pass-Through

A slashed validator in a pool loses the penalty from the pooled stake, and the platform has to decide whose loss it is. There are two coherent answers:

- **The platform covers it.** Kraken compensates customers for slashing and missed rewards except in listed cases; the SEC staff lists "Slashing Coverage," where "the Service Provider reimburses or indemnifies a staking customer against loss resulting from slashing," as an ancillary service. In the ledger, the omnibus line falls by the penalty and a firm line pays it; customer lines don't move.
- **The pool bears it.** Every staker in the affected pool loses pro rata, as stETH holders do in Lido's design. Each customer's line falls by their share; the disclosure must have said this before the customer staked.

What is not coherent is deciding after the event. The terms decide, they are versioned, and the allocation runs by rule. Because slashing penalties grow with how many validators are slashed at the same time (the correlation penalty), a platform's whole fleet slashed by one operational mistake is the scenario to size coverage against, and the reason one operator, one client implementation and one region should never carry all of it.

## Liquid Staking Tokens

A liquid staking token is a transferable receipt for staked coins. Lido's stETH is the largest: holders deposit ETH, Lido's node operators stake it, and each holder owns a share of the pool; "Instead of storing a map with account balances, Lido stores which share of the total pool is owned by the account," and balances change when the daily oracle report is applied, with no `Transfer` events for those pool-wide changes. Redemption goes through `WithdrawalQueueERC721`, "a withdrawal requests FIFO queue and a respective NFT (unstETH)."

For an exchange that lists or custodies an LST, three consequences:

- **It is a rebasing token.** A balance that changes without transfers breaks any ledger that only credits observed transfers; the treatment is the one in [Rebasing tokens](/books/investing-and-digital-assets/tokens-and-standards#rebasing-tokens), and many platforms hold the non-rebasing wrapper instead.
- **Its price can leave par.** An LST trades on markets, and its market price can sit below the staked asset when exits are queued or confidence falls. As collateral it needs its own mark and haircut, which is the lesson of October 10, 2025 for any asset that is supposed to be worth one unit of something else ([Perpetuals & Crypto Derivatives](/books/investing-and-digital-assets/perpetuals-and-crypto-derivatives#october-10-2025)).
- **The regulatory analysis is separate.** The SEC staff's May 2025 statement expressly does not address liquid staking, restaking or liquid restaking. The Commission's March 23, 2026 interpretation does (below): a Staking Receipt Token that is a receipt for a non-security crypto asset not subject to an investment contract is not a security, while a receipt for a digital security is one. Restaking is still outside what I've sourced here.

A platform that offers its own LST is issuing a token whose redemption depends on the platform's validators and its terms, which puts it closer to [Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin) than to staking.

## The SEC Record

- **February 9, 2023: Kraken.** The SEC charged Payward Ventures and Payward Trading with failing to register the offer and sale of their staking-as-a-service program. Customers transferred assets to Kraken for advertised annual returns of "as much as 21 percent"; Kraken pooled them and staked on their behalf; investors "lose control of those tokens" and take on platform risk with "very little protection." Kraken agreed to pay $30 million in disgorgement, prejudgment interest and civil penalties, and to "immediately cease offering or selling securities through crypto asset staking services or staking programs." The Commission's theory was that the program, as structured, was an investment contract: the platform promised the returns, and the customer relied on its efforts.
- **February 27, 2025: Coinbase.** The SEC dismissed its civil action against Coinbase by joint stipulation, "Given the pending work of the Crypto Task Force," and not on "any assessment of the merits of the claims." [Securities, Commodities & Crypto Market Structure](/books/investing-and-digital-assets/securities-or-commodities) covers the case and the other 2025 dismissals.
- **May 29, 2025: protocol staking.** Corporation Finance staff stated that protocol staking in three forms (self or solo staking, self-custodial staking directly with a third party, and custodial arrangements) does not involve the offer and sale of securities, because the node operator's or custodian's role is "administrative or ministerial in nature." The custodian may subtract "its fees (whether fixed or a percentage of such amount)." Four ancillary services stay within the view: slashing coverage, early unbonding, alternate rewards payment schedules and amounts "provided the reward amounts are not fixed, guaranteed, or greater than those awarded by the protocol," and aggregation of assets to meet minimums. The statement "has no legal force or effect": it is staff views, not a rule.
- **March 23, 2026: the Commission's interpretation.** The SEC's release on applying the securities laws to crypto assets (Release Nos. 33-11412 and 34-105020, 91 FR 13714, effective the same day) puts the same analysis at Commission level: Protocol Staking Activities, custodial arrangements included, "do not involve the offer and sale of a security," on the condition that the custodian "does not decide whether, when, or how much of a Depositor's digital commodities to stake," and the custodian's role is "administrative or ministerial in nature." It also covers liquid staking through Staking Receipt Tokens, as above. It is an interpretation, not a statute; [The 2026 Taxonomy](/books/investing-and-digital-assets/securities-or-commodities#the-2026-taxonomy) covers the rest of the release.

Read together, the 2023 order, the 2025 statement and the 2026 interpretation give a product its design constraints: the customer decides to stake, rewards are the protocol's rewards less a stated fee, nothing is fixed or guaranteed above what the chain pays, and any liquidity or coverage the platform adds is a convenience, not a return. A product that promises a fixed yield, stakes customers by default, or pays more than the protocol is outside both and back where Kraken was in 2023.

## Staking in ETPs

A fund that stakes faces the same three decisions as a platform plus one more, keeping enough unstaked to meet redemptions on the chain's exit timeline; [Crypto ETPs](/books/investing-and-digital-assets/crypto-etps#staking-inside-etps) covers how a fund stakes, how it keeps enough unstaked to meet redemptions, and how rewards reach NAV. One public case: the Grayscale Ethereum Staking ETF "commenced Staking" on October 6, 2025, and at June 30, 2026 $999,963 thousand of its $1,223,358 thousand of ether was staked, about 82%, with the sponsor's staking fee and validator fees together "an aggregate of 23% of the gross staking rewards." I haven't opened the filings for the other products that stake. <!-- source-gap: staking-in-etps | missing | the full list of US ETPs that stake, since when, through which custodians and providers, and the share staked | closes with: the products' prospectuses or 10-Q filings and the exchange rule filings | checked: 2026-11-05 -->

## Tax

The IRS's Rev. Rul. 2023-14 holds that a cash-method taxpayer who stakes and receives validation rewards includes their fair market value in gross income "in the taxable year in which the taxpayer gains dominion and control over the validation rewards," valued "as of the date and time the taxpayer gains dominion and control," and that "The same is true" when the taxpayer stakes "through a cryptocurrency exchange." The ruling's example puts dominion and control at the date the rewards can be sold, after a lockup ends. For the platform, every reward credit is an income event with a timestamp and a fair market value, and each credit opens a `tax_lots` row with that value as basis ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)); [Crypto Tax](/books/investing-and-digital-assets/crypto-tax#staking) covers reporting, and the gross-versus-net question (whether the commission is income to the customer and then an expense) is one the platform's tax team decides once and applies consistently.

## How to Build It

Staking adds a position per customer and asset with its states, the assignment of pooled stake to validators, reward accruals with their allocation, unbonding requests with chain-derived estimates, and slashing events with their allocation rule. The commission is a `fees` row; the reward credit is a journal entry; the withdrawal credentials are an `addresses` row on a `staking` wallet.

```sql
CREATE TABLE staking_positions (           -- one per account and asset; states over time
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  instrument_id      UUID NOT NULL REFERENCES instruments (id),
  program            TEXT NOT NULL CHECK (program IN ('flexible', 'bonded', 'liquid')),
  election_disclosure_id UUID NOT NULL REFERENCES disclosures (id),  -- the customer's opt-in
  fee_schedule_id    UUID NOT NULL REFERENCES fee_schedules (id),
  slashing_policy    TEXT NOT NULL CHECK (slashing_policy IN ('platform_covers', 'pro_rata')),
  status             TEXT NOT NULL CHECK (status IN ('pending_activation', 'active',
                       'unbonding', 'closed')),
  opened_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_id, instrument_id, program)
);

CREATE TABLE validator_assignments (       -- which pooled stake sits in which validator
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  wallet_id          UUID NOT NULL REFERENCES wallets (id),      -- purpose 'staking'
  chain_id           UUID NOT NULL REFERENCES chains (id),
  validator_ref      TEXT NOT NULL,          -- pubkey or vote account
  operator           TEXT NOT NULL,          -- 'self', or the provider
  withdrawal_address_id UUID NOT NULL REFERENCES addresses (id),  -- the platform's, never the operator's
  stake              NUMERIC(78, 0) NOT NULL,
  valid_during       TSTZRANGE NOT NULL,
  UNIQUE (chain_id, validator_ref, valid_during)
);

CREATE TABLE reward_accruals (             -- one per pool, period and customer
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  staking_position_id UUID NOT NULL REFERENCES staking_positions (id),
  period             TSTZRANGE NOT NULL,
  stake_weighted     NUMERIC(78, 0) NOT NULL,  -- stake × active time, for the pro rata share
  gross              NUMERIC(78, 0) NOT NULL,
  commission_fee_id  UUID REFERENCES fees (id),
  net                NUMERIC(78, 0) NOT NULL,
  fair_value_usd     BIGINT NOT NULL,          -- cents, at dominion and control, for income reporting
  journal_entry_id   UUID NOT NULL REFERENCES journal_entries (id),
  UNIQUE (staking_position_id, period),
  CHECK (net >= 0 AND net <= gross)
);

CREATE TABLE unbonding_requests (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  staking_position_id UUID NOT NULL REFERENCES staking_positions (id),
  quantity           NUMERIC(78, 0) NOT NULL CHECK (quantity > 0),
  route              TEXT NOT NULL CHECK (route IN ('chain', 'buffer')),  -- chain exit or platform float
  estimate_at_request TIMESTAMPTZ,           -- from the current queue, shown to the customer
  status             TEXT NOT NULL CHECK (status IN ('requested', 'exit_queued', 'withdrawable',
                       'swept', 'credited', 'canceled')),
  idempotency_key    TEXT NOT NULL UNIQUE,
  requested_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  credited_at        TIMESTAMPTZ
);

CREATE TABLE slashing_events (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  validator_assignment_id UUID NOT NULL REFERENCES validator_assignments (id),
  epoch_or_slot      BIGINT NOT NULL,
  penalty            NUMERIC(78, 0) NOT NULL CHECK (penalty > 0),
  cause              TEXT,                   -- from the post-mortem
  allocation         TEXT NOT NULL CHECK (allocation IN ('platform_covers', 'pro_rata')),
  journal_entry_id   UUID NOT NULL REFERENCES journal_entries (id),
  case_id            UUID REFERENCES cases (id)
);
```

The unbonding states:

| From | Event | To |
| --- | --- | --- |
| `requested` | Route is buffer and the buffer covers it | `credited` |
| `requested` | Route is chain; exit submitted | `exit_queued` |
| `exit_queued` | Validator exited and the withdrawability delay passed | `withdrawable` |
| `withdrawable` | Sweep lands in the staking wallet | `swept` |
| `swept` | Ledger moves the quantity from staked to available | `credited` |
| `requested` | Customer cancels before submission | `canceled` |

Notes on the sketch:

- **Rewards reconcile to the chain.** Per pool and period, the sum of `gross` equals the observed balance growth or sweeps of the pool's validators; the difference is a `recon_breaks` row, not a rounding line.
- **The election is a record.** A staking position can't exist without the disclosure the customer acknowledged, which is the evidence that the customer, not the custodian, decided to stake.
- **Withdrawal credentials belong to the platform.** `validator_assignments.withdrawal_address_id` points at a platform address; a validator whose credentials point elsewhere is a break, the rule Hosting & Cloud states from the host's side.
- **Estimates are computed and stored.** The exit estimate shown to the customer is written on the request, so a complaint about a slower exit can be compared with what was shown.
- **Events:** `staking.activated`, `reward.credited`, `unbonding.requested`, `unbonding.credited`, `slashing.detected` through the [outbox](/docs/architecture/events#the-transactional-outbox).

## Auditing

- **Every opt-in** with the disclosure and fee schedule version the customer accepted.
- **Every reward period** per pool, reconciled to the chain, and each customer's allocation with gross, commission and net.
- **Every unbonding request** with route, estimate shown and actual timeline.
- **Every validator** with its operator, withdrawal credentials and stake over time.
- **Every slashing event** with its cause, penalty and the allocation the terms required.
- **Income records** per reward with fair value at the time of dominion and control.

## What This Means for the System You Build

- **Make staking an opt-in per asset and amount,** recorded as a disclosure, never a default or a platform decision.
- **Pass through protocol rewards less a stated commission;** never fix, guarantee or exceed what the chain pays.
- **Keep withdrawal credentials on platform addresses** and check every validator against them.
- **Compute unbonding estimates from the live queue** and store what you showed.
- **Decide slashing allocation in the terms,** before the event, and size coverage against a fleet-wide mistake.
- **Treat liquid staking tokens as rebasing, off-par collateral** with their own mark and haircut.
- **Record each reward as an income event and a tax lot** at fair value when the customer can dispose of it.

## References

**Law and regulation**

- [IRS: Rev. Rul. 2023-14](https://www.irs.gov/pub/irs-drop/rr-23-14.pdf), staking rewards included in gross income at fair market value when the taxpayer gains dominion and control, including through an exchange

**Regulators and guidance**

- [SEC: Press Release 2023-25, Kraken to discontinue unregistered offer and sale of crypto asset staking-as-a-service program and pay $30 million (February 9, 2023)](https://www.sec.gov/newsroom/press-releases/2023-25), the program, the advertised returns and the undertaking
- [SEC: Press Release 2025-47, dismissal of the Coinbase case (February 27, 2025)](https://www.sec.gov/newsroom/press-releases/2025-47), the joint stipulation and its stated basis
- [SEC Division of Corporation Finance: Statement on certain protocol staking activities (May 29, 2025)](https://www.sec.gov/newsroom/speeches-statements/statement-certain-protocol-staking-activities-052925), covered forms of staking, the custodian condition, fees, ancillary services and exclusions
- [SEC and CFTC: Application of the Federal Securities Laws to Certain Types of Crypto Assets and Certain Transactions Involving Crypto Assets (Release Nos. 33-11412, 34-105020; 91 FR 13714, March 23, 2026)](https://www.federalregister.gov/documents/full_text/html/2026/03/23/2026-05635.html), protocol staking and custodial arrangements, the custodian condition, and Staking Receipt Tokens

**Filings**

- [Coinbase Global: Form 10-Q for the third quarter of 2026](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000122/coin-20260930.htm), blockchain rewards revenue
- [Coinbase Global: Third quarter 2026 earnings deck (8-K exhibit)](https://www.sec.gov/Archives/edgar/data/0001679788/000167978826000121/q326earningsdeck_vsec.htm), the sequential change in blockchain rewards and its causes
- [BitGo Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1740604/000174060426000020/btgo-form10xk.htm), Assets Staked, the fixed percentage commission and no liquid staking
- [Grayscale Ethereum Staking ETF: Form 10-Q for the second quarter of 2026](https://www.sec.gov/Archives/edgar/data/1725210/000172521026000016/ethe-20260630.htm), staking since October 6, 2025, the staked share and the 23% aggregate fee

**Standards and protocols**

- [Ethereum consensus specifications: Electra beacon chain](https://github.com/ethereum/consensus-specs/blob/master/specs/electra/beacon-chain.md), the balance churn limit and the activation and exit churn cap
- [Ethereum consensus specifications: Phase 0 beacon chain](https://raw.githubusercontent.com/ethereum/consensus-specs/master/specs/phase0/beacon-chain.md), the churn limit quotient, withdrawability delay and slots per epoch
- [Ethereum.org: Staking withdrawals](https://ethereum.org/en/staking/withdrawals/), partial and full withdrawals, 0x01 and 0x02 credentials, 16 withdrawals per block and sweep times
- [Lido: Lido contract](https://docs.lido.fi/contracts/lido), share-based stETH balances, daily oracle reports and the withdrawal queue NFT

**Vendor documentation**

- [Kraken: Overview of staking on Kraken](https://support.kraken.com/hc/en-us/articles/360037682011-Overview-of-staking-on-Kraken), commissions by program, weekly payment, unbonding, slashing compensation and geographic restrictions
