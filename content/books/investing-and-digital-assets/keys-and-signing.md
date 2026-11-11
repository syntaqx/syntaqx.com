+++
title = "Keys, Signing & Key Management"
nav_title = "Keys & Signing"
description = "Key generation, HD wallets (BIP-32, 39, 44), HSMs, multisig, MPC and published TSS attacks, ceremonies, backups, policy engines and quorum signing services."
category = "Investing & Digital Assets Industry"
order = 2538
part = "Chains and Wallets"
tags = ["custody", "keys", "mpc", "multisig", "hsm", "bip-32", "signing"]
+++

Whoever can produce a valid signature owns the asset. There is no account officer to call, no reversal and no court order the chain will honor: a custodian's entire claim to the coins it holds for customers is that it, and nobody else, can sign for the addresses they sit at. The federal banking agencies put it in one sentence in July 2025: a bank has control for safekeeping when it can show "that no other party--including the customer--has access to information sufficient to unilaterally transfer the crypto-asset." Everything in this chapter serves that sentence: generating keys nobody has seen, deriving thousands of addresses from one secret, splitting signing authority so no one person or server can move funds, backing it all up without creating a copy that someone can steal, and putting a policy in front of the signer that reads what it is being asked to sign.

The failures are well documented. FTX's bankruptcy team found "private keys to over $100 million in Ethereum assets stored in plain text and without encryption on an FTX Group server" and single-signature keys "to billions of dollars" in a cloud secrets store that many employees could read. Bybit's multisig quorum signed away about $1.5 billion in February 2025 because the interface its signers trusted showed them a different transaction from the one they signed. Researchers published key-extraction attacks against widely deployed threshold-signature libraries in August 2023. This chapter covers key generation, HD wallets with a worked derivation path, HSMs and enclaves, multisig (Bitcoin script and Safe), MPC and threshold signatures with the published attacks, key ceremonies, backups and recovery, policy engines and quorum approvals, and how a signing service is put together. It adds keys, shares, ceremonies, policies and signing requests to the `wallets` table of [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business. Hot, warm and cold tiers as a treasury problem are [Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets); custodial platforms and their governance products are [Custody Platforms & Policy Engines](/books/investing-and-digital-assets/custody-platforms); validator signing keys and slashing protection are Hosting & Cloud's [Validators and Slashing](/books/hosting-and-cloud/blockchain-nodes-and-validators#validators-and-slashing).

## How the Custodians Do It

How vendors that publish their designs split signing authority, as of November 2026:

| Vendor | Key scheme | Who holds what | Approvals and policy |
| --- | --- | --- | --- |
| **BitGo** | Multisig or MPC (TSS), always three keys, 2-of-3 | User, backup and BitGo keys; for custody wallets BitGo's trust company divides keys "among different owners, so no one person controls more than one key for a given wallet" | Multisig signers sign asynchronously on chain and the fee or nonce can change during signing; MPC signs synchronously off chain into one signature, and "no part of the transaction can change" |
| **Fireblocks** | MPC-CMP; each workspace "a unique BIP32-HD wallet structure" | The third key share sits with an API co-signer (hot), a phone (warm) or an air-gapped phone approving by two-way QR (cold) | Transaction policies set who may move funds, limits and approvals; an admin quorum approves sensitive changes such as whitelisting addresses |
| **Turnkey** | Keys generated and used inside AWS Nitro enclaves running QuorumOS from reproducible builds | Key material "encrypted to the Signer's Quorum Key"; database, API gateway and coordinator are untrusted | A policy engine where an explicit deny beats any allow; a parser decodes EVM and Solana transactions so policies can read them; a root quorum (for example 2-of-3) |
| **Privy** | Shamir 2-of-2 split, reconstructed only inside a Nitro enclave per operation | An enclave share and an auth share released on valid credentials | The enclave checks the authorization signature and wallet policies before it reconstructs the key and signs |
| **Safe** | On-chain multisig contract | Owners (EOAs, contracts or passkeys) and a threshold | Optional guards can reject transactions; modules execute "using alternative access patterns (instead of multi-signature)" |

The designs differ in where the secret lives (several separate keys, shares of one key, or one key inside attested hardware), but they converge on the same three controls: no single party can sign, a machine-enforced policy sits before the signer, and changes to the policy need a quorum of their own.

## Generating a Key

A private key on Bitcoin and Ethereum is a 256-bit number on the secp256k1 curve; on Solana it is an Ed25519 key. Generation is the moment a key is most exposed, because the generating machine sees it whole (except under distributed key generation, below). The agencies' statement points banks to NIST's key-generation recommendations and notes that "keys may be generated by widely available cryptographic wallets," but that a bank "may determine that such keys do not meet the requirements of its control environment." My rule is that a custody key is generated inside the device or protocol that will hold it (an HSM, an enclave, or an MPC key generation among the share holders) and never exists in exportable form outside it; a key generated on a laptop and imported is a key someone else may have.

## HD Wallets

An exchange needs a fresh deposit address per customer per chain, millions of them, without a million secrets to back up. Hierarchical deterministic (HD) wallets derive every key from one seed.

### BIP-39: the seed phrase

BIP-39 turns 128 to 256 bits of entropy into words. The checksum is the first ENT/32 bits of SHA-256 of the entropy; entropy plus checksum is split into 11-bit groups, each indexing one of 2,048 words. Worked: 128 bits of entropy plus a 4-bit checksum is 132 bits, 12 words; 256 bits plus 8 is 264 bits, 24 words. The seed is PBKDF2 with the mnemonic as password and "mnemonic" plus an optional passphrase as salt, "The iteration count is set to 2048 and HMAC-SHA512 is used," giving a 512-bit seed. Because "every passphrase generates a valid seed," a wrong passphrase opens a different, empty wallet rather than failing, which matters for recovery drills: a passphrase typo looks like a loss.

### BIP-32: derivation and the hardened boundary

The master key is HMAC-SHA512 with key "Bitcoin seed" over the seed: the left 32 bytes are the master private key, the right 32 the chain code. Each child is derived from a parent key, its chain code and a 32-bit index. Indexes 0 to 2^31 − 1 are normal: a child public key can be derived from the parent public key alone, which lets a server hold only an extended public key (xpub) and generate receive addresses it can't spend from. BIP-32 names exactly that use: give a webserver the account's external-chain xpub, so that someone who breaks into it "can at most see all incoming payments" and "will not be able to steal the money," and give an auditor account-level xpubs to see every transaction without any secret.

Indexes 2^31 and above are hardened: derivation needs the parent private key. The boundary exists because of one property: knowing a parent extended public key plus any non-hardened child private key is "equivalent to knowing the parent extended private key." If one deposit key leaks and the attacker also holds the xpub above it, every key under that xpub is lost. The account level is therefore hardened, and a platform never ships an xpub to a system that also handles any child private key.

### BIP-44: a worked path

BIP-44 fixes the levels: `m / purpose' / coin_type' / account' / change / address_index`, with the first three hardened, change 0 for receiving and 1 for change, and coin types from the SLIP-44 registry (Bitcoin is 0). The seventh receive address of a platform's first Bitcoin deposit account:

```text
m / 44' / 0' / 0' / 0 / 7

level          written   index (uint32)   derivation
purpose        44'       0x8000002C       hardened: needs the account's private parent
coin_type      0'        0x80000000       hardened (Bitcoin)
account        0'        0x80000000       hardened: the boundary an xpub can't cross
change         0         0x00000000       normal: external (receive) chain
address_index  7         0x00000007       normal: derivable from the account xpub
```

The deposit service holds the xpub for `m/44'/0'/0'/0` and derives index 7 on demand; the signer, somewhere else, holds the private key for `m/44'/0'/0'`. Two operational details follow:

- **Record every index issued.** BIP-44 recovery assumes a gap limit of 20 on the external chain: "If the software hits 20 unused addresses in a row, it expects there are no used addresses beyond this point." An exchange that issues addresses to customers who never deposit can leave hundreds of unused indexes between used ones, so its recovery can't rely on scanning; the `addresses` table, with the index, is the inventory.
- **One account per purpose.** Separate hardened accounts for deposits, hot, cold and each legal entity, so an xpub shared for one purpose reveals nothing about the others.

## HSMs and Enclaves

A hardware security module holds keys in tamper-resistant hardware and performs signatures inside it; the key never leaves ([KMS or HSM](/docs/security/encryption-at-rest#kms-or-hsm)). For crypto custody two requirements narrow the choice: the HSM must support the chain's curve (secp256k1 is not universal in cloud KMS offerings) and the signing path must enforce policy, not merely protect the key, because an HSM that signs whatever an authenticated caller sends turns a compromised application server into a compromised wallet. FTX's report lists HSMs among the "commercially available products" it failed to use, and notes that when keys were encrypted the decryption key sat in a cloud secrets store "and not in a protected form, such as HSM."

Trusted execution environments take the same idea into software running on attested hardware. Turnkey's signer, policy engine and parser run as Nitro enclave applications booted from reproducible builds, so a running binary can be traced to its source; Privy reconstructs a Shamir-split key only inside an enclave with "no persistent storage, no interactive access, and no network connectivity." The trust moves from "this server is protected" to "this exact code is running on hardware that attests to it," which is stronger, and which also concentrates trust in the enclave vendor's attestation chain and the build pipeline ([Signing in the Build](/docs/security/software-updates#signing-in-the-build)).

## Multisig

### Bitcoin script

Bitcoin has had multisignature outputs since BIP-11's template, "m {pubkey}...{pubkey} n OP_CHECKMULTISIG," redeemed by "OP_0 ...signatures..." (the leading `OP_0` works around a bug in the opcode). Modern wallets wrap the script in pay-to-script-hash or its SegWit form so the sender sees an ordinary address. Coordinating signers is what BIP-174's partially signed transactions (PSBT) are for: a Creator builds the unsigned transaction, an Updater adds the UTXOs and scripts, each Signer signs using "only the UTXOs provided in the PSBT," a Combiner merges the signatures, and a Finalizer and Extractor produce the network transaction. Because a signer works only from the PSBT, it can be air-gapped, and because the PSBT carries the input values, the signer can compute the fee itself instead of trusting the coordinator.

### Safe on EVM chains

On Ethereum, multisig is a contract. A Safe has owners and "a threshold number of accounts required to confirm a transaction"; each Safe is a proxy that delegates to a shared singleton. Its executor runs either a `call` or a `delegatecall`, and that distinction is the Bybit lesson. A `call` asks another contract to do something; a `delegatecall` runs another contract's code inside the Safe, with the Safe's storage and balance, so a `delegatecall` to an attacker's contract can rewrite the Safe itself. Modules and guards are powerful for the same reason: a module can execute without the multisig flow, and a malicious guard can block every transaction.

### Bybit, February 21, 2025

The FBI attributed the theft of about $1.5 billion from Bybit on or about February 21, 2025 to North Korea's "TraderTraitor" actors. Per Safe's and Sygnia's findings as reported: the attack began with a compromised Safe{Wallet} developer machine; JavaScript served from Safe's cloud storage bucket was modified two days before and activated only for Bybit's cold wallet; Bybit's signers approved what their screens showed as a routine transfer while the payload replaced it with a `delegatecall` that handed control of the Safe to the attacker; more than 400,000 ETH and stETH moved; and clean files were restored about two minutes after execution. External reviewers found no vulnerability in Safe's contracts. Safe afterwards added validation of transaction hashes, data and signatures. The quorum worked as designed. Every signer signed, and none of them could see what they were signing. The controls that would have stopped it:

- **Independent decoding.** Each signer's device decodes the raw transaction itself (operation type, target, calldata) instead of trusting the web interface; structured signing (EIP-712, which exists because signatures were "an opaque hex string displayed to the user with little context") helps only if the device shows the fields.
- **Policy on operation type.** Deny `delegatecall` from treasury wallets except to an allowlisted set of contracts.
- **Destination allowlists** for cold-to-hot moves, so a cold wallet can only ever send to the platform's own hot wallets.
- **Simulation on a separate stack** before the last signature, showing the state change, not the intent.

The same class of failure, a signer trusting what it was handed, recurred when a compromised internal signing service signed EIP-7702 delegations for Binance's hot wallets ([Binance, October 29, 2026](/books/investing-and-digital-assets/exchange-security#binance-october-29-2026)).

## MPC and Threshold Signatures

### What it is

In threshold ECDSA or EdDSA, the private key is never assembled. A distributed key generation gives each party a share; any t of n parties run a protocol that produces an ordinary signature, and the chain sees a single-signature address. Compared with on-chain multisig:

| | On-chain multisig (Bitcoin script, Safe) | MPC / threshold signatures |
| --- | --- | --- |
| **What the chain sees** | Several signatures and the policy (m of n) | One signature from one key |
| **Chain support** | Needs script or contract support per chain | Any chain using the supported curve |
| **Fees** | More data or gas per signature | Same as a single signer |
| **Signing** | Asynchronous; signers sign at different times | Synchronous rounds among online parties |
| **Changing signers** | An on-chain transaction | Re-sharing or refresh off chain; the address stays |
| **Auditability** | The policy is public and enforced by the chain | The policy lives in the software; the chain can't tell one signer from five |
| **Failure modes** | Contract bugs, interface deception (Bybit) | Protocol and implementation bugs that leak shares |

### The protocols

GG18 and GG20 (Gennaro and Goldfeder) and Lindell's 2017 two-party protocol were the first widely deployed. CMP (Canetti, Makriyannis and Peled, "UC Non-Interactive, Proactive, Threshold ECDSA") cut signing to four rounds, "3 of these rounds can take place in a preprocessing stage," so the online step is a single message, and adds proactive key refresh, re-randomizing shares periodically so a share stolen before a refresh is useless after it. Its security rests on Strong RSA and Paillier encryption.

### Published attacks

Two disclosures in August 2023 showed how much depends on implementation:

- **BitForge (Fireblocks, August 9, 2023).** In GG18 and GG20 implementations, a missing zero-knowledge proof let a malicious party exfiltrate the full key, in "16 signatures" in some implementations and up to a billion in others. In Lindell17 implementations that mishandled failed signatures, the finalizing party could extract the key "after approximately 200 signature requests." More than 15 providers and projects were affected; Fireblocks names Coinbase WaaS and Zengo as having fixed them promptly, and ran a 90-day disclosure.
- **TSSHOCK (Verichains, Black Hat USA, August 10, 2023).** Three key-extraction attacks (α-shuffle, c-split, c-guess) on the `dlnproof` sub-protocol used for range proofs, where "Most implementations can be attacked with just one member." Verichains lists BNB Chain's tss-lib, Multichain, Taurus's multi-party-sig, THORChain and Threshold Network as fixed, Axelar, ING Bank's library and Swingby as not yet fixed at publication, and ZenGo X's multi-party-ecdsa as won't fix. Vendor reporting had begun in December 2022.

The lesson for a platform is not "avoid MPC" but that a threshold scheme is a cryptographic protocol whose proofs must all be checked, every round, by every party: buy it from a vendor that publishes its protocol and its audits, ask for their status on each published attack, and keep share holders operationally independent. Multichain's collapse in 2023 is the operational version: its CEO was detained in May, and only he had access to the servers behind its MPC nodes, per its own statements as reported, and his family later used login details from his home computer to reach the cloud server and move customer assets out of MPC wallets. A threshold of shares held by one person is a single key.

## Key Ceremonies

A ceremony is the scripted, witnessed event in which keys or shares are generated, backed up or rotated. What a good one has, drawn from the agencies' list of concerns (generation, storage, deletion, contingency planning for "lost or compromised keys") and the vendors' quorum designs:

- **A script, rehearsed.** Every step written, including what to do on failure; a dry run with throwaway keys.
- **Separation of roles.** Share holders, operators and witnesses are different people; no one carries more than one share or one backup out of the room.
- **Air-gapped generation** on hardware that is new, inspected and destroyed or sealed afterward, or a distributed key generation where no machine sees the whole key.
- **Evidence.** Video or witness attestations, the public keys and addresses produced, hashes of any software used, and signatures of every participant on the minutes.
- **Distribution.** Backups in separate locations and jurisdictions, under separate custodians, with tamper-evident packaging whose serials go in the record.
- **A verification spend.** A small transaction from the new wallet proves the keys sign before value arrives.

## Backups and Recovery

A backup is a second copy of the key, and the second copy is the one that gets stolen. FTX kept keys "without appropriate backup procedures such that if the key was lost, the associated crypto assets would likely be permanently lost," and in other places with no record of what a key was for, titled "use this" or "do not use." Both failures are common at smaller scale. My defaults:

- **Back up shares, not keys,** each encrypted to a different custodian and stored apart, so recovery needs the same quorum as signing.
- **Know what every backup opens.** The inventory maps each backup to its key, wallets, addresses and derivation paths.
- **Drill recovery.** Restore from backup to a fresh environment on a schedule and prove it by signing; a backup never restored is a hope.
- **Plan for compromise, not only loss.** A suspected compromise means moving every asset under that key to new keys, which needs fee float on every chain and a pre-written order of operations.
- **The BitGo pattern for client-held keys:** where a customer holds one key of a 2-of-3, the provider's backup key lets the customer recover if the provider disappears, and the provider still can't move funds alone.

## Policy Engines and Quorum Approvals

The signer is the last line, so the decision before it must be made on what the transaction actually does. A policy engine evaluates a decoded transaction (Turnkey's parser extracts metadata from unsigned EVM and Solana transactions for this reason) against rules such as destination allowlists, amount and velocity limits per wallet and per period, allowed contract methods and operation types, chain and asset, and time windows; Turnkey's rule that "`DENY` takes precedence over `ALLOW`" is the safe default. Quorum approvals sit on two levels: per transaction (two approvers for a withdrawal above a threshold), and per policy change (Fireblocks requires an admin quorum to add a whitelisted address, so one compromised admin can't open a path). The policy itself is versioned, and every signature records the policy version it passed.

A policy check of that kind, in the service that builds requests for the signer:

```go tab="Go"
type Operation uint8

const (
	OpCall Operation = iota
	OpDelegateCall
)

type SignRequest struct {
	WalletID    string
	To          string    // decoded from the raw transaction, never taken from the caller
	Operation   Operation // decoded likewise
	AmountUSD   int64     // in cents, at the request's mark
	Approvals   int
}

type Policy struct {
	Allowlist         map[string]bool // destinations this wallet may pay
	DelegateAllowlist map[string]bool // contracts it may delegatecall
	MaxUSD            int64
	ApprovalsAbove    int64 // cents; above this, two approvals
}

func (p Policy) Evaluate(r SignRequest) error {
	if r.Operation == OpDelegateCall && !p.DelegateAllowlist[r.To] {
		return errors.New("deny: delegatecall to a contract not allowlisted")
	}
	if !p.Allowlist[r.To] {
		return errors.New("deny: destination not allowlisted")
	}
	if r.AmountUSD > p.MaxUSD {
		return errors.New("deny: above wallet limit")
	}
	if r.AmountUSD > p.ApprovalsAbove && r.Approvals < 2 {
		return errors.New("hold: needs a second approval")
	}
	return nil
}
```

```rust tab="Rust"
use std::collections::HashSet;

#[derive(PartialEq)]
enum Operation { Call, DelegateCall }

struct SignRequest {
    to: String,          // decoded from the raw transaction, never taken from the caller
    operation: Operation,
    amount_usd: i64,     // in cents, at the request's mark
    approvals: u32,
}

struct Policy {
    allowlist: HashSet<String>,
    delegate_allowlist: HashSet<String>,
    max_usd: i64,
    approvals_above: i64,
}

impl Policy {
    fn evaluate(&self, r: &SignRequest) -> Result<(), &'static str> {
        if r.operation == Operation::DelegateCall && !self.delegate_allowlist.contains(&r.to) {
            return Err("deny: delegatecall to a contract not allowlisted");
        }
        if !self.allowlist.contains(&r.to) {
            return Err("deny: destination not allowlisted");
        }
        if r.amount_usd > self.max_usd {
            return Err("deny: above wallet limit");
        }
        if r.amount_usd > self.approvals_above && r.approvals < 2 {
            return Err("hold: needs a second approval");
        }
        Ok(())
    }
}
```

The decisive line is the comment: the destination and operation are decoded from the bytes that will be signed. A policy that checks fields the caller supplied next to an opaque payload checks nothing.

## Signing Services

Put together, a signing service is a pipeline with a hard boundary:

1. **Request.** The withdrawal or sweep service submits an unsigned transaction with an idempotency key ([Idempotency](/docs/requests/idempotency)) and the ledger reference it settles.
2. **Decode and simulate.** An independent component decodes the payload and simulates it against current chain state.
3. **Policy.** The engine evaluates the decoded transaction and returns allow, deny or needs-approval.
4. **Approvals.** Approvers see the decoded transaction and the simulation, on their own devices, and sign approvals bound to the payload's hash.
5. **Sign.** The HSM, enclave or MPC quorum checks the approvals and the policy verdict, which are themselves signed, and signs the exact payload.
6. **Broadcast and track.** The signed transaction goes to the chain and becomes an `onchain_transactions` row ([Blockchains for Platform Engineers](/books/investing-and-digital-assets/blockchains-for-engineers#how-to-build-it)).

The boundary is between steps 4 and 5: nothing on the application side can make the signer sign, only a verdict and approvals the signer verifies. The ledger never calls the signer directly, and the signer never trusts the ledger.

## How to Build It

The core `wallets` table names a key scheme (`mpc`, `multisig`, `hsm`) and a purpose, and `addresses` carries each address's derivation path ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)). This chapter adds `enclave` to the key schemes, and the keys and shares behind each wallet, the ceremonies that made them, versioned policies, and signing requests with their approvals.

```sql
ALTER TABLE wallets
  DROP CONSTRAINT wallets_key_scheme_check,
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD CONSTRAINT wallets_key_scheme_check CHECK (key_scheme IN ('mpc', 'multisig', 'hsm', 'enclave')) NOT VALID;

CREATE TABLE keys (                -- one logical key: an HD root, an account node, a TSS key
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  wallet_id        UUID NOT NULL REFERENCES wallets (id),
  scheme           TEXT NOT NULL CHECK (scheme IN ('hsm', 'enclave', 'multisig_member', 'tss', 'shamir')),
  curve            TEXT NOT NULL CHECK (curve IN ('secp256k1', 'ed25519', 'p256')),
  derivation_path  TEXT,                   -- "m/44'/0'/0'"; null for non-HD keys
  public_key       TEXT NOT NULL,          -- or the xpub at the hardened account node
  threshold        SMALLINT,               -- tss/shamir/multisig: t
  participants     SMALLINT,               -- n
  holder           TEXT NOT NULL,          -- 'platform', 'customer', 'vendor', 'backup_custodian'
  ceremony_id      UUID NOT NULL,          -- key_ceremonies (id), created below
  status           TEXT NOT NULL CHECK (status IN ('active', 'rotating', 'retired', 'compromised')),
  CHECK ((scheme IN ('tss', 'shamir', 'multisig_member')) = (threshold IS NOT NULL)),
  CHECK (threshold IS NULL OR (threshold >= 2 AND threshold <= participants))
);

CREATE TABLE key_shares (                  -- where each share or backup lives; never the share itself
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  key_id           UUID NOT NULL REFERENCES keys (id),
  share_index      SMALLINT NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('online', 'cold', 'backup')),
  custodian_party  UUID NOT NULL REFERENCES parties (id),  -- a person or an entity
  location_ref     TEXT NOT NULL,          -- vault, HSM partition, device serial
  tamper_seal      TEXT,
  last_verified_at TIMESTAMPTZ,            -- the last recovery drill that used it
  UNIQUE (key_id, share_index, kind)
);

CREATE TABLE key_ceremonies (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  kind             TEXT NOT NULL CHECK (kind IN ('generation', 'backup', 'refresh', 'rotation',
                     'recovery_drill', 'destruction')),
  script_version   TEXT NOT NULL,
  software_hashes  JSONB NOT NULL,         -- what ran, by hash
  participants     JSONB NOT NULL,         -- party ids and roles (holder, operator, witness)
  evidence_uri     TEXT NOT NULL,          -- minutes, signatures, recordings
  verification_tx  UUID REFERENCES onchain_transactions (id),  -- the test spend
  held_at          TIMESTAMPTZ NOT NULL
);

CREATE TABLE signing_policies (            -- versioned; a change needs a quorum
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  wallet_id        UUID NOT NULL REFERENCES wallets (id),
  version          INT NOT NULL,
  rules            JSONB NOT NULL,         -- allowlists, limits, operation rules, approvals
  approved_by      UUID[] NOT NULL,
  required_quorum  SMALLINT NOT NULL,
  valid_during     TSTZRANGE NOT NULL,
  UNIQUE (wallet_id, version),
  CHECK (cardinality(approved_by) >= required_quorum),
  EXCLUDE USING GIST (wallet_id WITH =, valid_during WITH &&)
);

CREATE TABLE signing_requests (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  wallet_id        UUID NOT NULL REFERENCES wallets (id),
  transfer_id      UUID REFERENCES transfers (id),   -- the withdrawal or sweep it settles
  idempotency_key  TEXT NOT NULL UNIQUE,
  payload_sha256   BYTEA NOT NULL,         -- the exact bytes to be signed
  decoded          JSONB NOT NULL,         -- to, operation, method, amounts, from the decoder
  simulation       JSONB,                  -- balance and state changes
  policy_id        UUID NOT NULL REFERENCES signing_policies (id),
  verdict          TEXT NOT NULL CHECK (verdict IN ('allow', 'deny', 'needs_approval')),
  status           TEXT NOT NULL CHECK (status IN ('received', 'denied', 'awaiting_approval',
                     'approved', 'signed', 'broadcast', 'expired', 'canceled')),
  onchain_tx_id    UUID REFERENCES onchain_transactions (id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ NOT NULL
);

CREATE TABLE signing_approvals (
  signing_request_id UUID NOT NULL REFERENCES signing_requests (id),
  approver_party_id  UUID NOT NULL REFERENCES parties (id),
  payload_sha256     BYTEA NOT NULL,       -- what the approver's device signed off on
  device_attestation TEXT,
  approved_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (signing_request_id, approver_party_id)
);
```

The request states:

| From | Event | To |
| --- | --- | --- |
| `received` | Decode, simulate and policy return deny | `denied` |
| `received` | Policy returns allow | `approved` |
| `received` | Policy returns needs approval | `awaiting_approval` |
| `awaiting_approval` | Quorum of approvals bound to the payload hash | `approved` |
| `awaiting_approval` | `expires_at` passes | `expired` |
| `awaiting_approval` | Requester or an approver cancels | `canceled` |
| `approved` | The signer verifies verdict and approvals and signs | `signed` |
| `signed` | Sent to the chain | `broadcast` |

Notes on the sketch:

- **No secret in the database.** `key_shares` records where a share is and who holds it, never the share. The database is untrusted, as in Turnkey's model.
- **Approvals bind to bytes.** An approval carries the payload hash; the signer refuses a request whose payload hash differs from any approval's, which is the check Bybit's signers lacked.
- **Policies need a quorum to change.** The check constraint makes a policy version without enough approvers impossible to store; the signer verifies the same thing cryptographically.
- **One signature per instruction.** The idempotency key on `signing_requests` means a retried withdrawal can't produce a second signed transaction; a fee bump is a new request that references the same transfer.
- **Expiry is a control.** A request approved and not signed within its window expires, so a stale approval can't be used later.
- **Events:** `signing_request.denied`, `signing_request.approved`, `signing_request.signed`, `signing_policy.changed`, `key.compromised` go through the [outbox](/docs/architecture/events#the-transactional-outbox); `key.compromised` freezes every wallet using the key and starts the move-to-new-keys runbook.

## Auditing

- **Key inventory:** every key and share, its holder, location, ceremony and last recovery drill.
- **Ceremony records** with participants, scripts, software hashes and evidence.
- **Every policy version** with its approvers and the period it was in force.
- **Every signing request** with decoded payload, simulation, verdict, approvals and the resulting chain transaction, so any outflow traces to the people and rules that allowed it.
- **Access to signing infrastructure,** including break-glass use ([Audit Everything](/docs/security/infrastructure-access#audit-everything)).
- **Vendor attestations** for HSMs, enclaves and MPC libraries, including status against published attacks.

## What This Means for the System You Build

- **Generate keys where they live** and never export them.
- **Harden the account level** in every HD tree and never put an xpub next to a child private key.
- **Record every derived address index;** don't rely on gap-limit scanning to recover an exchange's addresses.
- **Split authority:** multisig or threshold signatures with operationally independent holders.
- **Decode the bytes being signed,** run policy on that, and bind approvals to the payload hash.
- **Deny `delegatecall` and non-allowlisted destinations** from treasury wallets.
- **Back up shares, not keys,** and drill recovery on a schedule.
- **Ask every MPC vendor for its status on BitForge and TSSHOCK,** and its audit reports.

## References

**Regulators and guidance**

- [OCC, Federal Reserve and FDIC: Crypto-Asset Safekeeping by Banking Organizations (July 14, 2025)](https://www.federalreserve.gov/newsevents/pressreleases/files/bcreg20250714a1.pdf), control as no other party being able to transfer unilaterally, taking possession of existing keys, key generation and NIST, and hot and cold wallets

**Courts and enforcement**

- [In re FTX Trading Ltd., First Interim Report of John J. Ray III on Control Failures (D. Del. 22-11068, Doc 1242-1, April 9, 2023)](https://storage.courtlistener.com/recap/gov.uscourts.deb.188450/gov.uscourts.deb.188450.1242.1.pdf), keys in plain text, keys in a cloud secrets store, no multisig or MPC, no HSM, missing backups and the single Bitcoin Core wallet node
- [FBI: North Korea responsible for $1.5 billion Bybit hack (PSA I-022625-PSA, February 26, 2025)](https://www.ic3.gov/PSA/2025/PSA250226), attribution to TraderTraitor and dispersal across chains

**Standards and protocols**

- [BIP-11: M-of-N standard transactions](https://github.com/bitcoin/bips/blob/master/bip-0011.mediawiki), the multisig script template and the `OP_0` dummy
- [BIP-32: Hierarchical deterministic wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki), master key generation, hardened and normal derivation, the xpub leak property and the audit and webserver use cases
- [BIP-39: Mnemonic code for generating deterministic keys](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki), entropy and checksum, word counts and PBKDF2 seed derivation
- [BIP-44: Multi-account hierarchy for deterministic wallets](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki), the path levels, hardened levels, gap limit of 20 and coin types
- [BIP-174: Partially signed Bitcoin transactions](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki), PSBT roles and offline signing
- [EIP-712: Typed structured data hashing and signing](https://eips.ethereum.org/EIPS/eip-712), why opaque signing is unsafe and the domain separator
- [Canetti, Makriyannis and Peled: UC Non-Interactive, Proactive, Threshold ECDSA (ePrint 2020/492)](https://eprint.iacr.org/2020/492), four signing rounds with three precomputable, proactive refresh and assumptions

**Vendor documentation**

- [BitGo: Wallet types](https://developers.bitgo.com/concepts/wallet-types), three keys and 2-of-3, custody key separation and multisig against MPC
- [Fireblocks: Capabilities](https://developers.fireblocks.com/docs/capabilities), BIP32 workspaces, MPC-CMP, hot, warm and cold by where the third share lives, admin quorum and policies
- [Turnkey: Architecture](https://whitepaper.turnkey.com/architecture), Nitro enclaves, QuorumOS and reproducible builds, deny-wins policies, the parser and the root quorum
- [Privy: Wallet infrastructure architecture](https://docs.privy.io/security/wallet-infrastructure/architecture), Shamir shares, enclave reconstruction and policy checks before signing
- [Safe: Smart account overview](https://docs.safe.global/advanced/smart-account-overview), owners and threshold, singleton and proxy, modules, guards and `call` or `delegatecall`

**In practice**

- [Fireblocks: BitForge (August 9, 2023)](https://www.fireblocks.com/blog/bitforge-fireblocks-researchers-uncover-vulnerabilities-in-over-15-major-wallet-providers/), GG18, GG20 and Lindell17 key-extraction findings and the disclosure
- [Verichains: TSSHOCK](http://verichains.io/tsshock/), the α-shuffle, c-split and c-guess attacks, affected libraries and fix status, Black Hat USA 2023
- [BleepingComputer: Lazarus hacked Bybit via a breached Safe{Wallet} developer machine](https://www.bleepingcomputer.com/news/security/lazarus-hacked-bybit-via-a-breached-safe-wallet-developer-machine/), the modified JavaScript, timing, amounts and Safe's remediation (press, citing Safe and Sygnia)
- [Rekt: Not so Safe](https://rekt.news/not-so-safe), the payload that turned a normal call into a `delegatecall` to the attacker's contract (press)
- [Decrypt: Multichain shutters operations (July 14, 2023)](https://decrypt.co/148559/multichain-shutters-operations-chinese-police-take-ceo-sister-custody), the CEO's detention on May 21, 2023, his sole access to the MPC node servers and the movement of MPC-held assets (press)
