+++
title = "Custody Platforms & Policy Engines"
nav_title = "Custody Platforms"
description = "Institutional custody platforms: custodian versus key software, segregated and omnibus, quorum policies, off-exchange settlement, sub-custody, APIs and fees."
category = "Investing & Digital Assets Industry"
order = 2553
part = "Institutional Crypto"
tags = ["crypto", "custody", "policy-engine", "off-exchange-settlement", "sub-custody", "institutional"]
+++

An institutional custody platform is three products sold as one: a regulated custodian that holds assets for clients, a key and signing system that decides which transactions get signed, and a network that lets those assets settle trades without leaving custody. Some vendors sell all three under a trust charter (Anchorage, BitGo, Coinbase Prime, Fidelity Digital Assets); some sell the software and leave custody with the client (Fireblocks, BitGo's self-custody wallets); some sit in between, with custody in one entity and a settlement network on top (Copper). A fund, an exchange, a bank or a corporate treasury picks among them by asking who holds the keys, who can approve a withdrawal, where the coins sit while they're being traded, and who is liable when something goes wrong.

The engineering is governance as data. Every client has an organization tree of users, roles and approvers; every wallet has a policy saying which transactions need whose approval; every movement, including a trade settling against an exchange, passes that policy; and the custodian's ledger must say at every moment which client's assets are in which wallet and which are pledged to a counterparty. This chapter surveys the platforms, separates custodians from key software, compares segregated and omnibus models, covers governance and quorum policies, off-exchange settlement, sub-custody, client portals and APIs, and custody fees with a worked month. It extends `wallets` and Keys, Signing & Key Management's `signing_policies` with `custody_clients`, `approval_quorums`, `off_exchange_settlements` and `sub_custodians`. Which entity qualifies as a custodian is [Qualified Custody](/books/investing-and-digital-assets/qualified-custody); the cryptography of MPC, multisig and HSMs is [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing); wallet tiers are [Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets).

## How the Platforms Do It

What the platforms say publicly, as of November 2026:

| Platform | Who holds the keys | Account model | Approvals and policy | Settlement without leaving custody |
| --- | --- | --- | --- | --- |
| **Anchorage Digital** | The national trust bank, in "HSM-secured cold storage" | Segregated custody, "bankruptcy-remote" | "Secure biometric approvals for global, 24/7 transaction authorization" | Staking and voting "directly from custody without assets leaving the platform"; an "Atlas settlement network" is named but not described on the custody page |
| **BitGo** | Custody wallets: BitGo creates all three keys, cold only; self-custody wallets: the client creates the user and backup keys | Custody wallets segregated; Go Accounts are "an omnibus custody wallet" for multi-asset trading and settlement | Custody withdrawals signed "after video ID verification with a BitGo Bank & Trust operator," with a 24-hour SLA; policies can waive video verification under client-set conditions | Go Network: "near-instantaneous settlement," client-to-client movements "generally free of charge" |
| **Coinbase Prime** | Coinbase Custody Trust Company, cold storage | Segregated vault plus an omnibus trading balance at Coinbase, Inc. (the ETF model) | Not detailed in the 10-K | Trading balance at the prime broker, swept to the vault daily; trade credit from Coinbase Credit |
| **Copper** | MPC-based custody | Not stated on the pages read | Not stated on the pages read | ClearLoop: "single net settlement" under "pre-agreed operating rules"; "$3bn" of monthly off-exchange settlements and "$105bn" of monthly notional trading supported by protected collateral |
| **Fidelity Digital Assets** | The national trust bank | Not stated on the pages read | Not stated on the pages read | Trades "without moving assets from cold storage"; collateral accounts |
| **Fireblocks** | The client's workspace; MPC-CMP key shares, the third held by an API co-signer (hot), a mobile device (warm) or an air-gapped device (cold) | Vault accounts, each "a unique on-chain wallet" in a BIP32 HD structure | Policies "set the limits and boundaries of the transactions"; an Admin Quorum approves sensitive workspace changes | Off Exchange, so a client can trade on an exchange "while avoiding the risk of a centralized malfunction" |
| **BNY** | The bank | Not stated on the page read | Not stated on the page read | Not stated |

Two shapes emerge. A **custodian platform** holds the keys in a chartered entity and gives the client approvals over what the custodian signs; the client never touches key material, and the custodian's liability and insurance stand behind it. A **key-management platform** gives the client the keys (or a share) and the policy engine, and the client is its own custodian, which suits an exchange running its own hot wallets and doesn't by itself satisfy a rule that requires a qualified custodian. Several vendors sell both, and the contract decides which a given wallet is.

## Custodian or Key Software

The distinction matters because the law follows it. The bank regulators' 2025 statement defines safekeeping as controlling the keys so that "no other party, including the customer," can move the asset alone; a platform where the client holds one of three MPC shares and the vendor two is a shared-control arrangement, and a platform where the client holds two of three is self-custody with vendor software. The SEC's October 2026 proposal calls an adviser holding "any portion" of a client crypto asset's key materials a self-custodian. So the first field in any custody record is who holds which key or share ([Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing#how-the-custodians-do-it) surveys the schemes):

| Arrangement | Keys | Who is custodian | Typical client |
| --- | --- | --- | --- |
| Qualified custody wallet | All keys or shares at the trust entity | The trust entity | Advisers, funds, ETPs, pensions |
| Co-managed (2-of-3 with one client key) | Client holds one; custodian two | Shared; the agreement decides | Trading firms wanting a veto |
| Self-custody with vendor co-signer | Client holds two; vendor one | The client | Exchanges, market makers, corporates |
| Pure self-custody software | Client holds all | The client | Exchanges running their own stack |

## Segregated and Omnibus

A custodian can hold each client's assets at its own addresses or pool them; both are lawful, and each costs something different:

- **Segregated** wallets prove ownership on chain: a client or its auditor can check the balance at its addresses. They cost a key set or derivation path per client, a sweep and fee per movement, and on account-model chains a gas balance per address. The joint statement notes separate accounts "could require the generation and management of a greater number of key pairs."
- **Omnibus** wallets are cheaper and faster to settle from, and are "larger targets for theft." Ownership exists only in the custodian's ledger, so NYDFS requires that an omnibus wallet hold "only virtual currency of customers" and that the beneficial interest records stay current and reconcilable to the chain.

Most institutional platforms use both: a segregated cold vault for what's held and an omnibus balance for what's being traded. The iShares Bitcoin Trust's 10-K is the clearest public description, with a segregated Vault Balance and an omnibus Trading Balance at the prime execution agent that "represents an entitlement to a pro rata share of the bitcoin (and cash) the Prime Execution Agent holds," swept back each trading day ([Two ledgers in one product](/books/investing-and-digital-assets/crypto-exchange-architecture#two-ledgers-in-one-product-the-etf-custody-model)). The engineering rule is that a client's balance is always the sum of its segregated holdings and its ledger share of each omnibus pool, and the omnibus pool's on-chain balance must equal the sum of all clients' shares plus nothing of the custodian's own.

## Governance and Quorum Policies

The policy engine is what an institutional client buys. Its rules live at three levels, and each level is versioned and quorum-approved:

- **Organization.** Users, roles (Fireblocks' range from "Owner" to read-only "Viewer"), approval groups, and the quorum needed to change any of it. Fireblocks' Admin Quorum is "the minimum number of workspace admins required to approve sensitive workspace changes," such as adding users or allowlisting addresses, so one compromised admin can't open a path.
- **Wallet or vault.** Allowlisted destinations, per-transaction and per-period limits, allowed assets and contract methods, time locks on new addresses.
- **Transaction.** Each request is evaluated against the policy version in force: allow, deny or require approvals from named groups. BitGo's custody wallets add a human step on the custodian's side, video identity verification before the custodian signs, which a client policy can waive "under specific conditions."

A worked policy, my own example for a fund's custody account:

```text
rule 1  any withdrawal to an address not on the allowlist          deny
rule 2  allowlist change                                           2 of {CIO, COO, CCO}, then 48 h delay
rule 3  withdrawal to allowlisted exchange deposit, ≤ $5,000,000   1 of {trader group} + 1 of {ops group}
rule 4  withdrawal to allowlisted address, > $5,000,000            rule 3 + 1 of {CIO, COO}
rule 5  rolling 24 h outflow > $25,000,000                          deny; requires a policy change
rule 6  policy change                                              3 of {CIO, COO, CCO, CFO}, then 72 h delay
```

The delays on rules 2 and 6 matter more than the quorums: an attacker who compromises enough approvers to add an address still waits 48 hours, during which every approver is notified and any one can cancel. Mechanically this is [Policy Engines and Quorum Approvals](/books/investing-and-digital-assets/keys-and-signing#policy-engines-and-quorum-approvals): the policy evaluates the decoded transaction, never a caller's description of it, explicit deny wins, and every signature records the policy version it passed. What the custody platform adds is the client side: the approvers are the client's people, approving on their own devices, and the custodian has to prove to the client's auditor that it signed nothing the client's policy didn't allow.

## Off-Exchange Settlement

After FTX, institutions stopped wanting to leave collateral on exchanges. Off-exchange settlement keeps the assets at a custodian and lets the exchange extend trading credit against them:

1. The client locks collateral in a custody account that neither the client nor the exchange can move alone.
2. The custodian reports the locked balance to the exchange, which credits the client's trading account with a mirrored balance.
3. The client trades on the exchange as usual; only the exchange's ledger changes.
4. At each settlement cycle, the net result moves between the client's locked account and the exchange's account at the same custodian, usually as a ledger transfer on the custodian's books, not an on-chain transaction.
5. If the exchange fails between cycles, the client's collateral is still at the custodian, less only what the last settlement owed.

Copper describes ClearLoop as "single net settlement" under "pre-agreed operating rules"; BitGo's Go Network moves assets between connected clients and platforms; Fireblocks' Off Exchange lets an exchange's users trade while "avoiding the risk of a centralized malfunction." The public pages I could read don't give settlement frequencies or dispute rules, which live in each network's operating rules. <!-- source-gap: off-exchange-settlement-terms | missing | settlement cycle frequency, dispute and exchange-default procedures for ClearLoop, Go Network and Fireblocks Off Exchange | closes with: the networks' published operating rules or rulebooks | checked: 2026-11-05 -->

A worked settlement cycle, my own numbers. A fund locks 100 BTC and 2,000,000 USDC with a custodian for exchange X. During the cycle it trades:

```text
trade   side   qty BTC   price      USDC
1       buy    10        90,000     −900,000
2       sell    4        91,500     +366,000
3       buy     2        89,800     −179,600
net            +8 BTC               −713,600 USDC

settlement (custodian ledger, one transfer each way)
  fund locked account    BTC   100 → 108       USDC 2,000,000 → 1,286,400
  exchange X account     BTC   −8              USDC +713,600
```

Three trades settle as two ledger transfers. If exchange X fails after trade 3 and before settlement, the fund still has 100 BTC and 2,000,000 USDC at the custodian, and its claim against X is only the unsettled +8 BTC it was owed against the 713,600 USDC it would have paid; on a centralized exchange it would have been an unsecured creditor for the whole balance. The exchange takes the opposite risk (a client whose mark-to-market loss exceeds its locked collateral between cycles), so it sizes credit as a fraction of locked collateral and settles more often in volatile markets.

## Sub-Custody

A custodian may hold some assets through another custodian: an asset it doesn't support, a jurisdiction where it has no entity, or a bank that wants crypto custody without building it. The regulators agree on the obligations, from different directions:

- **The OCC** lets national banks outsource custody to sub-custodians "subject to appropriate third-party risk management practices" (IL 1184).
- **The bank regulators' joint statement** keeps the bank "responsible for the activities performed by the sub-custodian," applies the same control standard to it, and asks the bank to analyze insolvency treatment and the sub-custodian's recordkeeping; commingling at the sub-custodian risks the assets "being treated as property of the sub-custodian."
- **NYDFS** requires prior approval, due diligence, a sub-custodian regulated by NYDFS or under a "substantially similar" regime, segregation from both firms' assets, F/B/O titling and no liens beyond customary fees.

For the ledger, sub-custody adds a location, not an owner. A client's 50 BTC held through a sub-custodian are still a client line in BTC; the wallet row names the sub-custodian, and the daily reconciliation compares the ledger with the sub-custodian's statement (and, where the addresses are known, with the chain) as its own `reconciliations` row.

## Client Portals and APIs

Institutional clients run custody through APIs as much as portals: create a wallet, generate a deposit address, request a withdrawal (which enters the approval flow), list transactions, download statements, and receive webhooks for deposits, approvals and broadcasts. Three API properties separate a platform an institution can build on from one it can't:

- **Idempotent requests.** Every withdrawal or transfer request carries a client key, and a retry returns the original request rather than creating another ([Idempotency](/docs/requests/idempotency)).
- **Approvals out of band.** An API key can request a withdrawal but never approve one above a policy threshold; approvals come from enrolled devices of named people. Fireblocks' API co-signer automates approvals only for the hot tier, by policy.
- **Statements as records.** Statements generated by the custodian and delivered to the client directly, because the custody rule requires custodian-sent statements and an auditor compares them with the adviser's books.

## Custody Fees

Custodians rarely publish fee schedules; BitGo's 10-K says it charges "recurring account and custody fees, as well as transaction fees for certain movements of assets," and Coinbase charges institutions "a separate fee based on the total assets stored in custody on our platform." The common structure is an annual rate in basis points on the value held, accrued daily and billed monthly. A worked month with an assumed 20 basis points a year, my own numbers:

```text
days  BTC held   BTC price   value held      daily fee (value × 0.0020 / 365)   for the days
1-10    500      90,000      45,000,000      246.58                               2,465.75
11-15   500      84,000      42,000,000      230.14                               1,150.68
16-30   650      86,000      55,900,000      306.30                               4,594.52
month                                                                              8,210.96

same fee from the average daily value: 49,950,000 × 0.0020 × 30 / 365 = 8,210.96
fee on the month-end value instead:    55,900,000 × 0.0020 × 30 / 365 = 9,189.04
```

Daily accrual on daily value and a monthly charge on the average daily value give the same number; a month-end snapshot overcharges this client by $978.08 because it deposited mid-month into a rising price. The choices the schedule must pin down: which price (the custodian's 4 pm mark, a benchmark rate, midnight UTC), which days (calendar days, since crypto doesn't close), what's billable (assets staked, pledged as off-exchange collateral, in transit), minimums, and whether the fee is charged in dollars or deducted in the asset. A fee deducted in kind is a withdrawal from the client's wallet, so it passes the policy engine and lands on the statement like any other movement. The fee as a revenue line is [Staking and Custody Fees](/books/investing-and-digital-assets/revenue-models#staking-and-custody-fees).

## How to Build It

`wallets` and `signing_policies` already exist; a custody platform adds the client organization, its quorums, its off-exchange locks and its sub-custodians:

```sql
CREATE TABLE custody_clients (             -- an institution with its own users and policies
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id              UUID NOT NULL REFERENCES parties (id),
  custodian_entity_id   UUID NOT NULL REFERENCES legal_entities (id),
  arrangement           TEXT NOT NULL CHECK (arrangement IN ('qualified_custody',
                          'co_managed', 'self_custody_cosigner', 'self_custody')),
  fee_schedule_id       UUID REFERENCES fee_schedules (id),
  status                TEXT NOT NULL CHECK (status IN ('onboarding', 'active',
                          'restricted', 'offboarding', 'closed'))
);

CREATE TABLE approval_quorums (            -- who must approve what; versioned with the policy
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  signing_policy_id     UUID NOT NULL REFERENCES signing_policies (id),
  applies_to            TEXT NOT NULL CHECK (applies_to IN ('withdrawal', 'allowlist_change',
                          'policy_change', 'user_change', 'staking', 'settlement')),
  min_usd_cents         BIGINT,            -- null: any amount
  approver_group        TEXT NOT NULL,     -- 'traders', 'ops', 'officers', ...
  required_approvals    SMALLINT NOT NULL CHECK (required_approvals > 0),
  delay                 INTERVAL NOT NULL DEFAULT '0',  -- time lock after the quorum is met
  UNIQUE (signing_policy_id, applies_to, min_usd_cents, approver_group)
);

CREATE TABLE off_exchange_settlements (    -- one cycle between a client lock and a venue
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  custody_client_id     UUID NOT NULL REFERENCES custody_clients (id),
  venue_id              UUID NOT NULL REFERENCES venues (id),
  lock_wallet_id        UUID NOT NULL REFERENCES wallets (id),
  cycle_ends_at         TIMESTAMPTZ NOT NULL,
  instructed_by_venue   JSONB NOT NULL,    -- net per instrument, as the venue reported it
  status                TEXT NOT NULL CHECK (status IN ('open', 'instructed', 'disputed',
                          'settled', 'defaulted')),
  journal_entry_id      UUID REFERENCES journal_entries (id),  -- the ledger transfer
  UNIQUE (custody_client_id, venue_id, cycle_ends_at)
);

CREATE TABLE sub_custodians (              -- where some client assets are held on our behalf
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  custodian_entity_id   UUID NOT NULL REFERENCES legal_entities (id),  -- us
  sub_custodian_entity_id UUID NOT NULL REFERENCES legal_entities (id),
  regulator_approval    JSONB,             -- NYDFS material-change approval, where required
  diligence_completed_at TIMESTAMPTZ NOT NULL,
  titling               TEXT NOT NULL CHECK (titling = 'fbo'),
  liens_allowed         TEXT NOT NULL CHECK (liens_allowed IN ('none', 'customary_fees')),
  next_review_at        DATE NOT NULL,
  status                TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'terminated'))
);

ALTER TABLE wallets ADD COLUMN sub_custodian_id UUID REFERENCES sub_custodians (id);
ALTER TABLE wallets ADD COLUMN custody_client_id UUID REFERENCES custody_clients (id);
```

A lock wallet is a `wallets` row with purpose `omnibus` or a segregated client wallet whose policy has one rule: no movement except a `settlement` instruction from the named venue, checked against the venue's signed report and the client's limits. The settlement journal entry has two pairs of lines per instrument (client lock to venue account and back), so the custodian's ledger shows every client's locked, unlocked and owed balances at once.

The policy check that turns quorums into a verdict, in the service that evaluates a request:

```go tab="Go"
type Quorum struct {
	Group    string
	Required int
	MinUSD   int64 // cents; 0 means any amount
}

// Satisfied reports whether approvals meet every quorum that applies to amount.
// approvals maps a group to the distinct approvers from it who signed this request.
func Satisfied(quorums []Quorum, amountUSD int64, approvals map[string]int) bool {
	for _, q := range quorums {
		if amountUSD >= q.MinUSD && approvals[q.Group] < q.Required {
			return false
		}
	}
	return true
}
```

```rust tab="Rust"
use std::collections::HashMap;

pub struct Quorum {
    pub group: String,
    pub required: u32,
    pub min_usd: i64, // cents; 0 means any amount
}

/// Whether approvals meet every quorum that applies to amount.
/// approvals maps a group to the distinct approvers from it who signed this request.
pub fn satisfied(quorums: &[Quorum], amount_usd: i64, approvals: &HashMap<String, u32>) -> bool {
    quorums
        .iter()
        .filter(|q| amount_usd >= q.min_usd)
        .all(|q| approvals.get(&q.group).copied().unwrap_or(0) >= q.required)
}
```

A satisfied quorum only starts the clock: the request waits out the quorum's `delay` and is signed only if no approver canceled in the meantime.

## Auditing

What a client's auditor, a regulator or a counterparty asks a custody platform to show:

- **Every signature against the policy in force**, with the decoded transaction, each approver, the device, and the delay served.
- **Every policy, quorum and allowlist change**, with who approved it and when it took effect.
- **Every client's balance by location**: segregated addresses, omnibus shares, off-exchange locks and amounts owed, and sub-custodian holdings, each reconciled daily.
- **Every off-exchange cycle**: the venue's instruction, the client's limits, the ledger transfer, and any dispute or default.
- **Sub-custodian diligence and approvals** in force on each date.

## What This Means for the System You Build

- Record who holds every key or share for every wallet; that field decides whether a wallet is custody or software.
- Version policies and quorums, put a delay on allowlist and policy changes, and let any approver cancel during it.
- Hold traded balances omnibus and held balances segregated, and make the client's balance the sum of both in one query.
- Settle exchange trades as ledger transfers between locked custody accounts, net per cycle, and size credit to the cycle.
- Treat a sub-custodian as a location with its own reconciliation, never as a new owner.
- Accrue custody fees daily on daily value and say in the schedule which price and which balances count.

## References

**Regulators and guidance**

- [Federal Reserve, FDIC and OCC: Crypto-Asset Safekeeping by Banking Organizations (July 14, 2025)](https://www.federalreserve.gov/newsevents/pressreleases/files/bcreg20250714a1.pdf), control, omnibus versus separate accounts, sub-custodian responsibility and insolvency treatment
- [OCC: News Release 2025-42, Interpretive Letter 1184 (May 7, 2025)](https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-42.html), outsourcing custody to sub-custodians with third-party risk management
- [NYDFS: Updated Guidance on Custodial Structures (September 30, 2025)](https://www.dfs.ny.gov/industry-guidance/industry-letters/il20250930-updated-guidance-custodial-structures), omnibus wallets, beneficial interest records and sub-custody conditions
- [SEC: Adviser and Regulated Fund Custody Rules; Crypto Custody Rules, proposed rule (October 6, 2026)](https://www.federalregister.gov/documents/2026/10/06/2026-20466/adviser-and-regulated-fund-custody-rules-crypto-custody-rules), self-custody as possession of any portion of key materials

**Filings**

- [BitGo Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1740604/000174060426000020/btgo-form10xk.htm), Go Network settlement, client-to-client movements and the fee types
- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), Prime custody in cold storage and the fee on total assets stored in custody
- [iShares Bitcoin Trust: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1980994/000143774926006058/bit20251231_10k.htm), the Vault and Trading Balances, the pro rata entitlement, the daily sweep and Trade Credit from Coinbase Credit

**Vendor documentation**

- [BitGo Developers: Wallet types](https://developers.bitgo.com/concepts/wallet-types), key creation by wallet type, cold-only custody wallets, video ID verification, the 24-hour withdrawal SLA, Go Accounts and policies that waive verification
- [Fireblocks Developers: Capabilities](https://developers.fireblocks.com/docs/capabilities), workspaces, vault accounts, MPC-CMP, the API co-signer, Admin Quorum, policies and roles
- [Fireblocks Developers: Off Exchange](https://developers.fireblocks.com/docs/off-exchange), the purpose of the Off Exchange integration
- [Copper](https://copper.co/), ClearLoop's monthly settlement and notional figures
- [Copper: ClearLoop Network](https://copper.co/en-us/solutions/clearloop-network), single net settlement under pre-agreed operating rules and MPC-based custody
- [Anchorage Digital: Custody](https://www.anchorage.com/platform/custody), HSM-secured cold storage, biometric approvals, segregated custody and staking from custody
- [Fidelity Digital Assets](https://www.fidelitydigitalassets.com/), the national trust bank, trading from cold storage and collateral accounts
- [BNY: Digital Assets](https://www.bny.com/corporate/global/en/solutions/platforms/digital-assets.html), digital asset custody at a G-SIB
