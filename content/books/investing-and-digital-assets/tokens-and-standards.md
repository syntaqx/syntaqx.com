+++
title = "Tokens & Token Standards"
nav_title = "Tokens & Standards"
description = "Native assets and tokens: ERC-20 approvals and decimals, nonstandard tokens like USDT, NFTs, SPL and Token-2022, rebasing, proxies, freezes and spoofed tokens."
category = "Investing & Digital Assets Industry"
order = 2537
part = "Chains and Wallets"
tags = ["tokens", "erc-20", "erc-721", "spl", "stablecoins", "smart-contracts"]
+++

A chain's native asset (BTC, ETH, SOL) is part of the protocol: its balances are kept by the chain itself, and it pays the fees. Almost everything else a platform lists is a token, and a token is a program. USDC on Ethereum is a contract at one address whose storage holds a table of balances and whose code decides who may move them, and that code can blacklist an address, pause every transfer, or be replaced with different code by whoever holds the admin key. Standards like ERC-20 fix the interface (the function names and events every wallet and exchange calls) but not the behavior behind it, and the most widely held dollar token on Ethereum doesn't follow the standard's return values. A platform that lists a token is trusting its contract, its issuer and its admin keys, and has to integrate with the token as written, not as specified.

This chapter covers native assets against tokens, ERC-20 in depth (the interface, decimals, approvals with a worked call, permits), the nonstandard tokens that break integrations (USDT, fee-on-transfer and rebasing tokens), NFTs under ERC-721 and ERC-1155, Solana's SPL tokens and Token Extensions, upgradeable proxies and admin keys, freeze and blacklist functions, and token metadata and spoofed tokens. It extends `instruments` and `asset_networks` from [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business, where one instrument (USDC) has one `asset_networks` row per chain. The issuer's side of freezes, and the law behind them, is [Freezes, Blacklists & Seizures](/books/investing-and-digital-assets/freezes-and-onchain-compliance); deciding whether to list a token at all is [Listing & Delisting Assets](/books/investing-and-digital-assets/listing-assets); in-game tokens and NFTs are Gaming's [Trading and Real-Money Markets](/books/gaming/economies-and-entitlements#trading-and-real-money-markets).

## How the Issuers Do It

What the contracts behind widely held tokens actually allow, from their published designs and verified code, as of November 2026:

| Token | Standard and decimals | Who can stop or move holders' tokens | Upgradeable | Integration traps |
| --- | --- | --- | --- | --- |
| **USDC** (Circle, FiatToken) | ERC-20 on EVM chains, 6 decimals | A **blacklister** role: a blacklisted address can't transfer, receive, mint or burn; a **pauser** halts transfers, mints and burns | Yes: `FiatTokenProxy` delegates to an implementation; "Only the `admin` role may call `upgradeTo`" | Minting is allowance-gated per minter; while paused, blacklist edits and upgrades still work |
| **USDT** (Tether) on Ethereum | ERC-20-like, 6 decimals; compiled with Solidity 0.4.18 | `addBlackList` and `destroyBlackFunds` (burns a blacklisted address's balance); `pause` | Can `deprecate` itself in favor of an `upgradedAddress` | `transfer` and `approve` return nothing; a fee parameter (`setParams(newBasisPoints, newMaxFee)`) exists in the contract |
| **stETH** (Lido) | ERC-20, rebasing | Protocol governance | Yes | Balances change daily without transfers; transfers can arrive 1 to 2 wei short; most bridges can't handle rebases |
| **wstETH** (Lido) | ERC-20, non-rebasing wrapper of stETH | As stETH | Yes | Value per token grows instead of the balance; Lido recommends it for DeFi and bridges |
| **Token-2022 mints** (Solana) | SPL Token Extensions, decimals in the mint | Optional **freeze authority**, **permanent delegate** ("unlimited delegate privileges over any account for that mint"), **pausable** | Program-level; extensions fixed at mint creation | Transfer fees withheld in the recipient's account; default-frozen accounts; transfer hooks run custom code |

The table is the argument of this chapter: the same word, "token", covers contracts with very different powers, and a platform's integration and its disclosures to customers both depend on which powers the contract has.

## Native Assets and Tokens

A native asset moves by a transaction whose value field the protocol itself debits and credits. A token moves by a transaction that calls a contract, and the contract updates its own storage. Three differences follow for an exchange:

- **Fees are always native.** A token transfer pays gas in ETH on Ethereum and in SOL on Solana; a customer with only USDC can't send it. Every address the platform sends tokens from needs a native float ([Gas, Fees and Who Pays Them](/books/payments/stablecoins#gas-fees-and-who-pays-them)).
- **Detection differs.** A native ETH transfer between ordinary accounts appears in the transaction's value; a native transfer made by a contract (an internal transaction) appears only in a trace. A token transfer appears as an event log emitted by the token contract. A deposit watcher needs both paths ([Logs, Traces and Balances](/books/investing-and-digital-assets/chain-data-and-indexing#logs-traces-and-balances)).
- **Identity is an address.** ETH on Ethereum has no contract; USDC on Ethereum is `(chain 1, contract 0xA0b8...)`, and USDC on Base is a different contract on a different chain. That is why the core model separates `instruments` from `asset_networks`, and why the Payments volume treats bridged `USDC.e` as a different token ([What a Payment Stablecoin Is](/books/payments/stablecoins#what-a-payment-stablecoin-is)).

## ERC-20

### The interface

ERC-20 (created November 19, 2015) defines six required functions, three optional ones (`name`, `symbol`, `decimals`) and two events. The parts an exchange calls:

```solidity
interface IERC20 {
    function balanceOf(address owner) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function decimals() external view returns (uint8);  // OPTIONAL in the standard

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

The standard says three things integrators forget. "Callers MUST handle `false` from `returns (bool success)`" and "MUST NOT assume that `false` is never returned!" "Transfers of 0 values MUST be treated as normal transfers and fire the `Transfer` event," which attackers use (below). And `decimals` is optional: interfaces "MUST NOT expect these values to be present." OpenZeppelin's widely used implementation defaults to 18 and notes that decimals are for display only; the contract's arithmetic is in base units.

### Decimals

A token's `decimals` is a display exponent: a balance of 250,000,000 base units in a 6-decimal token is 250 tokens. USDC and USDT use 6; most tokens use 18. The exponent is per `asset_networks` row, not per instrument, because the same asset can have different decimals on different chains, and the platform's ledger stores base units with the exponent from a table ([Exponents Come From a Table](/docs/money/amounts#exponents-come-from-a-table)). Getting it wrong by twelve places turns a deposit of 250 USDC into 250 trillion, or into 0.00000000025; the defense is to read `decimals` once at listing, verify it against the issuer's documentation, store it, and refuse to credit a token whose stored exponent is missing.

### Approvals, worked

`approve` lets a spender (a DEX router, a lending pool, a payment contract) later call `transferFrom` up to an allowance. A platform that offers DeFi from a customer's wallet, or a wallet that shows what the customer is signing, needs to read these calls exactly.

A customer approves a router at `0x1111...1111` to spend 250 USDC (6 decimals): 250 × 10^6 = 250,000,000 = `0xee6b280`. The transaction calls the USDC contract with calldata of a 4-byte selector, the first four bytes of keccak-256 of `approve(address,uint256)`, which is `0x095ea7b3`, then each argument padded to 32 bytes:

```text
0x095ea7b3
  0000000000000000000000001111111111111111111111111111111111111111   spender
  000000000000000000000000000000000000000000000000000000000ee6b280   value: 250 USDC
```

The contract emits `Approval(owner, spender, 250000000)`. When the router later pulls 100 USDC with `transferFrom`, the allowance falls to 150 USDC and the contract emits `Transfer(owner, recipient, 100000000)`, whose first topic is keccak-256 of `Transfer(address,address,uint256)`, `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`, the hash every indexer filters on.

Three risks live in that flow:

- **The allowance race.** `approve` overwrites. If the customer lowers an allowance from 250 to 100, a spender watching the mempool can spend the old 250 before the change lands and then the new 100. EIP-20's mitigation is to "set the allowance first to `0`" before setting a new nonzero value; the contract doesn't enforce it, but USDT does, so a raw `approve` from nonzero to nonzero on USDT fails. OpenZeppelin's `forceApprove` exists for tokens that "require the approval to be set to zero before setting it to a non-zero value."
- **Unlimited approvals.** Many apps request an allowance of 2^256 − 1 (`0xffff...ffff`, 64 hex digits), so the customer never approves again. If the spender contract is malicious or later compromised, the whole balance is reachable, now and later. A wallet should show "unlimited" in words, and a platform's self-custody wallet should offer revocation ([Approval Phishing, Drainers and Address Poisoning](/books/investing-and-digital-assets/wallets#approval-phishing-drainers-and-address-poisoning)).
- **Approvals outlive the session.** An allowance stays until it is spent or reset. There is no expiry in ERC-20.

### Permits

EIP-2612 adds `permit(owner, spender, value, deadline, v, r, s)`, which sets an allowance from an off-chain signature over the typed struct `Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)`, so the owner pays no gas and needs no ETH. The EIP notes that a permit can be front-run (harmlessly, since the result is the same) and that the owner can limit exposure by setting a near `deadline`. Uniswap's Permit2 generalizes the idea: each token gets one standard approval to the Permit2 contract, after which spenders are authorized by signatures, either a standing allowance that carries "their own `expiration`" or a one-time transfer that "leaves no standing allowance." Permits move the dangerous moment from an on-chain transaction, which a wallet shows with a destination and a fee, to a signature over structured data, which many users approve without reading. Smart contract wallets such as Safe can't produce these signatures at all, per OpenZeppelin, so contracts that accept permits also need a plain `approve` path.

## Nonstandard Tokens

### Tokens that return nothing

USDT on Ethereum predates the finalized return-value rule. Its verified ABI on Etherscan declares `transfer` and `approve` with `"outputs":[]`: they return no value. Code that calls `IERC20(usdt).transfer(...)` and checks the returned `bool` reverts under modern compilers, because there is nothing to decode. OpenZeppelin's `SafeERC20` exists for this: "non-reverting calls are assumed to be successful" when the token returns no value, and a token that returns `false` fails the call. A platform's contracts (batch payout contracts, sweepers, forwarders) call tokens through such a wrapper, and its off-chain code confirms success by the receipt's status and the logs, never by a return value.

### Fee-on-transfer tokens

Some tokens deliver less than the amount sent. Token-2022's transfer fee extension makes it explicit: "On every transfer, some amount is withheld on the recipient account, untouchable by the recipient," collectible later by a withdraw-withheld authority, and transfers must use `transfer_checked_with_fee` or similar. USDT's contract carries a basis-points fee parameter in its ABI. On EVM chains, a fee-on-transfer token emits a `Transfer` event for the gross or the net amount at the contract's discretion. The integration rule: credit what arrived, measured as the change in the receiving address's balance, not the amount the sender intended, and decide at listing whether to support such tokens at all.

### Rebasing tokens

stETH's balances change without anyone sending anything. Per Lido's integration guide, balances update when the oracle reports, "The rebase can be positive or negative, depending on the validators' performance," and the balance is derived from a share count whose value changes with each report. Transfers can arrive 1 to 2 wei short because of integer division, and "Most cross-chain token bridges have no mechanics to handle rebases." For an exchange:

- **Customer balances can't be a copy of the chain's numbers.** Either the platform passes rebases through (posting a daily rebase journal to every holder, positive or negative), or it supports only the non-rebasing wrapper (wstETH), whose balance is fixed and whose price rises.
- **Event-driven crediting misses rebases,** because a rebase emits no per-holder `Transfer`. Reconciliation by balance catches it.
- **Dust breaks exact matching.** A withdrawal of exactly the ledger balance may fail by 1 wei; withdrawal code for share-based tokens transfers shares, as Lido suggests, or leaves a tolerance.

## NFTs: ERC-721 and ERC-1155

ERC-721 (created January 24, 2018) identifies each token by a `uint256` ID inside its contract, so the pair `(contract address, uint256 tokenId)` is "a globally unique and fully-qualified identifier" for the asset. `safeTransferFrom` checks whether the recipient is a contract and calls `onERC721Received`, reverting if the expected value doesn't come back. Approval is per token (`approve`) or per operator for everything the owner holds (`setApprovalForAll`: "The operator can manage all NFTs of the owner"). Metadata is optional: `tokenURI` returns a URI, usually to JSON off chain, which the contract doesn't guarantee stays the same.

ERC-1155 (created June 17, 2018) puts any mix of fungible and non-fungible token types in one contract, transfers them singly or in batches (`TransferSingle`, `TransferBatch`), and has only operator-wide approval: "`setApprovalForAll` allows an operator to manage one's entire set of tokens on behalf of the approver."

For a platform, an NFT is an instrument whose identity includes the token ID, whose price is an estimate (there is no order book for a unique item), and whose metadata can change if it lives at a mutable URL. The operator approval is the drainer's favorite request: one signature hands over every NFT in a collection.

## SPL Tokens and Token Extensions

Solana keeps a token's definition in a **mint account** (supply, decimals, mint and freeze authorities) and each holder's balance in a separate **token account** owned by the token program. The associated token account program makes the holder's account predictable: its address is derived from "a user's main System account address and a token mint address," and a sender can create the recipient's account so a transfer doesn't fail for lack of one. A deposit to a Solana wallet is therefore a deposit to the associated token account for that mint, and a platform must watch token accounts, not only wallet addresses; a sender paying a wallet that has no account for the mint creates one at its own cost.

The Token Extensions program (Token-2022) adds behaviors chosen at mint creation. The ones that change custody and crediting:

- **Transfer fees,** withheld in the recipient's account as above.
- **Default account state:** "force all new token accounts to be frozen," so a new holder can't move tokens until the issuer unfreezes the account, which is how permissioned tokens gate holders ([Transfer Agents & Permissioned Tokens](/books/investing-and-digital-assets/transfer-agents-and-permissioned-tokens)).
- **Permanent delegate:** "unlimited delegate privileges over any account for that mint"; the delegate can transfer or burn any holder's tokens. The documentation names stablecoin issuers seizing assets from sanctioned entities as a use case, and notes that confidential balances can escape it.
- **Transfer hook:** a program the token calls on every transfer, which can enforce arbitrary rules or fail a transfer for reasons the sender can't see in advance.
- **Required memo, non-transferable, pausable, permissioned burn, interest-bearing and scaled UI amounts:** the last two change the displayed amount without minting, which is the rebasing problem in another form.

## Upgradeable Proxies and Admin Keys

Most large tokens are proxies: a small contract that holds the storage and forwards every call by `delegatecall` to an implementation contract, which can be swapped. EIP-1967 standardized where the proxy keeps the implementation address, at storage slot `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc` (keccak-256 of `eip1967.proxy.implementation`, minus one), and the admin at `0xb531...6103`, so block explorers can tell a contract is a proxy and show the implementation's interface. A change emits `Upgraded(address indexed implementation)` or `AdminChanged(previousAdmin, newAdmin)`.

An upgrade can change anything: add a fee, add a blacklist, change decimals in effect, or, if the admin key is stolen, mint unlimited supply. For a platform:

- **Know who holds the admin key** (a multisig, a timelock, an issuer's custody) for every token it lists, and record it.
- **Watch the slots and events.** An unannounced `Upgraded` on a listed token is an incident: pause deposits of that token until someone has read the new implementation.
- **Disclose it.** Customers holding a token through the platform carry the issuer's admin risk; the risk disclosure says so; upgradeability as an exploit class is [Smart Contract Risk & Exploits](/books/investing-and-digital-assets/smart-contract-risk#upgradeability-and-admin-keys).

## Freeze and Blacklist Functions

Issuers of fiat-backed tokens build in the power to stop tokens moving. Circle's FiatToken: a blacklisted address "will be unable to call `transfer` or `transferFrom`," can't receive and can't mint or burn; since version 2.2 it can still call approval functions but can't move assets. Pausing stops transfers, minting and burning for everyone while "Modifying the blacklist, removing minters, changing roles, and upgrading" still work. USDT adds `destroyBlackFunds`, which burns a blacklisted address's balance. On Solana the freeze authority freezes a token account, and a permanent delegate can move tokens out.

What this means for a custodian:

- **An omnibus address is one blacklist away from freezing every customer in it.** Segregating hot wallets by risk, and never sending customer funds through addresses that touch flagged counterparties, is a custody design choice, not only a compliance one ([Screening Wallets and Addresses](/books/payments/stablecoins#screening-wallets-and-addresses)).
- **A frozen balance is still a liability.** The ledger keeps the customer's claim and moves it to a restricted state; the reconciliation shows the chain balance as present but unusable.
- **Pause is a chain-wide event for one asset.** Withdrawals of that token stop, deposits may still arrive and not be movable, and the platform's status page says so.

The legal and operational side (OFAC-driven freezes, law enforcement requests, the GENIUS Act's technical capability requirements) is [Freezes, Blacklists & Seizures](/books/investing-and-digital-assets/freezes-and-onchain-compliance).

## Token Metadata and Spoofed Tokens

`name` and `symbol` are strings any contract can return. Anyone can deploy a token called "USDC" with symbol `USDC` and 6 decimals, and send it to every address that has ever held the real one. Three rules:

- **A token is its contract address on its chain,** and the platform credits only `Transfer` events emitted by contracts in its `asset_networks` table. A deposit of an unknown token is recorded, not credited, and goes to a review queue under a written policy ([Wrong Addresses and Wrong Chains](/books/payments/stablecoins#wrong-addresses-and-wrong-chains)).
- **Events can lie about the sender.** A malicious contract can emit `Transfer(from = your hot wallet, to = attacker, ...)` without moving anything, and a real token's zero-value `transferFrom` emits a genuine `Transfer` "from" any address. Both put lookalike addresses into a wallet's history, which is the setup for address poisoning (Tsuchiya et al. measured 270 million attack attempts against 17 million victims on Ethereum and BNB Smart Chain over two years) ([Wallets](/books/investing-and-digital-assets/wallets#approval-phishing-drainers-and-address-poisoning)).
- **Show the contract, not just the symbol,** in any screen where a customer chooses what to send or receive, and never auto-list a token because it appeared in a customer's wallet.

## How to Build It

The core `asset_networks` row already holds the contract address, token standard, on-chain decimals and the deposit and withdrawal switches ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)). This chapter adds the contract behind a token network (proxy, implementation, admin), the behaviors that decide how deposits, withdrawals and postings treat it, and a record of every change in its control surface.

```sql
ALTER TABLE asset_networks
  ADD CONSTRAINT token_standard_known CHECK (token_standard IN ('native', 'erc20', 'erc721',
    'erc1155', 'spl', 'spl_token_2022', 'other')),
  ADD COLUMN decimals_verified_against TEXT;   -- issuer document checked at listing

CREATE TABLE token_contracts (             -- the program behind a token network
  asset_network_id UUID PRIMARY KEY REFERENCES asset_networks (id),
  is_proxy         BOOLEAN NOT NULL,
  implementation_address TEXT,             -- EIP-1967 implementation slot, as last read
  admin_address    TEXT,                   -- EIP-1967 admin slot or the program's upgrade authority
  admin_kind       TEXT CHECK (admin_kind IN ('eoa', 'multisig', 'timelock', 'program',
                     'none', 'unknown')),
  controls         TEXT[] NOT NULL DEFAULT '{}',  -- 'blacklist', 'pause', 'mint', 'burn_others',
                                           -- 'freeze_account', 'permanent_delegate',
                                           -- 'transfer_hook', 'default_frozen', 'fee_authority'
  last_read_block  BIGINT NOT NULL,
  CHECK (NOT is_proxy OR implementation_address IS NOT NULL)
);

CREATE TABLE token_behaviors (             -- how the platform must integrate with it
  asset_network_id   UUID PRIMARY KEY REFERENCES asset_networks (id),
  returns_bool       BOOLEAN,              -- false for USDT-style tokens
  approve_needs_zero BOOLEAN NOT NULL DEFAULT false,
  fee_on_transfer    BOOLEAN NOT NULL DEFAULT false,
  balance_model      TEXT NOT NULL DEFAULT 'static' CHECK (balance_model IN
                       ('static', 'rebasing', 'scaled_ui')),
  credit_by          TEXT NOT NULL DEFAULT 'event' CHECK (credit_by IN ('event', 'balance_delta')),
  approved_by        UUID NOT NULL,
  approved_at        TIMESTAMPTZ NOT NULL,
  CHECK (NOT (fee_on_transfer OR balance_model <> 'static') OR credit_by = 'balance_delta')
);

CREATE TABLE token_admin_changes (         -- changes to a listed token's powers or holders
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  asset_network_id UUID NOT NULL REFERENCES asset_networks (id),
  onchain_transaction_id UUID NOT NULL REFERENCES onchain_transactions (id),
  kind             TEXT NOT NULL CHECK (kind IN ('upgraded', 'admin_changed', 'paused',
                     'unpaused', 'blacklisted', 'unblacklisted', 'role_changed', 'funds_destroyed')),
  subject_address  TEXT,                   -- the address blacklisted, the new implementation
  affects_platform BOOLEAN NOT NULL,       -- a platform address, or a listed behavior change
  case_id          UUID REFERENCES cases (id),
  detected_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Notes on the sketch:

- **The credit rule is enforced.** A token flagged fee-on-transfer or rebasing must credit by balance delta; the constraint makes it impossible to approve one that credits by event.
- **NFT identity.** An ERC-721 or ERC-1155 holding is an `asset_networks` row for the collection plus a token ID carried on the position and on each journal line's metadata; quantity is 1 for ERC-721 and any integer for ERC-1155.
- **Controls are read, not assumed.** A job reads the EIP-1967 slots and role holders of every listed token daily and updates `token_contracts`; a difference writes a `token_admin_changes` row.
- **An upgrade pauses the asset.** `upgraded` on a listed token sets `deposits_enabled` and `withdrawals_enabled` false on that `asset_networks` row until a person reviews the new implementation, and emits `asset_network.paused` through the [outbox](/docs/architecture/events#the-transactional-outbox).
- **A blacklist hit on a platform address is a case.** `blacklisted` with a platform address as subject opens a `cases` row and moves affected customer balances to a restricted ledger account.
- **Unlisted tokens never credit.** Transfers from contracts that have no `asset_networks` row are recorded and reviewed as misdirected deposits ([Deposits & Withdrawals](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals)), never shown as balances.
- **Payments' `assets`** table is this volume's `instruments` plus `asset_networks`: its `code` ('USDC.ethereum') is one `asset_networks` row, and its `decimals` is `decimals_on_chain`.

## Auditing

- **The listing record per asset network:** contract address, decimals and the issuer document they were checked against, behavior flags and who approved them.
- **Every change in a token's controls,** with the on-chain transaction and what the platform did (paused, reviewed, resumed).
- **Blacklist and freeze events touching platform addresses,** and the ledger postings that restricted the affected balances.
- **Rebase postings** per day per holder for any rebasing token passed through, reconciled to the chain balance.
- **Dispositions of unlisted tokens received,** so a customer who sent the wrong token can be answered.

## What This Means for the System You Build

- **Identify every token by chain and contract address,** never by symbol.
- **Store decimals per asset network** at listing, verified against the issuer, and refuse to credit without them.
- **Call tokens through a safe wrapper** and confirm success by receipt and logs, not return values.
- **Credit fee-on-transfer and rebasing tokens by balance delta,** or support only their non-rebasing wrappers.
- **Reset to zero before changing an allowance** on tokens that require it, and treat unlimited approvals as a risk to show the customer.
- **Record and watch each token's admin, blacklist and pause powers;** pause the asset on an unexpected upgrade.
- **Segregate wallets so one blacklist can't freeze everyone,** and keep frozen balances as restricted liabilities.

## References

**Standards and protocols**

- [ERC-20: Token Standard](https://eips.ethereum.org/EIPS/eip-20), the interface, handling `false`, zero-value transfers, optional decimals and the approve-to-zero mitigation
- [ERC-721: Non-Fungible Token Standard](https://eips.ethereum.org/EIPS/eip-721), token IDs, `safeTransferFrom` and `onERC721Received`, operators and `tokenURI`
- [ERC-1155: Multi Token Standard](https://eips.ethereum.org/EIPS/eip-1155), mixed token types, batch transfers and operator-only approval
- [EIP-2612: Permit extension for EIP-20 signed approvals](https://eips.ethereum.org/EIPS/eip-2612), the `permit` function, the typed struct, front-running and deadlines
- [EIP-1967: Proxy storage slots](https://eips.ethereum.org/EIPS/eip-1967), implementation, admin and beacon slots and the `Upgraded` and `AdminChanged` events
- [Solidity: Contract ABI specification](https://docs.soliditylang.org/en/latest/abi-spec.html), function selectors, argument encoding and event topics
- [Solana Program Library: Token-2022 extensions](https://www.solana-program.com/docs/token-2022/extensions), transfer fees, default account state, permanent delegate, transfer hooks and the rest
- [Solana Program Library: Associated token account](https://www.solana-program.com/docs/associated-token-account), deriving a holder's token account from wallet and mint

**Vendor documentation**

- [Circle: FiatToken design](https://raw.githubusercontent.com/circlefin/stablecoin-evm/master/doc/tokendesign.md), roles, blacklisting, pausing, minter allowances and proxy upgrades
- [Etherscan: Tether USD (USDT) contract](https://etherscan.io/address/0xdac17f958d2ee523a2206206994597c13d831ec7#code), the ABI without return values, blacklist, `destroyBlackFunds`, fee parameters, deprecation and the compiler version
- [Etherscan: Tether USD token page](https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7), 6 decimals
- [Circle: Transfer USDC on Solana](https://developers.circle.com/stablecoins/quickstart-transfer-10-usdc-on-solana), USDC's six decimal places
- [Lido: Tokens integration guide](https://docs.lido.fi/guides/lido-tokens-integration-guide), stETH rebases and shares, the 1 to 2 wei corner case and wstETH for DeFi and bridges
- [OpenZeppelin Contracts 5.x: ERC-20](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20), the 18-decimal default, `SafeERC20`, `forceApprove` and permit limitations for contract wallets
- [Uniswap: Permit2 overview](https://developers.uniswap.org/docs/protocols/permit2/overview), one approval per token, signature-based allowances with expirations and one-time transfers

**In practice**

- [Tsuchiya et al.: Blockchain Address Poisoning (USENIX Security 2025)](https://www.usenix.org/conference/usenixsecurity25/presentation/tsuchiya), 270 million attempts, 17 million victims and at least $83.8 million lost
