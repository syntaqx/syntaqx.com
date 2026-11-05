+++
title = "Smart Contract Risk & Exploits"
nav_title = "Smart Contract Risk"
description = "Audits and their limits, formal verification, bug bounties, upgrades and admin keys, governance attacks, exploits by class, incident response, recoveries."
category = "Investing & Digital Assets Industry"
order = 2565
part = "Decentralized Finance"
tags = ["defi", "smart-contracts", "security", "exploits", "audits", "incident-response"]
+++

A smart contract holds money and runs code that anyone can call, and the code is the only control. There's no fraud team between a caller and the vault, no transaction limit nobody wrote down, no way to reverse a transfer once it is final. If the code lets a caller withdraw more than they deposited, the caller is not breaking in; the contract is doing what it says. Every DeFi protocol, every token a platform lists and every bridge a platform uses is a bet that its code says what its authors meant, that nobody can change it to say something else, and that the governance able to change it can't be captured.

That bet loses often enough to have its own leaderboard. rekt.news, which tracks losses, lists Euler Finance at $197 million (March 2023), Beanstalk at $181 million (April 2022) and Compound at $147 million (September 2021) among its top 25, next to bridge failures like Ronin, Poly Network, Wormhole and Nomad, and exchange hacks like Bybit. Most of the DeFi entries had audits; several had more than one.

This chapter covers audits and what they can't promise, formal verification, bug bounties and contests, upgradeability and admin keys, governance attacks and timelocks, exploit post-mortems grouped by class, and incident response, including white-hat recoveries and the Safe Harbor framework. It adds contract audits, contract risk reviews and exploit incidents to [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business. Bridge hacks in depth are [The Bridge Hacks](/books/investing-and-digital-assets/layer-2s-and-bridges#the-bridge-hacks); exchange hacks and key compromise are [Exchange Security & Hacks](/books/investing-and-digital-assets/exchange-security) and [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing#bybit-february-21-2025); oracle manipulation is [Oracles & MEV](/books/investing-and-digital-assets/oracles-and-mev#oracle-manipulation); generic secure development and vulnerability handling are the playbook's [Threat Modeling](/docs/security/threat-modeling) and [Vulnerability Management](/docs/security/vulnerability-management).

## How the Industry Does It

The layers of assurance a protocol can show, and what they look like in public, as of November 2026:

| Layer | What it is | Public example | What it doesn't cover |
| --- | --- | --- | --- |
| **Audits** | Paid manual review of a code version by a security firm | Aave's v3 origin repository lists reports from Certora, OpenZeppelin, Trail of Bits, Sigma Prime, MixBytes, Sherlock, Cantina and others; v3.7 alone had six reviews in March 2026 | Code outside the scope, later versions, integrations, economic attacks |
| **Formal verification** | Machine-checked proofs that code satisfies written properties | Fourteen Certora reports in Aave's audit folder, from the January 2022 V3 review to March 2026 | Properties nobody wrote; the spec being wrong |
| **Contests** | Time-boxed public competitions paying for findings | Cantina and Sherlock contests in the same folder | Depth on any one issue; findings after the contest |
| **Bug bounties** | Standing rewards for disclosed vulnerabilities | Immunefi says it has paid "$140M+"; it describes Wormhole's $10 million payout as "a record bug bounty" | Attackers who prefer the whole balance to a share |
| **Safe Harbor** | Pre-authorization for white hats to rescue funds during an exploit | SEAL's agreement: bounties "set at 10% of recovered assets (capped at $1M)," funds "returned within 72 hours" | Exploits nobody friendly sees first |
| **Timelocks and governance** | Delays between a decision and its execution | Compound: voting lasts three days and a passed proposal "can be implemented 2 days later" | A malicious proposal nobody reads in time |

No row is sufficient. The protocols that have lost the most money mostly had the first row; the record argues for all of them, plus the ability to stop.

## The Loss Record

rekt.news's leaderboard, as shown on November 5, 2026, mixes DeFi exploits with exchange hacks and frauds, so it is a record of where money left, not of smart contract bugs alone. The DeFi and bridge-contract entries in its top 25 (leaving out the Ronin and BNB Bridge hacks; Ronin is in [The Bridge Hacks](/books/investing-and-digital-assets/layer-2s-and-bridges#the-bridge-hacks)), with the cause by class:

| Rank | Protocol | Loss (rekt.news) | Date | Class |
| --- | --- | --- | --- | --- |
| 4 | Poly Network | $611 million | Aug 10, 2021 | Cross-chain access control |
| 8 | Wormhole | $326 million | Feb 2, 2022 | Signature verification |
| 11 | KelpDAO | $290 million | Apr 18, 2026 | Cross-chain verification: a forged message accepted by a single required verifier |
| 12 | Drift Protocol | $285 million | Apr 1, 2026 | Admin key compromise: multisig signers socially engineered into pre-signing |
| 14 | Cetus (Sui) | $223 million | May 22, 2025 | Arithmetic overflow check |
| 17 | Euler Finance | $197 million | Mar 13, 2023 | Missing health check |
| 19 | Nomad | $190 million | Aug 1, 2022 | Bad upgrade |
| 20 | Beanstalk | $181 million | Apr 17, 2022 | Governance attack |
| 22 | Compound | $147 million | Sep 29, 2021 | Faulty upgrade through governance |

Further down the same list: Balancer V2 at $128 million (November 3, 2025, rounding), Curve pools through a Vyper compiler bug at $69.3 million (July 30, 2023, reentrancy) and KyberSwap at $48 million (November 22, 2023, rounding). The classes recur, which is the useful part: a review that asks the class questions catches more than one that reads code line by line without them.

## Audits and Their Limits

An audit is a time-limited review of a specific commit by people paid by the team being reviewed. It finds bugs, often serious ones, and its report is evidence that someone competent looked. What it is not:

- **Not a guarantee about later code.** The audit covers a commit; an upgrade, a new market, a parameter change or a new integration is outside it. Compound's 2021 loss came from an upgrade (see [Exploit Post-Mortems by Class](#exploit-post-mortems-by-class)).
- **Not about everything around the code.** Oracles, governance, the economics of a collateral listing, the token contracts the protocol accepts and the front end users sign through are usually out of scope.
- **Not a count.** Euler had been reviewed by six auditors; rekt.news reports that Sherlock, whose review had covered the change containing the bug, paid a $4.5 million claim for missing it.

My reading rule for a platform's review: read the scope section first (which commit, which contracts, which assumptions), then the unresolved findings, then whether the deployed bytecode matches the audited commit. An audit of code that isn't what's deployed is a document about something else.

## Formal Verification

Formal verification proves that code satisfies properties written in a specification language: "total debt never exceeds total supply plus reserves," "a user's health factor can't fall below one through their own deposit," "only the timelock can call this function." A prover checks every possible execution, not a sample. Aave's audit folder holds fourteen Certora reports across its V3 versions, which is what continuous verification looks like in practice: the properties are maintained alongside the code and rechecked on every release.

Its limit is the specification. A property nobody thought to write is a property nobody proved. Euler's bug was exactly that kind: the protocol's own invariant was that users can't make themselves unhealthy, and the new `donateToReserves` function "lacked a health check to make sure that an existing user wouldn't be able to put themselves in an unhealthy state." A specification that stated that invariant over every function would have caught it; a specification of the functions that existed before the change wouldn't.

## Bug Bounties and Contests

A bounty pays for a disclosed bug instead of a stolen balance, so its size has to compete with what the bug could steal. Immunefi, the largest platform, claims "$140M+" paid across "650+" protocols, and describes Wormhole's $10 million payout in 2022 for an uninitialized implementation contract as "a record bug bounty." Contests (Sherlock and Cantina among them) run for days or weeks before a launch and pay many researchers for findings, which adds breadth that a single audit team lacks.

For a platform reviewing a protocol: a bounty program with a maximum payout that is a small fraction of the protocol's deposits is a signal about how seriously the team prices its own risk, and a protocol with no bounty is relying entirely on attackers' restraint.

## Upgradeability and Admin Keys

Most protocols can change their code. A proxy holds the storage and delegates calls to an implementation that an admin can replace ([Upgradeable Proxies and Admin Keys](/books/investing-and-digital-assets/tokens-and-standards#upgradeable-proxies-and-admin-keys)). OpenZeppelin, whose proxy contracts most protocols use, documents two patterns and a warning: transparent proxies "include the upgrade and admin logic in the proxy itself," UUPS proxies put it in the implementation, where it "can eventually be removed," and "Using upgradeable proxies correctly and securely is a difficult task." Mixing them can "allow non-admins to perform upgrade operations."

Upgradeability is a trade: it lets a team fix a bug in hours and lets whoever holds the admin key change the rules in hours. What a platform records for every contract it relies on:

- **Who can upgrade:** an EOA, a multisig (with its threshold and signers), a timelock, a governance contract, or nobody (immutable).
- **How fast:** the minimum delay between scheduling an upgrade and executing it, and whether an emergency path bypasses it.
- **Who can pause:** guardians that can stop a contract without a vote, which is an incident-response tool and a centralization fact at once.
- **What changed:** every `Upgraded` event on a contract the platform uses is reviewed before the platform keeps routing to it.

Nomad is the case for the last point: an upgrade set its trusted root to a value that made every message look proven ([The Bridge Hacks](/books/investing-and-digital-assets/layer-2s-and-bridges#the-bridge-hacks)). An upgrade is a new deployment, and it needs the review a new deployment gets.

## Governance and Timelocks

On-chain governance turns token holdings into authority over the protocol's code and parameters. Compound's documents the usual shape: an address needs delegated COMP above a proposal threshold (the docs' example is 25,000 COMP) to propose, a proposal then "enters a 2 day review period," "Voting lasts for 3 days," a proposal needs at least 400,000 votes in favor, and a passed proposal "can be implemented 2 days later" through a timelock whose "hard-coded minimum delay ... is the least amount of notice possible for a governance action." OpenZeppelin's `TimelockController` is the common building block: it is "in charge of introducing a delay between a proposal and its execution," with proposers who schedule and cancel and executors who run operations "once the timelock expires."

### Worked numbers: the notice a timelock gives

Under Compound's published rules, a proposal that passes gives anyone watching a 2-day review period, 3 days of voting and 2 days of timelock, seven days from submission to the earliest execution, to read what it does. A platform whose customers hold positions in the protocol has that window to:

| Day | What the platform can do |
| --- | --- |
| 0 to 2 (review period) | Decode the proposal's calls; flag parameter changes affecting customers' positions; flag code changes for review |
| 2 to 5 (voting) | Review new implementation code against its audit; warn customers whose health factors the change would cut |
| 5 to 7 (queued) | Decide to keep or stop routing; publish the decision |
| 7 (executable) | Re-read the executed calls against the queued ones |

The window only helps if someone uses it. Compound's September 2021 loss passed through this process: per rekt.news, an upgraded rewards contract from Proposal 62 wrongly distributed about $80 million of excess COMP, and a fix needed a new proposal (Proposal 64) and a new delay before it could execute, so the same timelock that protects against bad proposals also slows the fix.

### Governance attacks

Votes can be bought, and in DeFi they can be borrowed. Beanstalk's governance had an emergency path (`emergencyCommit`) that could execute a proposal without the usual wait; per rekt.news, an attacker used a flash loan to borrow enough voting power within one transaction, passed a malicious proposal and executed it, taking $181 million, of which the attacker kept $76 million: "a governance attack made possible through the use of flash loans." The defenses are design rules: voting power measured at a past block, not the current one; no execution without a delay longer than any loan; quorums and thresholds that make buying control expensive; and a guardian able to cancel a queued proposal that is obviously malicious.

## Exploit Post-Mortems by Class

| Class | Case | What broke | Design lesson |
| --- | --- | --- | --- |
| **Reentrancy** | The DAO, 2016 | Per ethereum.org, "an insecure contract was drained of over 3.6 million ETH"; Ethereum hard-forked at block 1,920,000 on July 20, 2016 to move the funds to a contract with a single `withdraw` function | Update state before external calls; the chain's social layer is the last resort, and it was used once |
| **Reentrancy (compiler)** | Curve pools, Jul 30, 2023 | Vyper acknowledged "a bug affecting Vyper versions 0.2.15, 0.2.16, and 0.3.0," which LlamaRisk's post-mortem describes as "a malfunctioning reentrancy lock"; four pools were drained | The compiler is part of the code under review; pin and audit toolchain versions |
| **Missing check** | Euler Finance, Mar 13, 2023 | `donateToReserves` let a user make their own position unhealthy, then self-liquidate for the bonus; about $197 million taken | Every new function must preserve every invariant, checked across functions |
| **Rounding** | KyberSwap Elastic, Nov 22, 2023 | A "double rounding error" left liquidity "unrecalculated ... upon crossing a tick"; about $55.2 million taken, $48.7 million by the exploiter and $6.6 million by bots copying it | Round in the protocol's favor everywhere, and test boundary amounts at every tick crossing |
| **Rounding** | Balancer V2, Nov 3, 2025 | Per rekt.news, a scaling function that always rounded down, combined with deferred settlement in batch swaps, repeated over dozens of tiny swaps; about $128 million | Small errors compound when an attacker controls the loop count |
| **Arithmetic** | Cetus (Sui), May 22, 2025 | Per rekt.news, an overflow check in a math library's shift function was wrong; $223 million taken and $162 million frozen by Sui validators | Hand-written math libraries need the same review as the protocol |
| **Faulty upgrade** | Compound, Sep 29, 2021 | Proposal 62's updated rewards contract misdistributed about $80 million of COMP | Upgrades through governance need tests of the distribution, not only the code |
| **Governance** | Beanstalk, Apr 17, 2022 | Flash-loaned votes passed and executed a malicious proposal in one transaction | Snapshot voting power in the past; delay every execution |
| **Cross-chain access** | Poly Network, Aug 10, 2021 | Per rekt.news, the cross-chain manager could be made to call the contract holding the keepers' keys and replace them; $611 million | A contract that executes arbitrary messages must not be able to call its own trust root |
| **Oracle** | Mango Markets, Oct 2022 | A thin token's price was pushed up 13-fold and borrowed against | [Oracle Manipulation](/books/investing-and-digital-assets/oracles-and-mev#oracle-manipulation) |
| **Key compromise** | Ronin, Mar 2022; Bybit, Feb 2025 | Validator or signer keys, not contract code | [The Bridge Hacks](/books/investing-and-digital-assets/layer-2s-and-bridges#the-bridge-hacks); [Bybit](/books/investing-and-digital-assets/keys-and-signing#bybit-february-21-2025) |

A platform's review of a protocol asks each row's question of it: where does it call out before updating state, which compiler and libraries does it trust, which invariants hold across every function, which way does it round, who can upgrade it and how fast, how is voting power measured, what can its message-passing contracts call, what prices does it trust, and who holds which keys.

## Incident Response and White-Hat Recoveries

When a protocol is being drained, minutes matter, and the actors are the team, white hats, validators, issuers and exchanges.

- **Pause.** A guardian or pauser role stops deposits, borrows or the whole protocol. It is the most valuable control in an incident and the one that makes a protocol least decentralized; most large protocols keep one.
- **Rescue.** SEAL's Safe Harbor is "an on-chain agreement that protocols adopt to pre-authorize whitehat interventions during active exploits": a white hat who front-runs the attacker and moves funds to the protocol's designated recovery address keeps a bounty "set at 10% of recovered assets (capped at $1M)" and must return the rest "within 72 hours." SEAL lists 33 adopting protocols. Without it, a white hat who takes funds to protect them has done something that looks exactly like theft.
- **Negotiate.** Teams offer the attacker a bounty and immunity from civil claims in exchange for returning funds, by on-chain message. Euler's exploiter began returning funds five days later and returned the rest by April 3, 2023; Euler reports "100% of the stolen funds were recovered."
- **Freeze at the edges.** Stablecoin issuers can freeze stolen USDC or USDT ([Seizure, Burn and Reissue](/books/investing-and-digital-assets/freezes-and-onchain-compliance#seizure-burn-and-reissue) in Freezes, Blacklists & Seizures); validators of a small chain can act, as Sui's froze $162 million after Cetus and, per rekt.news, Berachain rolled back by hard fork after Balancer's exploit; exchanges freeze deposits traced to the attacker ([On-Chain Analytics & Investigations](/books/investing-and-digital-assets/blockchain-analytics)).
- **Compensate.** KyberSwap paid affected users from its treasury through a grant program for unrecovered funds: one option paid 60%, the other 100% over 12 months, and KyberSwap reported "grants covering 100% of the affected funds" distributed to applicants.

For a platform, the exploit is an incident in its own systems even though the code isn't its own. Its playbook when a protocol or token it supports is exploited:

1. **Stop exposure:** pause routing to the protocol, deposits of its tokens and acceptance of them as collateral; for a token whose backing is in question, pause trading.
2. **Screen inflows:** flag deposits from addresses linked to the exploit, and freeze where law and terms allow; stolen funds look for exchanges.
3. **Tell customers what they hold:** positions in the protocol, their current state, and what the platform can and can't do about them.
4. **Record the incident:** what was exposed, what the platform did and when, and the protocol's later post-mortem and any recovery.

## How to Build It

The core `asset_networks` table names every contract the platform touches as a token, and `cases` holds the clocks it answers to ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)); token powers and admin changes are already in [Tokens & Token Standards](/books/investing-and-digital-assets/tokens-and-standards#how-to-build-it) (`token_contracts`, `token_admin_changes`). This chapter adds the audits the platform relied on, its own risk review of each protocol contract it routes to or lists, and the incidents.

```sql
CREATE TABLE contract_audits (               -- a report the platform read, tied to code it covers
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  chain_id            UUID NOT NULL REFERENCES chains (id),
  contract_address    TEXT NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('audit', 'formal_verification', 'contest',
                        'internal_review')),
  firm                TEXT NOT NULL,
  report_url          TEXT NOT NULL,
  report_sha256       BYTEA NOT NULL,         -- the copy the platform reviewed
  commit_reviewed     TEXT NOT NULL,
  deployed_code_hash  BYTEA,                  -- keccak of the runtime bytecode checked against it
  matches_deployed    BOOLEAN,                -- null until the platform has compared
  unresolved_findings INT NOT NULL DEFAULT 0,
  report_date         DATE NOT NULL
);

CREATE TABLE contract_risk_reviews (         -- the platform's decision about one contract version
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  chain_id            UUID NOT NULL REFERENCES chains (id),
  contract_address    TEXT NOT NULL,
  code_hash           BYTEA NOT NULL,         -- the implementation reviewed, for proxies
  role                TEXT NOT NULL CHECK (role IN ('token', 'dex_pool', 'v4_hook', 'router',
                        'lending_market', 'bridge', 'oracle', 'staking', 'other')),
  upgrade_control     TEXT NOT NULL CHECK (upgrade_control IN ('immutable', 'eoa', 'multisig',
                        'timelock', 'governance')),
  upgrade_delay       INTERVAL,               -- minimum notice before code can change
  multisig_threshold  TEXT,                   -- '4 of 7'
  pause_roles         TEXT[] NOT NULL DEFAULT '{}',
  bounty_max_usd      NUMERIC(20, 2),
  class_checks        JSONB NOT NULL,         -- reentrancy, rounding, invariants, oracle, governance, ...
  audit_ids           UUID[] NOT NULL DEFAULT '{}',
  decision            TEXT NOT NULL CHECK (decision IN ('approved', 'approved_with_limits',
                        'rejected', 'expired')),
  exposure_limit_usd  NUMERIC(20, 2),         -- routing or treasury cap while approved
  reviewed_by         UUID NOT NULL,
  decided_at          TIMESTAMPTZ NOT NULL,
  expires_at          TIMESTAMPTZ NOT NULL,   -- re-review on schedule even without changes
  UNIQUE (chain_id, contract_address, code_hash)
);

CREATE TABLE exploit_incidents (             -- a protocol or token the platform relies on, exploited
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  detected_at         TIMESTAMPTZ NOT NULL,
  chain_id            UUID NOT NULL REFERENCES chains (id),
  contracts           TEXT[] NOT NULL,
  class               TEXT NOT NULL CHECK (class IN ('reentrancy', 'missing_check', 'rounding',
                        'arithmetic', 'access_control', 'upgrade', 'governance', 'oracle',
                        'key_compromise', 'unknown')),
  attacker_addresses  TEXT[] NOT NULL DEFAULT '{}',
  platform_exposure   JSONB NOT NULL,         -- customer positions, treasury, listed tokens, routes
  actions             JSONB NOT NULL,         -- paused routes, paused deposits, freezes, with times
  case_id             UUID REFERENCES cases (id),  -- regulatory or customer clock it opened
  post_mortem_url     TEXT,
  recovered_pct       NUMERIC(5, 2),
  closed_at           TIMESTAMPTZ
);
```

Notes on the sketch:

- **Reviews pin code, not addresses.** A proxy's address stays the same across upgrades; the review is keyed by the implementation's code hash, and an `Upgraded` event on a reviewed proxy changes the hash and leaves the contract unreviewed until someone approves the new one. Routing and listing check for an approved review of the current hash.
- **Audits are tied to bytecode.** `matches_deployed` is the check most reviews skip: compile the audited commit and compare with what is on chain.
- **Approval is bounded and expires.** An exposure limit caps how much customer flow or treasury the platform puts through one contract, and a review that isn't renewed expires.
- **Incidents link to everything they touched:** the routes and pools paused ([DEXs & AMMs](/books/investing-and-digital-assets/dexs-and-amms#how-to-build-it)), the lending markets ([DeFi Lending & Liquidations](/books/investing-and-digital-assets/defi-lending#how-to-build-it)) and the customer positions, so the post-incident report is a query.
- **Events:** `contract_risk_review.expired`, `contract.upgraded_unreviewed` and `exploit_incident.opened` go through the [outbox](/docs/architecture/events#the-transactional-outbox) and page the on-call owner.

## Auditing

- **Every contract the platform routes to, lists or holds treasury in,** with its current review, code hash, upgrade control and expiry.
- **Every audit relied on,** with the commit and whether it matches deployed code.
- **Upgrade and governance monitoring:** proposals and upgrades seen, reviewed and acted on, with times.
- **Every exploit incident,** the platform's exposure, its actions with timestamps, customer communications and the recovery.

## What This Means for the System You Build

- **Treat every external contract as a vendor with root access** to the funds that pass through it: review, limit and re-review.
- **Read audit scope and compare audited code with deployed bytecode;** an audit is about a commit, not a protocol.
- **Record who can upgrade and pause, and how fast,** and treat an unannounced upgrade as an incident.
- **Use the timelock window:** decode every queued proposal for protocols customers use and act before it executes.
- **Ask the class questions** (reentrancy, invariants, rounding, arithmetic, access, upgrades, governance, oracles, keys) of every protocol, not only the code diff.
- **Have the exploit playbook ready:** pause exposure, screen inflows, tell customers, record everything.
- **Prefer protocols with Safe Harbor, real bounties and a pause path,** and say in disclosures that none of these makes a protocol safe.

## References

**Standards and protocols**

- [OpenZeppelin Contracts 5.x: Proxies](https://docs.openzeppelin.com/contracts/5.x/api/proxy), transparent and UUPS patterns and the difficulty of upgrading safely
- [OpenZeppelin Contracts 5.x: Governance](https://docs.openzeppelin.com/contracts/5.x/api/governance), `TimelockController`, proposers, executors and delays
- [Compound: Governance](https://docs.compound.xyz/v2/governance/), proposal threshold, the two-day review period, three-day voting, quorum and the two-day timelock
- [ethereum.org: History of Ethereum forks](https://ethereum.org/en/ethereum-forks/), the DAO fork at block 1,920,000 and the 3.6 million ETH drained
- [Aave v3 origin: audits](https://github.com/aave-dao/aave-v3-origin/tree/main/audits), audit and formal verification reports by firm and version

**Vendor documentation**

- [Immunefi](https://immunefi.com/), bounties paid and protocols covered (the company's figures)
- [Immunefi: Wormhole uninitialized proxy bugfix review](https://immunefi.com/blog/bug-fix-reviews/wormhole-uninitialized-proxy-bugfix-review/), the $10 million bounty
- [Security Alliance: Safe Harbor](https://securityalliance.org/safe-harbor), pre-authorized rescues, the 10% bounty capped at $1 million, 72-hour return and adopters

**In practice**

- [rekt.news: Leaderboard](https://rekt.news/leaderboard), losses by incident, as shown on November 5, 2026
- [Euler Finance: Behind the scenes of Euler's $240M exploit recovery](https://www.euler.finance/blog/war-peace-behind-the-scenes-of-eulers-240m-exploit-recovery), the missing health check, the self-liquidation, the return timeline and full recovery
- [rekt.news: Euler Finance](https://rekt.news/euler-rekt), the six auditors and Sherlock's $4.5 million claim
- [KyberSwap: Elastic exploit post-mortem](https://blog.kyberswap.com/post-mortem-kyberswap-elastic-exploit/), the double rounding error, amounts by exploiter and bots, and 100% grants
- [LlamaRisk: Curve and Vyper exploit post-mortem](https://hackmd.io/@LlamaRisk/BJzSKHNjn), affected Vyper versions, the malfunctioning reentrancy lock and the pools hit
- [rekt.news: Beanstalk](https://rekt.news/beanstalk-rekt), the flash-loan governance attack, $181 million taken and $76 million kept
- [rekt.news: Compound](https://rekt.news/compound-rekt), Proposal 62's distribution bug and the Proposal 64 fix
- [rekt.news: Balancer Rekt II](https://rekt.news/balancer-rekt2), the rounding exploit of November 3, 2025, the Berachain rollback and recoveries
- [rekt.news: Cetus](https://rekt.news/cetus-rekt), the overflow check and $162 million frozen by Sui validators
- [rekt.news: KelpDAO](https://rekt.news/kelpdao-rekt), the forged cross-chain packet and the 1-of-1 verifier configuration
- [rekt.news: Drift Protocol](https://rekt.news/drift-protocol-rekt), the pre-signed transactions and the admin takeover
- [rekt.news: Poly Network](https://rekt.news/polynetwork-rekt), the cross-chain manager calling the keeper contract
