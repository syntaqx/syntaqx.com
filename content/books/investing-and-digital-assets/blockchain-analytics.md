+++
title = "On-Chain Analytics & Investigations"
nav_title = "On-Chain Analytics"
description = "Clustering heuristics worked on a small graph, attribution, exposure and risk scores, KYT on deposits and withdrawals, DPRK laundering and false positives."
category = "Investing & Digital Assets Industry"
order = 2573
part = "The Rules"
tags = ["crypto", "blockchain-analytics", "kyt", "clustering", "aml", "investigations", "dprk"]
+++

A bank sees its own customers' payments and, through the payment message, one hop beyond. A crypto exchange sees every transaction on every chain it supports, back to the first block, because the ledger is public; what it can't see is who any address belongs to. Blockchain analytics is the business of closing that gap: grouping addresses that one party controls into clusters, attaching names to clusters from whatever evidence exists, and measuring how much of the money arriving at or leaving an exchange touched clusters labeled as sanctioned, stolen, mixed or criminal. Three vendors dominate, Chainalysis, TRM Labs and Elliptic, and their scores sit inside nearly every regulated exchange's deposit and withdrawal pipeline, in law enforcement investigations and, increasingly, in court.

The engineering point is that every one of those outputs is an inference, not a fact. A cluster is the result of heuristics with measurable error rates; a label is someone's attribution with a date and a source; an exposure score depends on how many hops the vendor walked and what it called each hop. An exchange that blocks, freezes or reports on the strength of a score needs to record which inference it relied on, so that a reviewer, an examiner or a customer can see why. This chapter works through the clustering heuristics on a small transaction graph, attribution, exposure and risk scores with a KYT decision worked in numbers, KYT on deposits and withdrawals, tracing hacks and North Korean laundering, and the limits and false positives, and adds `kyt_screenings`, `exposure_scores` and `attribution_labels` to [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model), reusing the Payments volume's `address_screenings`. The program around it is [AML & the Travel Rule for Crypto](/books/investing-and-digital-assets/crypto-aml-and-travel-rule); sanctions law is Banking & Lending's [Sanctions Screening](/books/banking-and-lending/sanctions-screening).

## How the Platforms Do It

What the three main vendors publish about their monitoring products, as of November 2026:

| Vendor | Product | What it publishes |
| --- | --- | --- |
| **Chainalysis** | KYT (Know Your Transaction) | Risk assessment of "incoming and outgoing cryptocurrency transactions"; "direct and indirect exposure alerts," where indirect exposure goes back "as many hops as needed until an identified service is hit"; thresholds on "the proportion of funds transferred that are exposed to high-risk categories"; adjustable severity levels and behavioral alerts; "400+ networks and 50M+ tokens" |
| **TRM Labs** | Transaction Monitoring | Monitoring of "deposits and withdrawals with configurable rules"; "daily rescreening of transactions"; multi-condition rules on amount, aggregation to a category, velocity, blockchain and counterparty risk indicators; an audit log of changes to categories and severity; case management |
| **Elliptic** | Lens | Wallet screening before onboarding or a withdrawal and transaction screening as transfers happen; a "consistent, explainable risk score"; cross-chain tracing, "60+ blockchains and 250+ bridges covered" |

Three patterns. **Exposure, not identity, is the product.** None of the vendors tells an exchange who sent a deposit; they tell it what share of the funds traces back to which categories of service, directly or within some number of hops. **The rules are the customer's.** Thresholds, severities and which categories matter are configured by the exchange, which makes them the exchange's decisions to document ([Rules and Models Together](/docs/building-blocks/risk-scoring#rules-and-models-together)). **Scores change after the fact.** TRM rescreens daily because labels arrive late: an address that was clean when the deposit was credited may be attributed to a hack next week, and the exchange needs to find every transfer it touched.

None of the three publishes its clustering methodology in the detail an outsider could reproduce, so the heuristics below come from the academic work that founded the field. <!-- source-gap: ida-vendor-clustering-methodology | missing | each vendor's own description of its clustering heuristics, false-positive testing and attribution sources | closes with: a vendor methodology paper or court-filed expert report describing the heuristics, opened | checked: 2026-11-05 -->

## Clustering

### Common-input ownership

Bitcoin's whitepaper names the leak itself. Using a new key pair for each transaction keeps payments from being linked, but "some linking is still unavoidable with multi-input transactions, which necessarily reveal that their inputs were owned by the same owner." To spend two outputs in one transaction, the spender must sign for both, so one party controls both addresses. Meiklejohn and colleagues' 2013 paper "A Fistful of Bitcoins" made this Heuristic 1: "If two (or more) addresses are inputs to the same transaction, they are controlled by the same user," and noted its effect is transitive: inputs A and B in one transaction and B and C in another put A, B and C in one cluster. They called it "quite safe."

### Change addresses

A UTXO is spent whole ([Unspent outputs](/books/investing-and-digital-assets/blockchains-for-engineers#unspent-outputs)), so most payments have two outputs: the payment and the change back to the sender. If the change output can be identified, the sender's cluster grows by one address per transaction. The paper's Heuristic 2 says the "one-time change address is controlled by the same user as the input addresses," where an output is a one-time change address if this is its first appearance on chain, the transaction isn't a coinbase, no output pays back to an input address ("self-change"), and no other output is also appearing for the first time. The authors called it "significantly less safe" than Heuristic 1.

### Worked example: a small graph

![A transaction graph in five columns. Addresses A (0.6 BTC) and B (0.5 BTC) are inputs to tx1, which pays 0.8 BTC to X, an attributed exchange deposit address, and 0.2999 BTC to C, labeled change, with a fee of 0.0001. C and D (1.0 BTC) are inputs to tx2, which pays 1.2 BTC to Y and 0.0998 BTC to Z, also with a fee of 0.0001. A, B, C and D are accented as one cluster; X is drawn as an attributed service.](/diagrams/ida-cluster-graph.svg "Common-input ownership and the one-time change heuristic on two transactions: A, B, C and D become one cluster, and the cluster's payment to a known exchange deposit address is the lead an investigator follows.")

**tx1** spends A (0.6 BTC) and B (0.5 BTC): inputs 1.1 BTC; outputs 0.8 BTC to X and 0.2999 BTC to C; fee 1.1 - 0.8 - 0.2999 = 0.0001 BTC.

- **Heuristic 1:** A and B are inputs to the same transaction, so {A, B} is one cluster.
- **Heuristic 2:** X has appeared on chain before (it is an exchange's deposit address, known from earlier deposits), C appears for the first time, there is no self-change, and C is the only first-appearance output. C is the one-time change: the cluster is {A, B, C}.
- **Attribution:** X is labeled as a deposit address of a regulated exchange, so the cluster sent 0.8 BTC to an account there; the exchange's KYC record is one subpoena away. That edge, not the cluster, is usually what an investigation is looking for.

**tx2** spends C (0.2999 BTC) and D (1.0 BTC): inputs 1.2999 BTC; outputs 1.2 BTC to Y and 0.0998 BTC to Z; fee 1.2999 - 1.2 - 0.0998 = 0.0001 BTC.

- **Heuristic 1:** C and D are co-spent, so D joins: {A, B, C, D}, holding 0.6 + 0.5 + 1.0 = 2.1 BTC of inputs across the two transactions.
- **Heuristic 2 doesn't fire:** Y and Z are both appearing for the first time, so the fourth condition fails and neither is labeled change. A round-number guess (1.2 looks like a payment, so 0.0998 is change) is the kind of weaker heuristic analysts use and the paper's refined rule declines; a cluster built on it should carry a lower confidence.

**What breaks it.** If tx2 had been a CoinJoin, five people each contributing an input and receiving an equal 0.1 BTC output, Heuristic 1 would merge five strangers into one cluster. Equal-value outputs and many inputs are the signature, and clustering engines skip co-spend linking on transactions that match it. Account-model chains like Ethereum have no multi-input transactions at all; the equivalent signal there is behavioral, most commonly the pattern exchanges themselves create when they sweep customer deposit addresses into a hot wallet ([Sweeping and Gas Funding](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#sweeping-and-gas-funding)), which ties every deposit address to its exchange.

### How wrong it gets

The 2013 paper measured its own errors. Its first pass labeled over 4 million change addresses; 555,348 of them, 13%, were later reused, which a one-time change address shouldn't be. Excluding payouts from a dice game that returned funds to the sending address brought the rate to 1%; waiting a day before labeling, to 0.28%; waiting a week, to 0.17%, or 7,382 false positives. Even then, clustering produced "a giant super-cluster" of 1.6 million public keys spanning Mt. Gox, Instawallet, BitPay and Silk Road, traced to wallets that reused change addresses or let users choose them, and the authors refined the rule again to 3,540,831 change addresses in 3,384,179 clusters, of which they could name 2,197. The lessons carry over to any vendor: a change heuristic needs a waiting period, a false merge is catastrophic because transitivity spreads it, and most clusters stay unnamed.

## Attribution

A cluster becomes useful when it has a name, and names come from a short list of evidence types: the analytics firm's own transactions with a service (deposit to an exchange, see which address it gives); addresses services publish (exchange cold wallets in proof-of-reserves reports, [Proof of Reserves & Liabilities](/books/investing-and-digital-assets/proof-of-reserves)); government lists (OFAC publishes digital currency addresses on the SDN list but warns they "are not likely to be exhaustive," [Screening Wallets and Addresses](/books/payments/stablecoins#screening-wallets-and-addresses)); law enforcement and victim reports; and investigations that tie a cluster to a hack. Each label has a source, a date and a confidence, and a label can be wrong or go stale when a service shuts down and its addresses are reused. A platform that keeps its own labels (its customers' deposit addresses, counterparties it has verified, addresses it has blocked) has the most reliable attribution in the system for its own slice of the chain, and should keep it alongside the vendor's, not inside it.

## Exposure and Risk Scores

Exposure is the share of a transfer's value that traces to each category of counterparty:

- **Direct exposure:** the counterparty cluster itself is labeled: the deposit came straight from a mixer, or the withdrawal is going to a sanctioned address.
- **Indirect exposure:** the funds passed through the labeled cluster some hops earlier. Each vendor decides how far back to walk (Chainalysis: until an identified service is hit) and how to apportion value when funds merge and split.

A risk score compresses exposure into one number, and that compression is where decisions go wrong. Rules on exposure by category are easier to explain and harder to dilute.

### Worked example: a KYT decision

A customer deposits 10,000 USDC. The vendor's response attributes the source:

| Category | Share | Value | Hops |
| --- | --- | --- | --- |
| Regulated exchanges | 62% | $6,200 | 1 |
| DeFi protocols | 30% | $3,000 | 1 to 3 |
| Mixer | 6% | $600 | 2 |
| Sanctioned entity | 2% | $200 | 2 |

Suppose the platform's vendor-style blended score weights categories exchange 1, DeFi 2, mixer 8, sanctioned 10 on a 0 to 10 scale: 0.62 × 1 + 0.30 × 2 + 0.06 × 8 + 0.02 × 10 = 0.62 + 0.60 + 0.48 + 0.20 = 1.90. A policy of "block at 7 or above, review at 5 or above" credits this deposit without a look, although 2% of it traces two hops to a sanctioned party.

The platform's rules, as data:

| Rule | Condition | Action |
| --- | --- | --- |
| R1 | Direct exposure to a sanctioned entity, any amount | Block, freeze as blocked property, report |
| R2 | Indirect sanctioned exposure within 3 hops at least 1% of value or at least $1,000 | Hold, open a case |
| R3 | Mixer exposure at least 5% within 3 hops | Credit, open a case |
| R4 | Blended score at least 7 | Hold, open a case |

R2 fires (2% is at least 1%, though $200 is under $1,000) and R3 fires (6%). The deposit goes to `held`, one case is opened with both hits, and an analyst reviews the trace: if the sanctioned exposure is a 2022 interaction two hops up an exchange's hot wallet, the case closes with a documented rationale and the funds are credited; if the customer's own cluster paid the sanctioned party, it is escalated. The deposit is over the $2,000 MSB SAR threshold, so the analyst's decision on reporting is part of the case record ([Suspicious Activity Reports](/books/banking-and-lending/bsa-aml#suspicious-activity-reports)). Blocking under R1, by contrast, is a sanctions decision, not a judgment call: the funds are held and reported to OFAC, never returned to the sender ([Blocking, Rejecting and Reporting](/books/banking-and-lending/sanctions-screening#blocking-rejecting-and-reporting)).

## KYT on Deposits and Withdrawals

Know-your-transaction screening runs at three points:

- **Withdrawal pre-screen.** Before broadcast, screen the destination address and its cluster as a `destination_screening` withdrawal check ([The checks](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#the-checks)); a hit holds or rejects before any value leaves. This is the only screen that can prevent a transfer, so it runs synchronously, with a decision for the case where the vendor is down ([When the Scorer Is Down](/docs/building-blocks/risk-scoring#when-the-scorer-is-down)).
- **Deposit screen.** When a deposit is detected, screen the source; the result decides whether the deposit credits, credits with a case, or goes to `held`. The funds are already at the platform's address, so the choices are about crediting and reporting, not about stopping them.
- **Rescreening.** Re-run screens on past transfers as labels change, and on a customer's whole history when they are flagged. A deposit credited in March whose source is labeled a hack in April opens a case, and may lead to a freeze of what's left and a report.

Each screening records the vendor, the vendor's response, the platform's rule version and the action, so the decision can be reconstructed when the vendor's answer for the same address has since changed ([The Decision Record](/docs/building-blocks/risk-scoring#the-decision-record)).

## Tracing Hacks and DPRK Laundering

Analytics earns its keep after a theft. Chainalysis counted more than $3.4 billion stolen in 2025 through early December, including $1.5 billion from Bybit in February, and at least $2.02 billion stolen by North Korea, up $681 million and 51% from 2024, for a cumulative lower-bound estimate of $6.75 billion ([Exchange Security & Hacks](/books/investing-and-digital-assets/exchange-security#the-hack-record) has the incidents, including Binance's October 29, 2026 theft). Its analysis of how the money moved after the large thefts is a model for what tracing looks like:

- **Small pieces.** Slightly over 60% of North Korean laundering volume moved in transfers below $500,000, while other actors sent over 60% of theirs in tranches of $1 million to over $10 million; a monitoring threshold tuned to large transfers misses the pattern.
- **Different rails.** Relative to other illicit actors, North Korean funds used Chinese-language money movement and guarantee services 355% to more than 1,000% more, bridges 97% more, mixers 100% more and Huione 356% more, and avoided lending protocols, no-KYC exchanges, P2P exchanges, centralized exchanges and DEXs.
- **A 45-day rhythm.** In days 0 to 5 after a major theft, DeFi protocol flows rose 370% and mixer volume 135% to 150%; in days 6 to 10, limited-KYC exchanges 37%, centralized exchanges 32% and second-tier mixers 76%; in days 20 to 45, no-KYC exchanges 82%, the guarantee service Tudou Danbao 87%, instant exchanges 61%, Huione 45% and centralized exchanges 50%.
- **Blind spots.** Transfers of private keys and over-the-counter sales of crypto for fiat aren't visible on chain without other intelligence.

For an exchange the consequence is timing: stolen funds arrive at centralized exchanges in the second week and again weeks later, through intermediaries, in amounts below large-transfer thresholds. Rescreening against fresh hack labels, and freezing what is still on the platform when a label lands, is how exchanges and issuers recover anything; the issuer's side of freezing is [Freezes, Blacklists & Seizures](/books/investing-and-digital-assets/freezes-and-onchain-compliance).

## Limits and False Positives

What a platform should assume about any analytics output:

- **Clusters can be wrong in both directions.** False merges spread through transitivity (the 1.6 million-key super-cluster); missed links split one actor into many. A score on a falsely merged cluster punishes a customer for a stranger's history.
- **Indirect exposure is diluted by design.** Every popular service has some exposure to everything a few hops back; without a hop limit and a share threshold, every deposit is tainted. The thresholds are policy choices, and should be recorded and tested ([Two Kinds of Error](/docs/building-blocks/risk-scoring#two-kinds-of-error)).
- **Cross-chain flows break traces** unless the vendor models the bridge, and privacy techniques (CoinJoin, privacy coins, mixers) break them on purpose.
- **Vendors disagree.** Two vendors can attribute the same address differently; a platform that switches vendors sees its alert volume change overnight without any change in customers.
- **Customers can't see the evidence.** A held deposit needs a decision the platform can explain in general terms without disclosing a SAR or a vendor's proprietary data ([Explanations and Appeals](/docs/building-blocks/risk-scoring#explanations-and-appeals)).

## How to Build It

The Payments volume's `address_screenings` ([How to Build It](/books/payments/stablecoins#how-to-build-it)) records one check of one address; here an address maps to `addresses` for the platform's own and to `chains` plus the address string for counterparties. A KYT system adds the per-transfer screening with its exposure breakdown and the labels that explain it:

```sql
CREATE TABLE attribution_labels (          -- who an address or cluster is, according to whom
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  chain_id             UUID NOT NULL REFERENCES chains (id),
  address              TEXT NOT NULL,
  cluster_ref          TEXT,                  -- vendor cluster id, or the platform's own
  entity_name          TEXT,                  -- 'Exchange X', 'Bybit exploiter', null if unnamed
  category             TEXT NOT NULL,         -- 'exchange', 'defi', 'mixer', 'sanctioned',
                                              -- 'stolen_funds', 'darknet', 'ransomware', ...
  source               TEXT NOT NULL CHECK (source IN ('own_customer', 'own_investigation',
                         'vendor', 'ofac_sdn', 'law_enforcement', 'public_disclosure')),
  vendor               TEXT,
  confidence           TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  evidence_ref         TEXT,
  valid_during         TSTZRANGE NOT NULL,    -- labels are added, corrected and retired
  UNIQUE (chain_id, address, source, vendor, valid_during)
);

CREATE TABLE kyt_screenings (              -- one screening of one transfer, append-only
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  transfer_id          UUID NOT NULL REFERENCES transfers (id),
  onchain_transaction_id UUID REFERENCES onchain_transactions (id),
  stage                TEXT NOT NULL CHECK (stage IN ('withdrawal_prescreen', 'deposit',
                         'rescreen')),
  counterparty_address TEXT NOT NULL,
  address_screening_id UUID,                  -- Payments' address_screenings row for the address
  vendor               TEXT NOT NULL,
  vendor_response      JSONB NOT NULL,        -- kept whole: it is the evidence
  vendor_score         NUMERIC(5, 2),
  rule_set_version     TEXT NOT NULL,         -- the platform's thresholds in force
  rules_fired          TEXT[] NOT NULL DEFAULT '{}',
  action               TEXT NOT NULL CHECK (action IN ('clear', 'credit_and_case', 'hold',
                         'reject', 'block')),
  case_id              UUID REFERENCES cases (id),
  screened_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (action IN ('clear', 'reject') OR case_id IS NOT NULL)
);

CREATE TABLE exposure_scores (             -- the breakdown behind a screening
  kyt_screening_id     UUID NOT NULL REFERENCES kyt_screenings (id),
  category             TEXT NOT NULL,
  direction            TEXT NOT NULL CHECK (direction IN ('direct', 'indirect')),
  share                NUMERIC(7, 6) NOT NULL CHECK (share BETWEEN 0 AND 1),
  value_usd            NUMERIC(20, 2) NOT NULL,
  min_hops             SMALLINT NOT NULL CHECK (min_hops >= 0),
  label_id             UUID REFERENCES attribution_labels (id),  -- where the platform holds it
  PRIMARY KEY (kyt_screening_id, category, direction)
);
```

The rules from the worked example, evaluated over a screening's exposure rows:

```go tab="Go"
type Exposure struct {
	Category string
	Direct   bool
	Share    decimal.Decimal
	ValueUSD decimal.Decimal
	MinHops  int
}

var (
	onePct  = decimal.RequireFromString("0.01")
	fivePct = decimal.RequireFromString("0.05")
	usd1000 = decimal.RequireFromString("1000")
)

// Fired returns the rules that fire; the strictest action wins downstream.
func Fired(ex []Exposure, score decimal.Decimal) []string {
	var out []string
	for _, e := range ex {
		switch {
		case e.Category == "sanctioned" && e.Direct:
			out = append(out, "R1")
		case e.Category == "sanctioned" && e.MinHops <= 3 &&
			(e.Share.GreaterThanOrEqual(onePct) || e.ValueUSD.GreaterThanOrEqual(usd1000)):
			out = append(out, "R2")
		case e.Category == "mixer" && e.MinHops <= 3 && e.Share.GreaterThanOrEqual(fivePct):
			out = append(out, "R3")
		}
	}
	if score.GreaterThanOrEqual(decimal.NewFromInt(7)) {
		out = append(out, "R4")
	}
	return out
}
```

```rust tab="Rust"
pub struct Exposure {
    pub category: String,
    pub direct: bool,
    pub share: Decimal,
    pub value_usd: Decimal,
    pub min_hops: u16,
}

/// The rules that fire; the strictest action wins downstream.
pub fn fired(ex: &[Exposure], score: Decimal) -> Vec<&'static str> {
    let mut out = Vec::new();
    for e in ex {
        let near = e.min_hops <= 3;
        match e.category.as_str() {
            "sanctioned" if e.direct => out.push("R1"),
            "sanctioned" if near && (e.share >= dec!(0.01) || e.value_usd >= dec!(1000)) => {
                out.push("R2")
            }
            "mixer" if near && e.share >= dec!(0.05) => out.push("R3"),
            _ => {}
        }
    }
    if score >= dec!(7) {
        out.push("R4");
    }
    out
}
```

Design notes:

- **Store the vendor's response whole** and the platform's rule version beside it; the vendor's answer for the same address will be different next month.
- **Rescreen by label, not by schedule alone.** When a new `attribution_labels` row lands for a category that matters, query every `kyt_screenings` row that touched the address and open cases for the ones whose action would now differ.
- **Keep own labels separate and authoritative** for the platform's own addresses and verified counterparties, so a vendor mislabel of the platform's hot wallet can't freeze its customers.
- **Cases tie it together:** every non-clear action points at a `cases` row with the rule's clock, and the SAR decision lives in the restricted store described in [How to Build It](/books/banking-and-lending/bsa-aml#how-to-build-it) in BSA/AML Programs, not in the screening.

## Auditing

- **For every transfer,** the screenings at each stage, the vendor response, the rules fired, the action and the case.
- **Rule set versions** with who changed which threshold and when, and a test of each change against past screenings before it went live.
- **Rescreening coverage:** every new high-risk label matched against past transfers within a stated time, and the cases it opened.
- **False positive and negative rates** per rule from closed cases, the measure that justifies the thresholds ([Measuring It](/docs/building-blocks/risk-scoring#measuring-it)).

## What This Means for the System You Build

- **Treat clusters, labels and scores as inferences** with sources, dates and confidence, and record the one each decision used.
- **Write exposure rules by category and hop,** not only a blended score threshold, and keep them as versioned data.
- **Screen withdrawals before broadcast,** deposits on arrival and everything again when labels change.
- **Expect laundering in small pieces over weeks,** through intermediaries, and tune monitoring to that shape.
- **Keep your own labels** for your own addresses and counterparties, authoritative over any vendor's.

## References

**Standards and protocols**

- [Satoshi Nakamoto: Bitcoin: A Peer-to-Peer Electronic Cash System](https://bitcoin.org/bitcoin.pdf), section 10 on new keys per transaction and multi-input linking

**Vendor documentation**

- [Chainalysis: KYT](https://www.chainalysis.com/product/kyt/), direct and indirect exposure alerts, hop depth, proportion thresholds, severity and coverage
- [TRM Labs: Transaction Monitoring](https://www.trmlabs.com/products/transaction-monitoring), configurable deposit and withdrawal rules, daily rescreening, rule inputs and the audit log
- [Elliptic: Lens](https://www.elliptic.co/platform/lens), wallet and transaction screening, the explainable risk score and chain and bridge coverage
- [Chainalysis: Crypto hacking and stolen funds 2026 (December 18, 2025)](https://www.chainalysis.com/blog/crypto-hacking-stolen-funds-2026/), 2025 theft totals, Bybit, North Korea's totals, transfer sizes, rails, the 45-day laundering waves and blind spots

**In practice**

- [Meiklejohn et al.: A Fistful of Bitcoins: Characterizing Payments Among Men with No Names (IMC 2013)](https://cseweb.ucsd.edu/~smeiklejohn/files/imc13.pdf), Heuristics 1 and 2, the one-time change definition, the false positive measurements, the super-cluster and the final cluster counts
