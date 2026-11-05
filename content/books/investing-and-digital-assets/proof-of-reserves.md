+++
title = "Proof of Reserves & Liabilities"
nav_title = "Proof of Reserves"
description = "Proof of reserves and liabilities: Merkle-sum trees with a worked inclusion proof, negative balances, zk proofs, proving assets and the limits."
category = "Investing & Digital Assets Industry"
order = 2549
part = "Crypto Exchanges"
tags = ["crypto", "proof-of-reserves", "merkle-trees", "zero-knowledge", "attestation", "custody"]
+++

A proof of reserves answers one question: on a given day, did the exchange hold at least as much of each asset as it owed its customers? It is two proofs, not one. Proof of liabilities shows what the exchange owes, in a form each customer can check their own balance against without seeing anyone else's; proof of assets shows what it controls, usually by signing with the keys to its addresses. The ratio of the two, per asset, is the number exchanges publish: Kraken's June 30, 2026 snapshot showed BTC at 102.9% and ETH at 100.5%, and OKX's 49th report showed $33.87 billion across 21 assets with BTC at 108%. The industry adopted these reports in a hurry in November 2022, when FTX failed with a hole of about $8.7 billion in customer assets that no outside party had been able to see.

What a proof of reserves can't do is as important as what it does. It is a snapshot at one moment. It can't show liabilities the exchange left out of the tree, assets borrowed for the day of the snapshot, keys someone else also holds, or obligations that never appear as a customer balance, such as a lender's claim on the same coins. This chapter covers what a proof claims, Merkle-sum trees with a worked inclusion proof in code, the negative-balance attack and the zero-knowledge proofs that close it, proving assets, attestation versus audit, the 2022 auditor withdrawals, what proof of reserves can't show, and how to design a program that means something. It extends `reconciliations`, `positions` and `addresses` from [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business. The daily internal version of the same check is the treasury reconciliation in Hot, Warm & Cold Wallets; a stablecoin issuer's monthly reserve report is Issuing a Stablecoin; the accounting for customer crypto is Accounting for Crypto & Treasury Companies.

## How the Exchanges Do It

How exchanges that publish a method run theirs, as of November 2026:

| Exchange | Liabilities | Negative balances | Assets | Latest published figures |
| --- | --- | --- | --- | --- |
| **Kraken** | An independent accountant snapshots anonymized balances into a Merkle tree; each customer gets a Record ID and a leaf to check | Margin positions adjust balances "by the positive position values"; staked balances included with spot | The accountant collects Kraken's signatures proving control of on-chain addresses | Snapshot June 30, 2026: BTC 102.9%, ETH 100.5%, SOL 100.6%, XRP 102.3%, ADA 100.3%, USDC, USDT and USDG 105%+; accountant not named on the page |
| **Binance** | Merkle tree of hashed account identifiers and balances | A zk-SNARK circuit proves each account's total net balance is zero or greater and each root update is valid | Wallet balances | "fully backed 1:1"; no auditor named and no snapshot date in the page as captured |
| **OKX** | Merkle tree; a zk-STARK proves a "Total Balance Constraint," "Non-negative Constraint" and "Inclusion Constraint" | Proven non-negative in the STARK | Each published address carries a signed message, "I am an OKX address" | 49th report: $33.87 billion across 21 assets; BTC 108%, ETH 101%, USDT 106%, USDC 100%; verifier code open source |

The three converge on the design Vitalik Buterin laid out on November 19, 2022: a sum tree of liabilities each customer can check, a proof that no balance in it is negative, and signatures from the addresses that hold the assets. They differ in who runs it (an accountant, the exchange, or a published proof anyone can verify) and in how much they say about what isn't in the tree.

## What a Proof of Reserves Claims

Written as a statement, a proof of reserves for one asset at one time t says:

```text
assets(t)       = Σ balances of addresses the exchange proved it controls at t
liabilities(t)  = Σ every customer's balance of the asset at t, as committed in the tree
claim           assets(t) ≥ liabilities(t), and every customer can check their balance is in liabilities(t)
```

Each term has a hidden assumption. The asset sum assumes the exchange controls those keys alone and owes nothing against those coins. The liability sum assumes every customer and every product is in the tree, and that nobody's balance is negative. And "at t" assumes nothing interesting happened at t − 1 or t + 1. The mechanics below make the liability side verifiable; the honesty of the rest is what the program around them has to supply.

## Proof of Liabilities: Merkle-Sum Trees

A plain Merkle tree commits to a set of records with one hash. A Merkle-sum tree commits to their total as well: "each node is a `(balance, hash)` pair," the leaves hold each customer's balance with a salted hash of their identity, and each parent's balance is the sum of its children's while its hash covers both children and their sums. The root therefore commits to every balance and to the total, and changing any leaf or hiding any amount changes the root.

A customer verifies inclusion with the path: their own leaf, recomputed from their salt, identity and balance, plus "the sister nodes along the path from a leaf to the root." Hashing up the path must reproduce the published root, and the sums along the way must add up to the published total.

Kraken's leaves show the details a real tree adds. The Record ID is "SHA256(concatenate(Account Code, Kraken IIBAN, Review ID))," a salted identifier unique to the customer and the review, so leaves can't be linked across reviews; the Merkle leaf is "substring(SHA256(Merkle Hash), 0, 16)," the first 16 hex characters of a hash over the Record ID and the customer's balances by asset. Kraken's page warns that results depend on the exact string formatting of balances and on the order of assets, which is the practical lesson for anyone building one: the leaf serialization is a public specification, versioned, and the verifier code must be published with it (Kraken's is in Python, Rust, Go and Bash).

### A worked inclusion proof

A tree of four customers' BTC balances, in satoshis, with my own serialization: a leaf hash is SHA-256 of `salt|account|balance`, a parent's hash is SHA-256 of `left_hash|left_sum|right_hash|right_sum`. Hashes are shown to 16 hex characters; the full values are in the code below.

```text
                         root  sum 300,000,000  hash 75875e30af5e82f8
                        /                                  \
     n01  sum 175,000,000  d7122b8dc2f735ae      n23  sum 125,000,000  50cc9c693cc3e857
       /                 \                         /                 \
acct-1001 150,000,000   acct-1002 25,000,000   acct-1003 80,000,000   acct-1004 45,000,000
0a5816be07c3bd84        571536357789f641       b8a82b7a9c005b2b       33fd4d763945c19e

customer acct-1002 is given:
  own salt and balance          s3cr3t-b, 25,000,000 sat (0.25 BTC)
  step 1: sibling on the left   acct-1001 leaf, sum 150,000,000
  step 2: sibling on the right  n23, sum 125,000,000
  published root                75875e30af5e82f8…, sum 300,000,000 (3.00 BTC)

recompute:
  leaf    = SHA256("s3cr3t-b|acct-1002|25000000")                  → 571536357789f641…
  n01     = SHA256(leaf-1001 | 150000000 | leaf | 25000000)         → d7122b8dc2f735ae…, 175,000,000
  root    = SHA256(n01 | 175000000 | n23 | 125000000)               → 75875e30af5e82f8…, 300,000,000  ✓
```

If the exchange had recorded the customer at 0.24 BTC, the recomputed leaf hash would differ and the root wouldn't match. The verification, in the shape a customer-side tool would run it:

```go tab="Go"
type Node struct {
	Hash string // hex
	Sum  int64  // smallest units
}

type Step struct {
	Sibling Node
	Left    bool // the sibling is on the left
}

func hashHex(s string) string {
	b := sha256.Sum256([]byte(s))
	return hex.EncodeToString(b[:])
}

func parent(l, r Node) Node {
	return Node{Hash: hashHex(fmt.Sprintf("%s|%d|%s|%d", l.Hash, l.Sum, r.Hash, r.Sum)), Sum: l.Sum + r.Sum}
}

// VerifyInclusion rebuilds the root from the customer's own leaf and the proof path.
func VerifyInclusion(salt, accountID string, balance int64, path []Step, root Node) error {
	cur := Node{Hash: hashHex(fmt.Sprintf("%s|%s|%d", salt, accountID, balance)), Sum: balance}
	for _, s := range path {
		if s.Sibling.Sum < 0 {
			return errors.New("negative sibling sum: a hidden liability offset")
		}
		if s.Left {
			cur = parent(s.Sibling, cur)
		} else {
			cur = parent(cur, s.Sibling)
		}
	}
	if cur != root {
		return errors.New("root mismatch: balance not in the published tree")
	}
	return nil
}
```

```rust tab="Rust"
use sha2::{Digest, Sha256};

#[derive(Clone, PartialEq)]
struct Node {
    hash: String, // hex
    sum: i64,     // smallest units
}

struct Step {
    sibling: Node,
    left: bool, // the sibling is on the left
}

fn hash_hex(s: &str) -> String {
    hex::encode(Sha256::digest(s.as_bytes()))
}

fn parent(l: &Node, r: &Node) -> Node {
    Node {
        hash: hash_hex(&format!("{}|{}|{}|{}", l.hash, l.sum, r.hash, r.sum)),
        sum: l.sum + r.sum,
    }
}

// Rebuilds the root from the customer's own leaf and the proof path.
fn verify_inclusion(salt: &str, account_id: &str, balance: i64, path: &[Step], root: &Node) -> Result<(), &'static str> {
    let mut cur = Node { hash: hash_hex(&format!("{salt}|{account_id}|{balance}")), sum: balance };
    for s in path {
        if s.sibling.sum < 0 {
            return Err("negative sibling sum: a hidden liability offset");
        }
        cur = if s.left { parent(&s.sibling, &cur) } else { parent(&cur, &s.sibling) };
    }
    if &cur != root {
        return Err("root mismatch: balance not in the published tree");
    }
    Ok(())
}
```

The tree leaks something by design: the sibling sums. Customer 1002 learns that customer 1001 holds exactly 1.5 BTC (not who, because the leaf is salted). Vitalik's post notes the leak: a plain list leaks every balance, and sum trees leak less, but "some information about group balances" still gets out. Padding the tree with zero-balance leaves, randomizing positions per snapshot, and splitting large balances across leaves reduce it; zero-knowledge proofs remove it.

## The Negative-Balance Attack

The sum tree has one structural weakness: a sum can include negative numbers. Vitalik's example is an exchange owing 1,390 ETH while holding 890: it adds a fake account with a balance of −500 ETH, and the tree's total is now 890, fully "covered." The sum tree partly defends itself, because the fake leaf's −500 flows into every parent above it, so any customer whose path passes a parent with a suspicious sum can object; the exchange gets away with it only if "nobody in the entire right half of the tree checks their balance proof," or if it hides the shortfall by leaving real customers out of the tree instead.

In the worked tree, replacing customer 1004 with a fake leaf of −0.6 BTC drops n23's sum from 1.25 BTC to 0.2 BTC, below customer 1003's own 0.8 BTC. Customer 1003's proof path would carry a sibling with a negative sum, which the verifier above rejects, and customer 1002 would see n23 summing to less than any honest subtree of two customers could. Both checks depend on customers running the verifier; most don't.

This is not a theoretical concern for exchanges with margin. A margin customer can legitimately owe the exchange (a negative balance in the borrowed asset), and a liability tree that includes negative balances is exactly the tree in which a fake one hides. FTX's code had such an account: Alameda was the only customer with `allow_negative` set, and its borrow limit stood at $65 billion on the petition date (FTX, Celsius & the 2022 Collapse covers the flag). A sum tree that netted Alameda's negative balances against customers' positive ones would have balanced.

## Zero-Knowledge Proofs

The fix is to prove, without revealing the leaves, that every balance in the tree is non-negative and that they sum to the stated total. Vitalik's proposal: commit the balances in a Merkle tree or polynomial commitment and "use a ZK-SNARK to prove that all balances in the tree are non-negative." Binance's circuit proves three things per update: that each customer's balances are included in the total, that each account's total net balance is zero or greater, and that each change of the root is valid. OKX uses a zk-STARK (transparent: no trusted setup) over the same three constraints and publishes the verifier.

For margin accounts, Binance's "net balance" is the design answer: an account may be negative in one asset if its other assets cover it, and the circuit proves the account's total net value, at stated prices, is non-negative. Vitalik describes the same constraint: negative balances are acceptable "only if they have enough other assets" to cover them. That moves the trust from "no negative balances" to "the prices and haircuts used to net them," which belong in the published methodology.

## Proof of Assets

The liability tree is the half customers can check. The asset half is the exchange proving control of addresses whose on-chain balances sum to the reserve. The methods:

- **Signed messages.** The exchange signs a challenge with each address's key. OKX publishes each address with a signature over "I am an OKX address"; Kraken's accountant "collects digital signatures produced by Kraken, which prove ownership over the on-chain addresses." A fresh challenge per review (a phrase including the review date) prevents reuse of old signatures.
- **Moves.** Sending coins from each address at an agreed time proves control at the cost of fees and of touching cold storage, which is why signatures are preferred.
- **Sampling and structure.** Vitalik suggests proving a random sample of many addresses, or using zero-knowledge proofs over multisig structures, to limit the cost for cold storage.

Signatures prove that someone holding the exchange's key signed. They don't prove nobody else holds it: Kraken's page says plainly that the review "cannot prove exclusive possession of private keys that may have theoretically been duplicated by an attacker." They don't prove the coins aren't owed to someone: the review "cannot identify any hidden encumbrances or prove that funds had not been borrowed for purposes of passing the review." And they can't cover fiat at all: Vitalik's post is explicit that fiat can only be verified through trust in banks and auditors. A further hazard he raises is collateral shared across exchanges: two exchanges that pass the same coins back and forth on snapshot days both look solvent, which simultaneous or unscheduled snapshots make harder.

## Attestation Versus Audit

A proof of reserves report from an accounting firm is not an audit. Kraken describes its review as "a procedure performed by an independent 3rd party accountant," and the distinction matters: a financial statement audit gives an opinion on the whole balance sheet, including liabilities that never appear as customer balances (loans, payables, claims from lenders), over a period, under auditing standards; a reserves engagement checks a defined set of procedures at a point in time: that the leaves sum to the root, that the signatures verify, that the balances at those addresses at that block are what the report says. It says nothing about what the exchange owes outside the tree.

The statutory contrast is the stablecoin regime. Under the GENIUS Act, a permitted issuer must "publish the monthly composition of the issuer's reserves" on its website, have the report examined each month by a registered public accounting firm, and have its CEO and CFO certify its accuracy each month to its regulator, with false certification carrying criminal penalties (12 USC 5903(a)). An exchange's proof of reserves has no such statute behind it in the US: its scope, frequency and examiner are whatever the exchange chooses, which is why the design decisions below decide whether it means anything.

## The 2022 Auditor Withdrawals

The industry's first wave of reports collided with the accounting profession in December 2022. The Block reported on December 16, 2022 that Mazars had paused its proof-of-reserves work for crypto clients, including Binance, KuCoin and Crypto.com, and that Binance said it would "not be able to work with Mazars for the moment" and would focus on Merkle-tree proofs instead. The episode showed what customers had been reading into the reports: assurance about solvency that the procedures never gave. The exchanges' response, published methods and zero-knowledge proofs that anyone can verify, moved the trust from the accountant's name to the method, which is an improvement on the liability side and changes nothing on the asset side.

## What PoR Can't Show

A checklist of what a clean proof of reserves leaves open, each a failure that has happened:

| Gap | Why the proof misses it | The case |
| --- | --- | --- |
| **Liabilities off the tree** | Only customer balances are leaves; loans, lender claims and other debts aren't | A firm can owe its lenders more than its whole reserve |
| **Customers left out** | A customer not in the tree can't detect it; nobody else can either | Vitalik's alternative to the negative-balance attack |
| **Negative balances netted** | Without a non-negativity proof, a fake or insider negative balance offsets real ones | FTX's `allow_negative` account |
| **Borrowed or encumbered assets** | Signatures show control at the snapshot, not ownership free of claims | Kraken's own stated limitation |
| **Shared keys** | A signature proves possession, not exclusive possession | Kraken's own stated limitation |
| **Title** | A leaf shows a balance, not whether the customer owns the asset or is a creditor | Celsius: the court held Earn assets were estate property under the Terms of Use, so Earn holders were unsecured creditors |
| **Point in time** | Assets can arrive for the snapshot and leave after | Collateral shuffled between firms |
| **Fiat** | No cryptographic proof of bank balances | Over $6.4 billion of FTX.com's $8.7 billion deficit was fiat and stablecoin |

The title row is the one engineers miss. A Merkle leaf saying a customer has 1 BTC is equally true whether the customer owns 1 BTC held in custody or lent 1 BTC to the exchange on terms that transferred ownership. The proof needs to state, per product, which kind of liability each leaf is.

## Designing a Credible Program

My defaults, from the gaps above:

- **Every product in the tree.** Spot, staked, margin (net, with the netting prices published), futures and earn balances, each as a separate field in the leaf, with the product's legal nature (custody or creditor) stated in the methodology.
- **Prove non-negativity.** A zero-knowledge proof over the whole tree, or at minimum a published rule that no leaf is negative, checked by the examiner.
- **All assets, every wallet.** Every address the exchange controls, including cold and staking, signed over a fresh challenge per snapshot; the report lists addresses so anyone can check balances at the stated block.
- **Ratios per asset, not in dollars.** A surplus in USDT doesn't cover a shortfall in BTC; publish each.
- **Frequent and not fully scheduled.** Monthly at least, with snapshot times chosen so assets can't be borrowed for the day.
- **Liabilities beyond the tree.** Pair the proof with audited financial statements, or say plainly that it has none.
- **Publish the verifier.** The leaf serialization and code, versioned, so a customer's check doesn't depend on the exchange's website.
- **Build it from the reconciliation you already run.** The tree should be generated from the same ledger snapshot as the daily chain reconciliation, so the published proof and the internal control can't disagree.

## How to Build It

A proof of reserves is a reconciliation with a public output. It adds a snapshot record per asset and block, the leaves generated from `positions` at that snapshot, and the address ownership proofs collected for the asset side. The snapshot ties to a `reconciliations` row so the internal and published results are the same computation.

```sql
CREATE TABLE por_snapshots (               -- one per instrument per published review
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  instrument_id      UUID NOT NULL REFERENCES instruments (id),
  review_ref         TEXT NOT NULL,          -- the review's public identifier
  as_of              TIMESTAMPTZ NOT NULL,
  blocks             JSONB NOT NULL,         -- block height and hash per chain the asset is on
  ledger_through_entry_id UUID NOT NULL REFERENCES journal_entries (id),  -- the ledger cut
  reconciliation_id  UUID NOT NULL REFERENCES reconciliations (id),
  leaf_spec_version  TEXT NOT NULL,          -- the published serialization
  merkle_root        TEXT NOT NULL,
  total_liabilities  NUMERIC(78, 0) NOT NULL CHECK (total_liabilities >= 0),
  total_assets       NUMERIC(78, 0) NOT NULL,
  zk_proof_uri       TEXT,                   -- non-negativity and sum proof, if any
  examiner           TEXT,                   -- the accountant, or null
  status             TEXT NOT NULL CHECK (status IN ('building', 'examined', 'published',
                       'withdrawn')),
  published_at       TIMESTAMPTZ,
  UNIQUE (instrument_id, review_ref)
);

CREATE TABLE liability_leaves (            -- generated from positions at the cut; never edited
  por_snapshot_id    UUID NOT NULL REFERENCES por_snapshots (id),
  leaf_index         INT NOT NULL,
  account_id         UUID REFERENCES accounts (id),   -- null for padding leaves
  record_id          TEXT NOT NULL,          -- salted, per review; given to the customer
  balances           JSONB NOT NULL,         -- by product: spot, staked, margin_net, earn
  balance_total      NUMERIC(78, 0) NOT NULL CHECK (balance_total >= 0),
  leaf_hash          TEXT NOT NULL,
  PRIMARY KEY (por_snapshot_id, leaf_index),
  UNIQUE (por_snapshot_id, record_id)
);

CREATE TABLE address_ownership_proofs (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  por_snapshot_id    UUID NOT NULL REFERENCES por_snapshots (id),
  address_id         UUID NOT NULL REFERENCES addresses (id),
  challenge          TEXT NOT NULL,          -- includes the review_ref and date
  signature          TEXT NOT NULL,
  method             TEXT NOT NULL CHECK (method IN ('signed_message', 'onchain_move', 'zk')),
  balance_at_block   NUMERIC(78, 0) NOT NULL,
  verified_at        TIMESTAMPTZ NOT NULL,
  UNIQUE (por_snapshot_id, address_id)
);
```

The checks before publication, each a query that must return nothing:

```sql
-- every customer with a balance at the cut is a leaf
-- (positions_as_of: the as-of position query over journal_lines at the ledger cut)
SELECT p.account_id FROM positions_as_of($cut) p
WHERE p.instrument_id = $instrument AND p.settled_quantity > 0
EXCEPT SELECT account_id FROM liability_leaves WHERE por_snapshot_id = $snap;

-- the tree total is the ledger's customer total
SELECT 1 FROM por_snapshots s
WHERE s.id = $snap AND s.total_liabilities <> (SELECT SUM(balance_total) FROM liability_leaves
                                               WHERE por_snapshot_id = $snap);

-- every wallet holding the asset is proven
SELECT w.id FROM wallets w JOIN addresses a ON a.wallet_id = w.id
WHERE w.chain_id IN (SELECT chain_id FROM asset_networks WHERE instrument_id = $instrument)
  AND a.status = 'active' AND a.account_id IS NULL
EXCEPT SELECT ad.wallet_id FROM address_ownership_proofs p JOIN addresses ad ON ad.id = p.address_id
WHERE p.por_snapshot_id = $snap;
```

Notes on the sketch:

- **Generated, not assembled.** Leaves come from `positions` at a stated ledger cut (`ledger_through_entry_id`), the same cut the chain reconciliation uses, so the proof can be regenerated byte for byte.
- **No negative leaf.** The check constraint on `balance_total` makes a negative leaf unstorable; margin netting happens before the leaf, by the published rule.
- **Record IDs rotate.** A new salt per review means a customer's leaf can't be tracked across reviews.
- **Withdrawal is a state.** A report later found wrong is marked `withdrawn` with a public reason, not deleted.
- **Events:** `por_snapshot.published` and `por_snapshot.withdrawn` through the [outbox](/docs/architecture/events#the-transactional-outbox), and a customer notification with their Record ID.

## Auditing

- **Every published snapshot** with its ledger cut, blocks, root, totals, proof and examiner, retained with the leaf data needed to regenerate it.
- **Every ownership proof** with the challenge and signature.
- **The checks' results** before publication: coverage of customers, totals and wallets.
- **The methodology versions** (leaf serialization, netting prices, products included) and when each applied.
- **Customer verification support:** the Record IDs issued and any inclusion disputes as `cases`.

## What This Means for the System You Build

- **Generate the liability tree from the ledger cut your chain reconciliation uses,** so the public proof is your internal control.
- **Put every product in the leaf,** and say for each whether the customer owns the asset or is a creditor.
- **Prove no balance is negative,** with a zero-knowledge proof or an examined rule; net margin by published prices.
- **Prove every wallet with a fresh challenge,** and publish addresses and blocks.
- **Publish ratios per asset** and the verifier code with a versioned leaf specification.
- **Say what the proof doesn't cover:** other liabilities, encumbrances, fiat, and the time between snapshots.

## References

**Law and regulation**

- [12 USC 5903](https://www.law.cornell.edu/uscode/text/12/5903), GENIUS Act monthly publication of reserve composition, monthly examination by a registered public accounting firm, and CEO and CFO certification

**Courts and enforcement**

- [*In re Celsius Network LLC*, No. 22-10964 (MG) (Bankr. S.D.N.Y. Jan. 4, 2023), memorandum opinion on ownership of Earn account assets](https://www.nysb.uscourts.gov/sites/default/files/opinions/312902_1822_opinion.pdf), Terms of Use transferring title to Celsius and Earn holders as unsecured creditors
- [In re FTX Trading Ltd., First Interim Report of John J. Ray III on Control Failures (D. Del. 22-11068, Doc 1242-1, April 9, 2023)](https://storage.courtlistener.com/recap/gov.uscourts.deb.188450/gov.uscourts.deb.188450.1242.1.pdf), the `allow_negative` flag, Alameda as the only account with it, and the $65 billion borrow value
- [In re FTX Trading Ltd., Second Interim Report of John J. Ray III: the commingling and misuse of customer deposits at FTX.com (Doc 1704-1, June 26, 2023)](https://storage.courtlistener.com/recap/gov.uscourts.deb.188450/gov.uscourts.deb.188450.1704.1.pdf), about $8.7 billion of customer assets misappropriated, mostly cash and stablecoin

**Standards and protocols**

- [Vitalik Buterin: Having a safe CEX, proof of solvency and beyond (November 19, 2022)](https://vitalik.eth.limo/general/2022/11/19/proof_of_solvency.html), Merkle-sum trees, inclusion paths, the negative-balance attack, ZK-SNARK non-negativity, proof of assets, privacy leakage and fiat limits

**Vendor documentation**

- [Kraken: Proof of reserves](https://www.kraken.com/proof-of-reserves), the accountant's procedure, Record ID and leaf construction, products included, the June 30, 2026 ratios and stated limitations
- [Binance: Proof of reserves](https://www.binance.com/en/proof-of-reserves), the Merkle tree and zk-SNARK circuit, net balance non-negativity and verification
- [OKX: Proof of reserves](https://www.okx.com/proof-of-reserves), the zk-STARK constraints, signed address messages, the 49th report's totals and ratios, and open-source verification

**In practice**

- [The Block: Mazars pauses crypto audits (December 16, 2022)](https://www.theblock.co/post/195623/mazars-pauses-crypto-audits), the pause of proof-of-reserves work for Binance, KuCoin and Crypto.com and Binance's response (press)
