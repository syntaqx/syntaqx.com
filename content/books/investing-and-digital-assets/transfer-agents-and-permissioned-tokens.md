+++
title = "Transfer Agents & Permissioned Tokens"
nav_title = "Transfer Agents"
description = "SEC transfer agent rules, the official record on chain, ERC-3643 identity registries and allowlisted transfers, forced transfers, recovery and cap tables."
category = "Investing & Digital Assets Industry"
order = 2569
part = "Tokenization"
tags = ["tokenization", "transfer-agents", "erc-3643", "permissioned-tokens", "forced-transfers", "cap-tables"]
+++

Every security has someone whose job is to know who owns it. For a US public company or fund that is the transfer agent: it keeps the master securityholder file, records every transfer, issues and cancels shares, pays dividends to holders of record and answers to the SEC for getting it right. A public blockchain also knows who owns every token. When a security is a token, there are two candidates for the official record, and they have to be made into one: either the agent's file is the record and the chain is a view of it, or the chain is the record and the agent's job is to control what may be written to it.

Permissioned tokens are how the second arrangement works. A plain ERC-20 lets anyone send to anyone, which a security can't allow: the holder may need to be verified, accredited, outside the US, under a holder cap, or out of a lockup. A permissioned token checks every transfer against an identity registry and a compliance rule set before it moves, and gives the agent powers no plain token has: freezing an address or part of a balance, forcing a transfer a court ordered, and moving a holder's tokens to a new wallet when the old key is lost. Those powers are what make a token a lawful record of ownership, and they are also what makes it unlike the permissionless assets in the rest of this book.

This chapter covers who keeps tokenized records today, the SEC's transfer agent rules and the 2026 proposal to modernize them, the official record on chain, ERC-3643 and allowlisted transfers, forced transfers and recovery with worked numbers, and cap tables, on the core model of [The Investing & Digital Assets Business](/books/investing-and-digital-assets/investing-business#the-core-data-model). The products built on this are [Tokenized Treasuries & Funds](/books/investing-and-digital-assets/tokenized-funds) and [Tokenized Stocks & 24/7 Securities](/books/investing-and-digital-assets/tokenized-stocks); token mechanics in general, including freeze functions and upgradeable proxies, are [Tokens & Token Standards](/books/investing-and-digital-assets/tokens-and-standards).

## How the Platforms Do It

Who keeps the record for the main tokenized securities, from their own documents, as of November 2026:

| Record keeper | What it records | Where the official record is | Holder control | Source |
| --- | --- | --- | --- | --- |
| **Franklin Templeton's transfer agent (FOBXX)** | A registered money market fund's shares | The agent "maintains the official record of share ownership via a proprietary blockchain-integrated system," under its "full and complete control" | Agent-hosted wallets (the agent holds the key) for retail; investor-managed wallets for institutions; corrections by a later instruction | Prospectus |
| **Securitize (BUIDL and others)** | Fund and company shares tokenized on its platform | The fund's transfer agent; transfers "only ... to whitelisted investors" | Investor wallets on eight chains | BUIDL page; DS Protocol interfaces |
| **Superstate** | Funds and companies' registered shares (Opening Bell) | A "digital transfer agent" registry "across book-entry holdings, tokenized holdings" | Allowlisted investor addresses; issuers allowlist protocols | Superstate docs |
| **DTC** | DTC-held securities in tokenized form | DTC, with tokens "1:1 backed by securities held at DTC" | DTC-registered wallets only | DTCC |
| **ERC-3643 (T-REX) issuers** | Any security on an EVM chain | The token contract, administered by agents | Identity registry, compliance contract, freezes, forced transfers, recovery | EIP-3643 |

Two things stand out. **The agent keeps control in every model.** Even where the chain carries the balances, someone appointed by the issuer can add and remove holders, freeze, correct and recover; the chain gives speed and visibility, not finality against the agent. **Book entry doesn't go away.** Superstate's registry spans book-entry and tokenized holdings, Franklin's agent runs both a blockchain and its own system, and DTC converts entitlements between forms. Shares outstanding is the sum.

## The SEC's Transfer Agent Rules

A transfer agent for a security registered under the Exchange Act must itself register: it is "unlawful for any transfer agent, unless registered in accordance with this section," to use the mails or interstate commerce "to perform the function of a transfer agent" for such a security (Exchange Act §17A(c)(1), 15 U.S.C. 78q-1(c)). The SEC's rules then set what the agent does, and a tokenized record has to meet them as a database record would:

- **Turnaround.** A registered agent must "turnaround within three business days of receipt at least 90 percent of all routine items" received for transfer during a month (Rule 17Ad-2(a)). A transfer on chain settles in seconds; the agent's processing of the items it still handles by instruction (issuances, cancellations, corrections) is held to this clock.
- **The master securityholder file.** The recordkeeping agent must "promptly and accurately post to the master securityholder file debits and credits" with "minimum and appropriate certificate detail representing every security transferred, purchased, redeemed or issued" (Rule 17Ad-10(a)(1)), within five business days for most agents ((a)(2)(iii)), and keep "an accurate master securityholder file and subsidiary files," with "diligent and continuous attention to resolve all record differences" ((b)).
- **The control book.** The agent must "maintain and keep current an accurate control book for each issue of securities," changed only with "written authorization from a duly authorized agent of the issuer" (Rule 17Ad-10(e)): the authorized and issued count that the holder file must sum to. On chain, total supply across every network plus book-entry holdings is checked against it.
- **Retention.** Certificate detail is kept "for a period of six years from the date of deletion" (Rule 17Ad-10(f)).

**The 2026 proposal.** On September 4, 2026 the SEC proposed modernizing these rules (Rel. 34-106246, 91 FR 56946, File S7-2026-30; comments closed November 3, 2026), "designed to modernize the rules governing registered transfer agents." It would add a compliance program rule (proposed Rule 17ad-30) and a rule on restrictive legends (17ad-31), amend recordkeeping (17ad-6 and 17ad-7) and safeguarding (17ad-12), rescind Rule 17ad-4 and revise Forms TA-1 and TA-2. The release notes firms "developing ... blockchain-based recordkeeping" and "onchain" transfer agents, and the risks to "blockchain data integrity, security of tokenized securities, and distributed ledger operational models." <!-- source-gap: ida-ta-proposal-dlt | missing | whether the September 2026 transfer agent proposal sets specific requirements for a master securityholder file kept on a distributed ledger | closes with: the proposing release's rule text and discussion of distributed ledgers, read in full | checked: 2026-11-05 --> I read only part of the release, so I don't state what, if anything, it would require of a ledger-based file specifically. It is a proposal: the rules above are the ones in force.

## The Official Record on Chain

Which record governs is decided by the issuer's documents, not by the technology, and there are three workable answers:

- **The agent's file governs; the chain mirrors it.** Franklin's model: the agent's system is the official record, it uses public chains, and it corrects errors by "adding a correcting instruction to a later block" rather than deleting history. A disagreement between chain and file is resolved in the file's favor and then written to the chain.
- **The chain governs; the agent controls writes.** The ERC-3643 model: balances in the token contract are the record, and the agent's control is that only verified addresses can hold, and that agent functions can freeze, force and recover. The agent's off-chain file is the identity data behind the registry, not a second balance sheet.
- **Both, summed.** Superstate's registry and DTC's service: some holders are on book entry, some on chain, and the agent or depository moves positions between them. The control book ties to the sum.

For a platform holding tokenized securities for customers, the answer sets the reconciliation: against the agent's statement where the file governs, against the chain where the chain governs, and against both where both do. In each case the platform's own ledger is a third record, the customers' claims, and a token sitting in an omnibus address is one holder on the issuer's record no matter how many customers it represents ([Omnibus and Segregated](/books/investing-and-digital-assets/ledgers-and-positions#omnibus-and-segregated)).

## ERC-3643 and Allowlisted Transfers

ERC-3643, the "T-REX" token standard, is a final ERC (created July 9, 2021) that extends ERC-20 with identity and compliance. Its parts:

- **Identity Registry.** Links each wallet to an identity contract (ONCHAINID) and an ISO-3166 country code; `isVerified()` checks that the wallet is registered and that its identity holds the claims required, signed by issuers trusted for those claims.
- **Identity Registry Storage.** Holds the identities, separable from the registry so several tokens can share one investor base.
- **Claim Topics Registry and Trusted Issuers Registry.** Which claims an investor must have (KYC passed, accredited, jurisdiction) and which claim issuers may attest to each.
- **Compliance.** The offering's rules, "such as investor caps or accepted countries," checked by `canTransfer` and kept current by `transferred`, `created` and `destroyed` hooks.
- **Agents.** Addresses the owner appoints (`addAgent`, `removeAgent`) to run registry writes and the token's operational functions; the rationale notes agents may be automated systems or contracts.

A `transfer` succeeds only if all five hold: the sender's free balance (total minus frozen) covers the amount; the receiver `isVerified`; neither wallet is frozen; the token isn't paused; and the compliance contract's `canTransfer` returns true. The agent's tools sit beside that:

```solidity
function setAddressFrozen(address _userAddress, bool _freeze) external;
function freezePartialTokens(address _userAddress, uint256 _amount) external;
function unfreezePartialTokens(address _userAddress, uint256 _amount) external;
function forcedTransfer(address _from, address _to, uint256 _amount) external returns (bool);
function recoveryAddress(address _lostWallet, address _newWallet, address _investorOnchainID)
    external returns (bool);
function mint(address _to, uint256 _amount) external;
function burn(address _userAddress, uint256 _amount) external;
function pause() external;
function unpause() external;
```

`forcedTransfer` requires the receiver to be verified and bypasses the compliance rules; `mint` requires a verified receiver and also bypasses compliance; `burn` bypasses eligibility checks. Batch versions (`batchForcedTransfer`, `batchSetAddressFrozen`, `batchFreezePartialTokens` and others) process lists in one call and keep them in the same block. The events a watcher indexes are `TokensFrozen`, `TokensUnfrozen`, `AddressFrozen`, `RecoverySuccess(_lostWallet, _newWallet, _investorOnchainID)`, `Paused` and `Unpaused`, plus the ERC-20 `Transfer`.

Securitize's DS Protocol is built the same way, as published interfaces: a DS Token extending ERC-20 with investor-centric balances, a Trust Service for roles, a Registry Service holding investor information for compliance, and a Compliance Service the token calls to validate issuance and trades. Different standards, one design: identity off chain, a verdict on chain, and an agent with override powers.

## Forced Transfers and Recovery

A security's owner can change without the owner signing: a court orders shares transferred in a divorce or a judgment, an estate passes them to heirs, a regulator orders a seizure, or a holder loses the key. A transfer agent does this every day on its books. On a permissioned token, `forcedTransfer` and `recoveryAddress` are those books' entries.

### Worked numbers: a court-ordered transfer with a partial freeze

Holder B's wallet holds 5,000 tokens of a company's shares. When the dispute began the agent froze 3,500 of them with `freezePartialTokens`, leaving 1,500 free. The final order directs the agent to transfer **2,000** shares from B to C. C has been onboarded: C's wallet is registered and `isVerified` returns true.

| Step | Call | B total | B frozen | B free | C total | Events |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Before | | 5,000 | 3,500 | 1,500 | 0 | |
| 1 | `unfreezePartialTokens(B, 500)` | 5,000 | 3,000 | 2,000 | 0 | `TokensUnfrozen(B, 500)` |
| 2 | `forcedTransfer(B, C, 2000)` | 3,000 | 3,000 | 0 | 2,000 | `Transfer(B, C, 2000)` |

- **Why step 1.** The order moves 2,000 and only 1,500 are free. The standard doesn't say on the page whether `forcedTransfer` draws on frozen tokens itself, and implementations differ, so my runbook never relies on it: compute the shortfall (2,000 − 1,500 = 500), unfreeze exactly that, then force the transfer. B's remaining 3,000 stay frozen while the rest of the dispute runs.
- **What the forced transfer skips.** Compliance: if the offering caps the number of holders, C becomes a holder without `canTransfer` being asked. The agent checks the cap off chain before signing, because the contract won't.
- **What it doesn't skip.** C must be verified. An order naming an unverified recipient waits for onboarding; the agent doesn't verify C to make the call succeed.
- **The record.** Under the chain-governs model, the two transactions are the record, and the agent's file holds the order, the authority and the identity of the signer. Under Rule 17Ad-10 the debit to B and credit to C are posted to the master securityholder file within the rule's time, and the control book doesn't change: no shares were issued or cancelled.

### Worked numbers: a lost key

Holder D loses the key to a wallet holding 12,000 tokens. After the agent re-verifies D's identity (the same ONCHAINID, so the same investor), it registers D's new wallet in the identity registry and calls `recoveryAddress(lostWallet, newWallet, D_onchainID)`. The 12,000 tokens move to the new wallet and the contract emits `RecoverySuccess`; the lost wallet holds nothing, and the agent removes it from the registry so it can never receive again. Supply is unchanged at every step. The recovery is a transfer between two wallets of one holder, and the agent's file records it as no change of ownership at all.

Franklin's prospectus shows the cost of the same event in a hosted model: correcting a lost investor-managed key "may require information collection and operational tasks" and "may render the investor's holdings unavailable while these activities take place." A permissioned token makes recovery possible, never instant.

### The other side of these powers

The same functions that recover a holder's shares can take them. An agent key that can `forcedTransfer` can move any holder's balance to any verified wallet; one that can `setAddressFrozen` can stop anyone. For a platform listing or holding these tokens:

- **Know the agent keys** and who controls them, as for an upgradeable token's admin key ([Upgradeable Proxies and Admin Keys](/books/investing-and-digital-assets/tokens-and-standards#upgradeable-proxies-and-admin-keys)).
- **Watch the events.** A `forcedTransfer` out of the platform's omnibus wallet, a freeze on it, or a pause is an incident until the agent explains it.
- **Disclose them.** Customers holding a permissioned token through the platform hold it subject to the issuer's agent, and the risk disclosure says so.

## Cap Tables

A private company's cap table and a public company's shareholder file are the same structure at different scales: holders, share classes, quantities, certificates or book entries, restrictions and the history of every change. Tokenizing it moves the holder balances on chain and leaves the rest where it was.

- **Classes are tokens.** Each class or series is its own token contract and its own `instruments` row; a conversion (preferred to common) is a burn in one and a mint in the other, authorized by the issuer and recorded as one asset event.
- **Restrictions are compliance rules.** Lockups, holding periods and transfer restrictions on unregistered shares become rules the compliance contract enforces at transfer. A restrictive legend has a natural home here, and the SEC's 2026 proposal includes a restrictive legend rule (17ad-31) that would apply to agents however they keep the file.
- **Book entry and token coexist.** Superstate's issuers hold "book-entry holdings, tokenized holdings" in one registry; holders tokenize from book entry with an allowlisted address. The control book counts both.
- **Distributions follow the record date.** A dividend on a tokenized share is paid to holders at a record time read from the chain at a recorded block, which is the same snapshot problem as an airdrop ([Chain Events](/books/investing-and-digital-assets/corporate-actions#chain-events)).

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): a permissioned token is an `instruments` row with its `asset_networks`; holders are `parties`; wallets are `addresses`. This chapter adds the holder registry as the platform or agent keeps it, the transfer restrictions in force, and the forced transfers and recoveries with their authority.

```sql
CREATE TABLE holder_registry (               -- who holds a permissioned security, by wallet
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  party_id            UUID NOT NULL REFERENCES parties (id),
  address_id          UUID REFERENCES addresses (id),     -- null for a book-entry holding
  asset_network_id    UUID REFERENCES asset_networks (id),
  holding_form        TEXT NOT NULL CHECK (holding_form IN ('book_entry', 'onchain')),
  identity_ref        TEXT,                  -- the ONCHAINID or registry identity
  country             CHAR(2),               -- ISO-3166, as registered
  claims              JSONB NOT NULL,        -- topics held and their issuers
  status              TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'frozen',
                        'removed')),
  valid_during        TSTZRANGE NOT NULL,
  CHECK ((holding_form = 'onchain') = (address_id IS NOT NULL))
);

CREATE TABLE transfer_restrictions (         -- the compliance rules in force, versioned
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  kind                TEXT NOT NULL CHECK (kind IN ('allowed_countries', 'holder_cap',
                        'per_holder_cap', 'lockup', 'accreditation', 'legend')),
  params              JSONB NOT NULL,        -- countries, caps, lockup end, legend text
  enforced_onchain    BOOLEAN NOT NULL,      -- in the compliance contract, or checked off chain
  module_address      TEXT,
  valid_during        TSTZRANGE NOT NULL
);

CREATE TABLE forced_transfers (              -- every agent override, with its authority
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  kind                TEXT NOT NULL CHECK (kind IN ('court_order', 'estate', 'regulatory',
                        'error_correction', 'recovery', 'freeze', 'unfreeze')),
  from_holder_id      UUID REFERENCES holder_registry (id),
  to_holder_id        UUID REFERENCES holder_registry (id),
  quantity            NUMERIC(78, 0),
  authority_ref       TEXT NOT NULL,         -- the order, letters, request number
  authority_doc_uri   TEXT NOT NULL,         -- the document as received, in the records store
  status              TEXT NOT NULL CHECK (status IN ('received', 'reviewed', 'approved',
                        'executed', 'posted', 'rejected')),
  checks              JSONB NOT NULL,        -- recipient verified, caps checked off chain, shortfall
  approved_by         UUID[] NOT NULL DEFAULT '{}',       -- quorum of named approvers
  onchain_tx_ids      UUID[] NOT NULL DEFAULT '{}',       -- unfreeze, transfer, registry writes
  posted_at           TIMESTAMPTZ,           -- master securityholder file posting
  posting_due_on      DATE                   -- the Rule 17Ad-10 clock
);
```

An agent override moves through review and approval before it signs, and through posting to the master file after:

![A state machine for an agent override such as a forced transfer. Received leads to reviewed, then approved, then executed on chain, then posted to the master securityholder file, a terminal state; that path is accented. Dashed exits lead from reviewed to rejected, labeled no authority or recipient unverified, and from approved to rejected, labeled quorum withdrawn. A dashed edge from executed back to approved is labeled reverted: re-sign. Terminal states have double outlines.](/diagrams/ida-forced-transfer-states.svg "Every agent override carries its authority, a quorum approval and a posting to the master securityholder file; the on-chain call is one step in the middle, not the record.")

Design notes:

- **Every override has an authority row** before any key signs: the order or request, as received, and named approvers by quorum, through the same policy engine that guards withdrawals ([Policy Engines and Quorum Approvals](/books/investing-and-digital-assets/keys-and-signing#policy-engines-and-quorum-approvals)).
- **Compute the shortfall, don't trust the contract.** Free balance, frozen balance and the order's quantity are checked off chain first, with the exact unfreeze recorded.
- **Check what the contract skips.** A forced transfer bypasses compliance, so caps and country rules are checked against `transfer_restrictions` before signing.
- **Post to the file on a clock.** `posting_due_on` holds the Rule 17Ad-10 deadline; an executed override that hasn't been posted is an alert.
- **Index the agent events** (`TokensFrozen`, `AddressFrozen`, `RecoverySuccess`, `Paused`) on every permissioned token the platform holds, and open a case for any that touches its addresses ([Chain Data & Indexing](/books/investing-and-digital-assets/chain-data-and-indexing)).

## Auditing

A transfer agent's records are examined, and a tokenized one adds a chain to examine them against. Keep:

- **The master securityholder file and control book** with every posting, its source (a chain transaction, an instruction, a correction) and its timing against the rules' clocks.
- **Every agent override** with its authority, approvals, checks, transactions and posting.
- **Every identity registry change:** who was added, verified, frozen or removed, by whom and why.
- **Daily reconciliation** of supply on each chain plus book entry against the control book, and of the platform's ledger against the issuer's record.
- **Agent key inventory:** which keys hold agent and owner roles on each token, and every change to them.

## What This Means for the System You Build

- **Decide which record governs** from the issuer's documents, and reconcile against that record first.
- **Identity off chain, verdict on chain:** keep the onboarding data and claims in your systems, and treat the registry as the verdict you publish.
- **Treat agent powers as custody-grade operations:** authority documents, quorum approvals and a runbook for each override.
- **Check what a forced transfer bypasses** and unfreeze exactly the shortfall.
- **Recovery is an ownership non-event** recorded as one; make it possible, verified and slow enough to be safe.
- **Book entry and token sum to the control book,** across every chain.
- **Watch every permissioned token you hold** for agent events, and disclose the agent's powers to customers.

## References

**Law and regulation**

- [15 U.S.C. 78q-1: National system for clearance and settlement (Exchange Act §17A)](https://www.law.cornell.edu/uscode/text/15/78q-1), registration of transfer agents under §17A(c)(1)
- [17 CFR 240.17Ad-2: Turnaround, processing, and forwarding of items](https://www.law.cornell.edu/cfr/text/17/240.17Ad-2), 90 percent of routine items within three business days
- [17 CFR 240.17Ad-10: Prompt posting of certificate detail to master securityholder files, maintenance of accurate securityholder files, communications between co-transfer agents and recordkeeping transfer agents, maintenance of current control book, retention of certificate detail](https://www.law.cornell.edu/cfr/text/17/240.17Ad-10), posting debits and credits, the five-business-day period, record differences, the control book and six-year retention

**Regulators and guidance**

- [SEC: Transfer Agent Rules, proposed (Rel. 34-106246, 91 FR 56946, September 4, 2026)](https://www.federalregister.gov/documents/full_text/text/2026/09/04/2026-18190.txt), modernization, proposed Rules 17ad-30 and 17ad-31, amendments to recordkeeping and safeguarding, rescission of 17ad-4, Forms TA-1 and TA-2, onchain transfer agents and distributed ledger risks
- [Federal Register: Transfer Agent Rules (document 2026-18190)](https://www.federalregister.gov/api/v1/documents/2026-18190.json), the citation, file number and November 3, 2026 comment deadline

**Filings**

- [Franklin Templeton Trust: Form 485BPOS (July 27, 2026)](https://www.sec.gov/Archives/edgar/data/1786958/000165558926000970/c485bpos.htm), the transfer agent's official record via a blockchain-integrated system, hosted and investor-managed wallets, corrections by later instruction and lost keys

**Standards and protocols**

- [ERC-3643: T-REX, Token for Regulated EXchanges](https://eips.ethereum.org/EIPS/eip-3643), the identity registry and storage, claim topics and trusted issuers, compliance, transfer conditions, freezes, forced transfers, recovery, agents, batch functions and events
- [Securitize: DS Token interfaces](https://github.com/securitize-io/DSTokenInterfaces), the DS Token, Trust, Registry and Compliance services

**Vendor documentation**

- [Securitize: BUIDL](https://securitize.io/blackrock/buidl), the transfer agent's redemption window and whitelisted transfers
- [Superstate: Opening Bell](https://docs.superstate.com/issuers/opening-bell.md), the digital transfer agent registry across book-entry and tokenized holdings, allowlisted addresses and protocol allowlisting
- [DTCC: Tokenization Service](https://www.dtcc.com/products-and-services/digital-assets/tokenization), tokens backed 1:1 by securities held at DTC and transfers between DTC-registered wallets
