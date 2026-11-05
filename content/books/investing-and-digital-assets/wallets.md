+++
title = "Wallets"
description = "Custodial and self-custody wallets, smart accounts under ERC-4337 and EIP-7702, passkey and embedded wallets, WalletConnect, drainers and address poisoning."
category = "Investing & Digital Assets Industry"
order = 2539
part = "Chains and Wallets"
tags = ["wallets", "self-custody", "account-abstraction", "passkeys", "security", "erc-4337"]
+++

A wallet is software that holds keys and asks its user to approve signatures; the assets stay on the chain. The word covers two arrangements that the law treats as different businesses. In a custodial (hosted) wallet the platform holds the keys and the customer holds a claim on the platform's ledger, the way a brokerage customer holds a claim on a broker. In a self-custody (unhosted) wallet the customer holds the keys and the platform, if there is one, writes the software. FinCEN's 2019 guidance draws the line on four questions: who owns the value, where it is stored, whether the owner interacts directly with the chain, and "whether the person acting as intermediary has total independent control over the value." Get the answers wrong in the product's design and a wallet sold as self-custody is a money transmission business.

Wallets have also changed shape since 2023. An Ethereum account used to be either a key (an externally owned account, EOA) or a contract; ERC-4337 made contract accounts usable as everyday wallets, Pectra's EIP-7702 in May 2025 let an EOA run contract code, and Fusaka's P-256 precompile in December 2025 let the passkey on a phone sign for an account directly. Each change made wallets more usable and gave attackers a new thing to ask users to sign. This chapter covers custodial and self-custody models, browser and mobile wallets, smart accounts (ERC-4337 and EIP-7702), passkey and embedded wallets, wallet connection over WalletConnect, drainers, approval phishing and address poisoning, and what a regulated platform's self-custody wallet must and must not do. It adds self-custody wallets, wallet connections, token approvals and signature prompts alongside `wallets`, `addresses` and `parties` from [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business. The keys behind custodial wallets are [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing); the scams that lead users to sign are the User-Generated Platforms volume's [Crypto Investment Scams](/books/user-generated-platforms/crypto-investment-scams); offering DeFi through a wallet is [DeFi from a Regulated Platform](/books/investing-and-digital-assets/defi-from-a-regulated-platform).

## How the Wallets Do It

What wallet vendors publish about their models, as of November 2026:

| Wallet or kit | Account type | Where the key lives | Notes from the vendor's documentation |
| --- | --- | --- | --- |
| **MetaMask** (Smart Accounts Kit) | EOA, with smart accounts under ERC-4337 and an EIP-7702 "Stateless 7702" mode | On the user's device | Smart accounts can grant scoped "delegations" to other accounts "under defined rules and restrictions" |
| **Safe** | Contract account (multisig) | With each owner: EOAs, other contracts or passkeys | Threshold of owners; guards and modules |
| **Privy** (Stripe) | Embedded wallet | Shamir 2-of-2: an enclave share and an auth share released on login | Key reconstructed in a Nitro enclave per operation; wallet policies checked before signing |
| **Turnkey** | Embedded or API wallet | Generated and used inside attested enclaves | Deny-wins policies over decoded transactions |
| **Coinbase** wallet SDK | Smart and EOA wallets | Varies by product | Base's documentation now points to Coinbase Developer Platform and calls the SDK the Coinbase Wallet SDK |

The pattern across them: the key moves off the user's head (a seed phrase) and onto a device, an enclave or a set of shares, and a policy layer appears between the app's request and the signature.

## Custodial and Self-Custody

FinCEN's guidance describes hosted wallet providers as "account-based money transmitters that receive, store, and transmit CVCs on behalf of their accountholders," where the host "has total independent control over the value (although it is contractually obligated to access the value only on instructions from the owner)." For an unhosted, single-signature wallet, "the owner interacts with the payment system directly and has total independent control over the value." A multisig provider that only adds a second authorization to the owner's key "is not a money transmitter because it does not accept and transmit value," but one that also hosts, keeps the value "as an entry in the accounts of the provider," or "maintains total independent control of the value" is one "regardless of the label the person applies to itself."

The bank regulators state the mirror image for custody: taking possession of a customer's existing keys may not give a custodian control, "since, for example, a customer may have retained copies of the keys." Together they give a platform two clean designs and a lot of muddy ones:

- **Custodial:** the platform alone can sign; the customer has a ledger balance, KYC, statements and the platform's protections and risks (Hot, Warm & Cold Wallets; Customer Protection, Net Capital & SIPC).
- **Self-custody:** the customer alone can sign; the platform's software never holds a key or a share sufficient to move funds without the customer, and its records are of software use, not balances.
- **Muddy:** "self-custody" where the platform holds a recovery share that can move funds alone, a custodial wallet whose customers also keep the seed, or an embedded wallet whose key the provider can reconstruct without the user. Each needs a legal analysis before launch, not after.

## Browser and Mobile Wallets

A browser extension or mobile wallet holds an EOA's key, usually derived from a BIP-39 seed the user is told to write down ([HD Wallets](/books/investing-and-digital-assets/keys-and-signing#hd-wallets)). Apps talk to it through a small set of JSON-RPC methods: `eth_sendTransaction` (build, sign and send), `personal_sign` (sign a message with a prefix that "prevents misuse where a malicious DApp can sign arbitrary data"), `eth_signTypedData` (sign EIP-712 structured data) and `eth_signTransaction`. The last two are where most losses start, because a typed-data signature can be a permit or an order that moves assets later, with no transaction for the wallet to show at the moment of signing.

## Smart Accounts

### ERC-4337

ERC-4337 (Final) gives contract accounts a path to act like wallets without changing the protocol. The user signs a `UserOperation` (sender, nonce, factory and init code, call data, gas limits, fee fields, paymaster fields, signature). Bundlers collect operations from a separate mempool and submit them to a shared `EntryPoint` contract's `handleOps`, which runs "the **verification loop** and the **execution loop**": each account's `validateUserOp` checks the signature by whatever rule the account defines and pays the EntryPoint, then the calls execute. A paymaster can sponsor gas or take it in a token (`validatePaymasterUserOp`, then `postOp` to settle). Accounts deploy on first use through a factory using CREATE2, so the address is known before the account exists. The nonce is split into a 192-bit key and a 64-bit sequence, so an account can run parallel queues of operations. Paymasters and factories stake to avoid being throttled by bundlers; "this stake is never slashed."

For a platform this means:

- **A deposit can come from an address with no code yet** (a counterfactual account), and a withdrawal to one works like any other.
- **The `from` of a transaction is the bundler,** not the user; the user's account appears as the target of the EntryPoint's call. Attribution of who sent a deposit needs the decoded operation.
- **Gas can be paid by someone else,** so "the user had no ETH" no longer means "the user can't move tokens."

### EIP-7702

EIP-7702 (Final, live since Pectra on May 7, 2025) adds a transaction type `0x04` carrying an `authorization_list` of tuples `[chain_id, address, nonce, y_parity, r, s]`. For each valid tuple the EOA's code is set to `0xef0100 || address`, a pointer that makes calls to the EOA run the delegate contract's code with the EOA's balance and storage. An authorization to the zero address clears it. The EOA keeps its key, which can still sign ordinary transactions and can always re-delegate.

The EIP's own security section is a list of things a wallet has to get right:

- **"When universal deployment is preferred, simply set chain ID to 0."** A tuple with chain ID 0 is valid on every chain. Signing one hands the account's code, on every EVM chain where the nonce matches, to the delegate.
- **Wallets should not offer a generic interface** for signing authorizations, because the delegate "has unrestricted access to the account." Only the wallet's own vetted delegate should ever be authorized.
- **`msg.sender == tx.origin` no longer means a plain account,** which breaks reentrancy and flash-loan guards that relied on it.
- **Re-delegating can corrupt storage** if two delegates share slots; namespaced storage (ERC-7201) is the recommendation.
- **Initialization can be front-run,** since no init code runs at delegation; wallets should require setup calldata signed by the EOA.

Worked: a phishing page asks a user to "upgrade your wallet" and requests a type-4 transaction whose single tuple is `[0, 0xBAD...BAD, 12, ...]`. The account's next nonce is 12 on Ethereum, Base and Arbitrum. Once signed, the attacker's contract is the account's code on all three chains, and a single call can sweep every token on each. A wallet that refuses any 7702 authorization not to its own delegate, and any with chain ID 0, prevents the whole class.

## Passkey and Embedded Wallets

A passkey is a P-256 key held in a phone's secure hardware or a FIDO authenticator. Until 2025 Ethereum could verify only secp256k1 signatures natively, so passkey wallets verified P-256 in contract code at high gas cost. EIP-7951 (Final) added a `P256VERIFY` precompile at address `0x100` costing 6,900 gas, shipped in Fusaka, for signatures from "Apple Secure Enclave, Android Keystore, and FIDO2/WebAuthn authenticators." A smart account whose owner is a passkey can now be verified cheaply on L1. Safe lists passkeys among its owner types.

Embedded wallets go further: the app creates a wallet at sign-up, with no seed phrase shown. Privy splits the key into an enclave share and an auth share released "only with valid credentials," reconstructed inside a Nitro enclave in memory, used and discarded; Turnkey generates keys in enclaves and signs under policies. The trade:

- **Recovery is account recovery.** Losing a seed phrase is replaced by the provider's login and recovery flow, so the wallet is only as safe as that flow (email, SMS and support resets are the attack surface; Account Security & Fraud).
- **The provider's role decides the legal model.** If the provider or the app can reconstruct and sign without the user's credential, the user doesn't have total independent control.
- **Policies can protect users,** since the enclave can refuse to sign a transfer above a limit or to a flagged address, which a seed-phrase wallet can't.

## Wallet Connection

WalletConnect's Sign API "establishes a session between a dapp and a wallet" over "a secure remote JSON-RPC transport." The app shows a pairing URI (as a QR code or deep link); the wallet scans it; the app publishes a session proposal naming the chains and methods it wants; the wallet asks the user to approve; from then on the app sends requests (`eth_sendTransaction`, `eth_signTypedData`) and the wallet answers. Messages travel through relay servers by publish and subscribe on topics, and the protocol's envelopes are sealed with ChaCha20-Poly1305 using keys the peers agree on. Two consequences for a platform that builds a wallet:

- **The app is a stranger.** A session proposal says which app it claims to be; the wallet should show the verified domain, warn on lookalikes, and scope sessions to the chains and methods needed.
- **Requests arrive asynchronously,** possibly long after pairing, so every signature request is shown fresh, decoded and simulated, never auto-approved because the session is trusted.

## Approval Phishing, Drainers and Address Poisoning

Most losses from self-custody wallets come from the user signing something, not from a broken key. The requests to fear:

| Request | What it does | What the wallet should show |
| --- | --- | --- |
| `approve(spender, 2^256 − 1)` | Lets the spender take the whole token balance, now and later ([Approvals, worked](/books/investing-and-digital-assets/tokens-and-standards#approvals-worked)) | "Unlimited," the spender's identity and age, and a cap option |
| `setApprovalForAll(operator, true)` | Hands every NFT in a collection to the operator | The collection's value and a warning that this is everything |
| EIP-2612 `permit` or Permit2 signature | An off-chain signature that sets an allowance; no transaction to inspect | The decoded spender, amount and deadline, as clearly as a transfer |
| EIP-7702 authorization | Replaces the account's code | Refuse unless it is the wallet's own delegate on this chain |
| `delegatecall` from a Safe | Runs foreign code with the Safe's authority ([Bybit](/books/investing-and-digital-assets/keys-and-signing#bybit-february-21-2025)) | The operation type and target, and a block by default |

A drainer kit chains these: a cloned site, a connection request, a simulation that looks harmless, then the signature that matters. The defense is transaction simulation (what balances change if this is signed), decoding of typed data, and a risk check of the spender or operator against known drainer contracts, all shown before the signature, not after.

Address poisoning needs no signature at all. Tsuchiya, Dong, Soska and Christin measured 270 million attack attempts against 17 million victims on Ethereum and BNB Smart Chain over two years, at least $83.8 million lost in 6,633 incidents, about 13 times more than previously reported. The attacker generates an address that matches the first and last characters of one the victim has used, then puts it into the victim's history with a zero-value or dust transfer (or a fake token's `Transfer` event); the victim later copies the wrong address from history. Wallet defenses: show full addresses or a verified name, hide zero-value and unknown-token transfers from history, warn when a destination shares a prefix and suffix with a known counterparty but differs inside, and offer an address book with verified entries.

## A Regulated Platform's Self-Custody Wallet

A broker or exchange that ships a self-custody wallet (as several large platforms do) is building software that its regulators, its customers and plaintiffs will read as an extension of its regulated business. My checklist:

**Must:**

- **Generate keys on the user's device or in enclaves the platform can't access without the user,** and never transmit a seed phrase or a sufficient share to the platform.
- **Keep the wallet's records separate from the custodial ledger.** Self-custody balances are read from the chain for display; they are never customer liabilities in `journal_lines`.
- **Decode and simulate every request** and show the result in words, including permits, approvals and 7702 authorizations.
- **Screen destinations and counterparties** for sanctions exposure where the platform facilitates a transfer, and state in the terms what it does and doesn't screen ([Screening Wallets and Addresses](/books/payments/stablecoins#screening-wallets-and-addresses); [Sanctions Screening](/books/banking-and-lending/sanctions-screening)).
- **Disclose plainly** that the platform can't recover lost keys or reverse transfers, that SIPC and the platform's custody protections don't apply, and who bears losses from a signed malicious request.
- **Make moving between custodial and self-custody an ordinary transfer,** an `onchain` transfer with Travel Rule handling, not an internal journal.

**Must not:**

- **Hold a key, share or recovery path that can move funds without the user,** or the wallet is hosted, whatever the marketing says.
- **Offer a generic "sign this authorization" or "sign this message" path** without decoding, or sign EIP-7702 authorizations to anything but the wallet's own audited delegate.
- **Auto-approve within a WalletConnect session** or batch user actions into a signature the user can't read.
- **Let the custodial app's support staff see or reset self-custody credentials,** since that is the social-engineering path around every other control.

## How to Build It

The core `wallets` and `addresses` tables are the platform's custody ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)). Customer self-custody wallets are a different record: addresses the customer controls, linked to the party for screening, transfers and Travel Rule purposes, with the wallet's connections to apps, the approvals observed on chain, and every signature prompt the platform's wallet showed.

```sql
CREATE TABLE self_custody_wallets (        -- wallets the customer controls, never platform custody
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id         UUID NOT NULL REFERENCES parties (id),
  chain_id         UUID NOT NULL REFERENCES chains (id),
  address          TEXT NOT NULL,
  account_kind     TEXT NOT NULL CHECK (account_kind IN ('eoa', 'smart_account_4337',
                     'eoa_7702_delegated', 'multisig', 'embedded')),
  delegate_address TEXT,                   -- EIP-7702 code pointer, as last read
  source           TEXT NOT NULL CHECK (source IN ('platform_wallet_app', 'external_verified',
                     'external_declared')),
  key_location     TEXT CHECK (key_location IN ('device', 'enclave_shares', 'hardware_wallet',
                     'unknown')),
  platform_can_sign_alone BOOLEAN NOT NULL DEFAULT false,
  ownership_proof  TEXT,                   -- signed message for an external wallet, per Travel Rule policy
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (chain_id, address),
  CHECK (NOT platform_can_sign_alone)      -- if it were true, it belongs in wallets, as custody
);

CREATE TABLE wallet_connections (          -- WalletConnect and injected-provider sessions
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  self_custody_wallet_id UUID NOT NULL REFERENCES self_custody_wallets (id),
  origin           TEXT NOT NULL,          -- the app's verified domain
  origin_verified  BOOLEAN NOT NULL,
  chains           TEXT[] NOT NULL,        -- CAIP-2 identifiers approved for the session
  methods          TEXT[] NOT NULL,        -- 'eth_sendTransaction', 'eth_signTypedData_v4', ...
  approved_at      TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ,
  ended_by         TEXT CHECK (ended_by IN ('user', 'app', 'expiry', 'risk_block'))
);

CREATE TABLE signature_prompts (           -- what the platform's wallet showed, and what the user did
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  self_custody_wallet_id UUID NOT NULL REFERENCES self_custody_wallets (id),
  connection_id    UUID REFERENCES wallet_connections (id),  -- null for in-app actions
  method           TEXT NOT NULL,          -- 'eth_sendTransaction', 'eth_signTypedData', '7702_auth'
  payload_sha256   BYTEA NOT NULL,
  decoded          JSONB NOT NULL,         -- spender, amount, operation, deadline, chain id
  simulation       JSONB,                  -- balance changes shown
  risk_flags       TEXT[] NOT NULL DEFAULT '{}',  -- 'unlimited_approval', 'operator_all', 'permit',
                                           -- '7702_foreign_delegate', 'chain_id_zero', 'poisoned_lookalike'
  blocked          BOOLEAN NOT NULL,       -- the wallet refused to offer signing
  user_decision    TEXT CHECK (user_decision IN ('signed', 'rejected', 'abandoned')),
  disclosure_id    UUID REFERENCES disclosures (id),  -- the warning version shown
  shown_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE token_approvals (             -- allowances observed on chain for these wallets
  self_custody_wallet_id UUID NOT NULL REFERENCES self_custody_wallets (id),
  asset_network_id UUID NOT NULL REFERENCES asset_networks (id),
  spender          TEXT NOT NULL,
  amount_base      NUMERIC(78,0) NOT NULL, -- 2^256 - 1 for unlimited
  kind             TEXT NOT NULL CHECK (kind IN ('erc20', 'operator_all', 'permit2')),
  expires_at       TIMESTAMPTZ,            -- Permit2 allowances carry one
  as_of_block      BIGINT NOT NULL,
  PRIMARY KEY (self_custody_wallet_id, asset_network_id, spender, kind)
);
```

Notes on the sketch:

- **The legal line is a constraint.** A wallet where the platform can sign alone can't be stored as self-custody; it has to be a custody `wallets` row with ledger liabilities.
- **Prompts are evidence.** When a customer reports a drain, `signature_prompts` shows what the wallet decoded, which flags it raised, which disclosure version it showed and what the user chose. Store the decoded request, not the private data around it.
- **Sessions are scoped and visible.** A connection records the chains and methods the user approved; a request outside them is refused, and the user can see and end every live session.
- **Approvals are a product feature.** A daily read of allowances for each wallet lets the app show and revoke them; unlimited and operator-wide approvals to unknown spenders are highlighted.
- **Poisoning checks run against known counterparties.** A destination that matches a past or allowlisted address's first and last characters but not its middle raises `poisoned_lookalike` before the user can sign; withdrawal allowlists for custodial accounts are Deposits & Withdrawals.
- **7702 delegates are watched.** A delegated wallet whose `delegate_address` changes to anything but the platform's delegate emits `self_custody_wallet.delegate_changed` through the [outbox](/docs/architecture/events#the-transactional-outbox) and a warning in the app.

## Auditing

- **Every signature prompt** in the platform's wallet: decoded request, simulation, flags, disclosure version, decision.
- **The custody classification** of every wallet product and its legal review, with the four FinCEN questions answered.
- **Delegate contract versions** the wallet authorizes under EIP-7702, with audits.
- **Every poisoning warning shown** and what the user did next.
- **Support actions on wallet accounts,** which should never include credential resets for self-custody keys.

## What This Means for the System You Build

- **Decide custodial or self-custody on the four FinCEN questions,** and design so the answer can't drift.
- **Never hold a key or share that can move a self-custody wallet's funds alone.**
- **Decode and simulate everything,** including permits, typed data and 7702 authorizations, and show it in words.
- **Refuse EIP-7702 authorizations** to anything but the wallet's own delegate, and any with chain ID 0.
- **Defend against address poisoning** with full addresses, verified address books and hidden dust.
- **Keep self-custody balances out of the custodial ledger,** and treat moves between them as on-chain transfers.
- **Record what the wallet showed,** because that record is the platform's answer when a customer is drained.

## References

**Regulators and guidance**

- [FinCEN: Application of FinCEN's regulations to certain business models involving convertible virtual currencies (FIN-2019-G001, May 9, 2019)](https://www.fincen.gov/sites/default/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf), the four criteria, hosted wallet providers as money transmitters, unhosted wallets and multisig providers (section 4.2)
- [OCC, Federal Reserve and FDIC: Crypto-Asset Safekeeping by Banking Organizations (July 14, 2025)](https://www.federalreserve.gov/newsevents/pressreleases/files/bcreg20250714a1.pdf), possession of existing keys may not be control

**Standards and protocols**

- [ERC-4337: Account abstraction using alt mempool](https://eips.ethereum.org/EIPS/eip-4337), UserOperations, EntryPoint, bundlers, paymasters, factories, the 2D nonce and stake
- [EIP-7702: Set code for EOAs](https://eips.ethereum.org/EIPS/eip-7702), the type 0x04 transaction, authorization tuples, the delegation designator, chain ID 0 and the security considerations
- [EIP-7951: Precompile for secp256r1 curve support](https://eips.ethereum.org/EIPS/eip-7951), `P256VERIFY` at 0x100, 6,900 gas and secure-hardware signers
- [Ethereum: Pectra](https://ethereum.org/en/roadmap/pectra/), EIP-7702 live on May 7, 2025
- [Ethereum: Fusaka](https://ethereum.org/en/roadmap/fusaka/), the P-256 precompile in the December 3, 2025 upgrade
- [WalletConnect: Sign API specification](https://specs.walletconnect.com/2.0/specs/clients/sign), sessions between a dapp and a wallet, pairing URIs and proposals
- [WalletConnect: Crypto envelopes](https://specs.walletconnect.com/2.0/specs/clients/core/crypto/crypto-envelopes), ChaCha20-Poly1305 envelopes and key agreement
- [WalletConnect: Relay server RPC](https://specs.walletconnect.com/2.0/specs/servers/relay/relay-server-rpc), topics, publish and subscribe

**Vendor documentation**

- [Reown: Ethereum JSON-RPC methods](https://docs.reown.com/advanced/multichain/rpc-reference/ethereum-rpc), `personal_sign`, `eth_signTypedData`, `eth_sendTransaction` and `eth_signTransaction`
- [MetaMask: Smart accounts](https://docs.metamask.io/smart-accounts-kit/concepts/smart-accounts/), ERC-4337 smart accounts, Stateless 7702 and delegations
- [Privy: Wallet infrastructure architecture](https://docs.privy.io/security/wallet-infrastructure/architecture), enclave and auth shares and policy checks before signing
- [Turnkey: Architecture](https://whitepaper.turnkey.com/architecture), enclave key generation and deny-wins policies
- [Safe: Smart account overview](https://docs.safe.global/advanced/smart-account-overview), owners including passkeys, threshold, modules and guards
- [Base: What is Smart Wallet](https://docs.base.org/smart-wallet/concepts/what-is-smart-wallet), the move of the wallet SDK documentation to Coinbase Developer Platform

**In practice**

- [Tsuchiya, Dong, Soska and Christin: Blockchain Address Poisoning (USENIX Security 2025)](https://www.usenix.org/conference/usenixsecurity25/presentation/tsuchiya), 270 million attempts, 17 million victims, 6,633 incidents and at least $83.8 million lost
