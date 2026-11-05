+++
title = "Exchange Security & Hacks"
nav_title = "Exchange Security"
description = "The exchange hack record from Mt. Gox to Binance in 2026, signing and hot wallet controls, insiders, social engineering, response and reimbursement."
category = "Investing & Digital Assets Industry"
order = 2550
part = "Crypto Exchanges"
tags = ["crypto", "security", "hacks", "incident-response", "insider-threat", "custody"]
+++

An exchange is a pile of bearer assets with an API in front of it. Whoever gets a valid signature out of its wallets owns the coins, the chain won't reverse the transfer, and the thief can be laundering through bridges and mixers within minutes. The record is long and getting larger: Chainalysis counted more than $3.4 billion stolen across crypto from January to early December 2025, of which North Korean groups took at least $2.02 billion, "a record 76% of all service compromises," and Bybit's $1.5 billion in February 2025 was most of it. Then on October 29, 2026, attackers took about $6.34 billion of assets from Binance's hot wallets, by Binance's own count, after compromising an engineer's laptop and reaching an internal signing service.

The attacks have moved. Mt. Gox lost coins to years of bad wallet management; the thefts of 2024 to 2026 came through people: a wallet vendor's developer machine (Bybit), a custody provider's interface (WazirX), a job interview with a malicious coding assignment (Binance), and support contractors paid to pull customer data (Coinbase). The keys were often held well; what failed was the path that asks the keys to sign. This chapter covers the hack record, the attack paths, signing and hot wallet controls, withdrawal anomaly detection, insiders and support tooling, account takeover and social engineering, incident response and customer reimbursement. It extends `wallets`, `transfers` and `cases` from [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business. Key schemes, ceremonies and the Bybit mechanism are in [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing#bybit-february-21-2025); wallet tiers and limits are [Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets#hot-wallet-limits-and-sizing); the customer-side fraud program is Account Security & Fraud; tracing stolen funds is [On-Chain Analytics & Investigations](/books/investing-and-digital-assets/blockchain-analytics).

## How the Exchanges Were Hit

The incidents with primary or filed accounts, by date:

| Date | Exchange | Lost | Path | Source of the account |
| --- | --- | --- | --- | --- |
| February 2014 | Mt. Gox | About 750,000 customer BTC and about 100,000 of its own, later about 200,000 found in an old wallet | "illegal access through the abuse of a bug in the bitcoin system," per its notice; years of losses found at once | Mt. Gox notices of February 28 and March 20, 2014 |
| January 2018 | Coincheck | About 526.3 million NEM, ¥46.6 billion | Illegal transfer; withdrawals suspended; JFSA business improvement order | Coincheck Group 20-F (2026) |
| May 31, 2024 | DMM Bitcoin | 4,502.9 BTC, about ¥48.2 billion | Attributed to North Korea; Kanto Local Finance Bureau business improvement order September 26, 2024 | Coincheck Group 20-F; Chainalysis ($305 million) |
| July 18, 2024 | WazirX | More than $230 million | A Safe multisig with five WazirX signers and one Liminal (custody provider) key; what the signers' interface showed differed from what they signed | WazirX preliminary report |
| February 21, 2025 | Bybit | About $1.5 billion | A Safe{Wallet} developer machine compromised; malicious JavaScript turned a routine transfer into a `delegatecall` | FBI PSA; Keys, Signing & Key Management |
| May 2025 | Coinbase | No crypto taken; customer data stolen; cost estimated at $180 million to $400 million | Overseas support contractors bribed to pull data, then used to socially engineer customers | Coinbase 8-K Item 1.05, May 14, 2025 |
| October 29, 2026 | Binance | About $6.34 billion impacted, about $2.85 billion frozen or intercepted | Engineer's laptop compromised through a fake job interview; internal signing service used to sign EIP-7702 authorizations over hot wallets | Binance initial findings, November 3, 2026 |

The pattern since 2024 is the one Chainalysis reports: centralized-service compromises were "88% of losses in Q1 2025," and the 2024 report found private key compromises accounted for 43.8% of stolen crypto. The money goes to large custodial targets, and the way in is the people and systems around the keys.

## The Hack Record

### Mt. Gox

Mt. Gox applied for civil rehabilitation in Tokyo on February 28, 2014, stating that "approximately 750,000 bitcoins deposited by users and approximately 100,000 bitcoins belonging to us had disappeared," against assets of ¥3.84 billion and current liabilities of ¥6.50 billion. On March 20 it reported finding about 200,000 BTC (199,999.99 BTC) in an old-format wallet used before June 2011, an exchange that didn't know which of its own wallets held coins. Rehabilitation was dismissed and bankruptcy ordered in April 2014; civil rehabilitation reopened on June 22, 2018; repayments in BTC and BCH began in 2024. On October 16, 2026 the trustee, having "largely completed" the base, early lump-sum and intermediate repayments, moved the deadline again, from October 31, 2026 to October 31, 2027, because "many rehabilitation creditors still have not received their Repayments." Twelve years after the theft, the creditors are still being paid. Every rule about knowing which wallets you hold and reconciling them daily starts here.

### Bitfinex, 2016

The 2016 theft from Bitfinex is the case that showed stolen coins can be traced and recovered years later; its figures come from US court records I couldn't open on this pass, so I give none. <!-- source-gap: bitfinex-2016 | missing | Bitfinex 2016 theft amount, the 2022 seizure and the 2023 pleas and 2024 sentencing | closes with: DOJ press releases or the D.D.C. docket for United States v. Lichtenstein | checked: 2026-11-05 -->

### Coincheck and the Japanese rules

In January 2018, Coincheck, "then under its prior management," lost "approximately 526.3 million of the NEM crypto asset, or ¥46.6 billion," which "was illegally transferred," suspended withdrawals, and was ordered by the Japan Financial Services Agency to improve its business operations; the Japan Virtual and Crypto assets Exchange Association "was established in 2018 after a hacking incident of NEM digital tokens occurred." Japan is also the jurisdiction FTX's bankruptcy report cites for an offline-storage mandate: Japanese law requires at least 95% of users' crypto to be held offline, which is why FTX's Japanese entity was the exception to its hot-wallet practice.

### DMM Bitcoin

On May 31, 2024, DMM Bitcoin announced the loss of 4,502.9 BTC, about ¥48.2 billion. The Kanto Local Finance Bureau issued a business improvement order on September 26, 2024, and on January 14, 2025 the governments of the United States, Japan and South Korea issued a joint statement on North Korean crypto theft. The FBI's attribution page for this case returned an error when I tried it, so the mechanism stays with the governments' statement. <!-- source-gap: dmm-bitcoin-mechanism | missing | the FBI, DC3 and NPA attribution of the DMM Bitcoin theft to TraderTraitor and the vendor-employee social engineering path | closes with: the FBI press release (403 on 2026-11-05) or the NPA's English release | checked: 2026-11-05 -->

### WazirX

WazirX lost more than $230 million on July 18, 2024 from a Safe multisig with six signatories, five WazirX and one Liminal, its custody and address-whitelisting provider since February 2023. Its preliminary report found a mismatch between what Liminal's interface showed the signers and what they signed: "We suspect the payload was replaced to transfer wallet control to an attacker." WazirX says the FBI traced the attack to North Korea's Lazarus group. Its recovery went through a Singapore scheme of arrangement in which creditors shared the loss; the court first declined to sanction the scheme despite creditor approval, then allowed a revote after hearings in July 2025. The mechanism is Bybit's seven months earlier, on a smaller scale: a quorum signing a payload it couldn't see.

### Bybit

Bybit's $1.5 billion loss on February 21, 2025, attributed by the FBI to North Korea's "TraderTraitor" actors, is told in [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing#bybit-february-21-2025): a compromised developer machine at the wallet vendor, JavaScript altered to target one cold wallet, and a multisig quorum approving a `delegatecall` its screens didn't show.

### Coinbase, May 2025

Coinbase disclosed on May 14, 2025 that a threat actor had obtained customer data "by paying multiple contractors or employees working in support roles outside the United States" to pull it from internal support tools: names, addresses, phone numbers and emails, masked Social Security numbers (last four digits), masked bank account numbers, government ID images, balance snapshots and transaction history, and limited corporate data. The incident "did not involve the compromise of passwords or private keys, and at no time were any of the targeted contractors or employees able to access customer funds." The actor emailed on May 11 demanding money not to publish; Coinbase didn't pay. It estimated costs of "approximately $180 million to $400 million" and said it would "voluntarily reimburse" retail customers who had been tricked into sending funds to the attacker. No wallet was touched; the data was the weapon, used to impersonate Coinbase to customers who then moved their own coins.

### Binance, October 29, 2026

Binance's initial findings, published November 3, 2026, are the most detailed public account of a large exchange hack so far:

- **The way in.** One engineer was contacted "through a legitimate job-hunting platform" and, in a second-round interview, "instructed to download an 'assignment' containing a malicious code repository." A second engineer had been compromised in June 2026 through "a tampered Homebrew installation" while looking for an AI coding tool. The attacker "leveraged the compromised computer of engineer B and used an internal AI tool"; access on that machine ran from 17:15 to 19:56 UTC on October 29.
- **The mechanism.** "The attacker exploited unauthorized access to an internal wallet signing service" and "then used the signing service to exploit Ethereum's EIP-7702 authorization mechanism," delegating hot wallet accounts to attacker code ([EIP-7702](/books/investing-and-digital-assets/wallets#eip-7702) has how a delegation works). Because the wallets were MPC, no single key could revoke the delegation at once; it was revoked at 00:10 UTC on October 30.
- **What moved.** 233.46 million XRP from five hot wallets between 20:05 and 20:09 UTC; about 970,500 SOL and 44.2 million OP from Solana and Optimism hot wallets; 18,270 BTC from a hot wallet; a final 2,961.9 ETH at 23:56 UTC. About $6.34 billion was impacted and about $2.85 billion "frozen or intercepted," subject to reconciliation.
- **Attribution.** Binance writes that the FBI's latest information "indicates that the Democratic People's Republic of Korea is responsible." As of November 5 I found no FBI release of its own on the IC3 list.
- **Customers.** "Binance will absorb the financial impact of the stolen funds, not our users"; it set aside "more than 100% of the funds required" and reported that "98% of the impacted token assets have been replenished" by October 31. It suspended withdrawals and, in its eighth recovery update on November 5, began reopening them for more assets from 04:00 UTC, prioritizing tokens "based on user demand over the past week," with deposits open throughout.

Three lessons from that account. The signing service, not the key, was the asset: an authenticated caller could get it to sign, so the policy in front of it was the real control ([Policy Engines and Quorum Approvals](/books/investing-and-digital-assets/keys-and-signing#policy-engines-and-quorum-approvals)). The transaction type was new: an EIP-7702 authorization is not a transfer, so a policy that only checked destinations and amounts would have passed it. And a hot wallet tier is a loss limit only if it is small: four minutes moved 233 million XRP, so the ceiling on each hot wallet, not detection speed, set the size of the loss on that chain.

## The Attack Paths

Grouped by where the attacker enters, each with the control that answers it:

| Path | Examples | Control |
| --- | --- | --- |
| **Key theft** | Keys in plain text or a shared secrets store (FTX's report) | Keys generated and held in HSMs, enclaves or MPC; no exportable copy |
| **Signing path compromise** | An internal signing service called with stolen credentials (Binance) | Signing policy on the decoded transaction, independent of the caller; transaction-type allowlists |
| **Interface and supply chain** | Wallet vendor JavaScript (Bybit), custody provider interface (WazirX) | Independent decoding on the signer's device; simulation on a separate stack; vendor code pinned and verified ([Supply Chain](/docs/development/dependencies#supply-chain)) |
| **Engineer endpoints** | Fake job interviews and malicious repositories, tampered package installs (Binance) | Hardware-isolated signing roles; no production access from development machines; [Just-in-Time Access and Break-Glass](/docs/security/infrastructure-access#just-in-time-access-and-break-glass) |
| **Insiders and support tooling** | Contractors bribed for data (Coinbase) | Least-privilege support views, masked data, query monitoring, BPO oversight ([Least Privilege](/docs/security/authorization#least-privilege)) |
| **Customer accounts** | Phishing, SIM swaps, impersonation of support | Withdrawal holds, allowlists with cooling periods, device binding (Account Security & Fraud) |
| **Bridges and contracts** | Bridge validator keys, contract bugs | [The Bridge Hacks](/books/investing-and-digital-assets/layer-2s-and-bridges#the-bridge-hacks); Smart Contract Risk & Exploits |

## Key and Signing Controls

[Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing#signing-services) has the signing pipeline; the exchange-specific rules on top of it:

- **Policy reads the bytes.** The signer's policy evaluates the decoded transaction: operation type, method, destination, amount, and for EVM chains whether it is a transfer, a `delegatecall`, an approval, or an EIP-7702 authorization. Anything not on an allowlist of transaction types for that wallet is denied. Hot wallets pay customers; they have no reason to sign an authorization or an approval.
- **The caller is not the authority.** A signing request from an authenticated internal service is necessary, not sufficient: the policy, the approvals for anything above a threshold, and the rate limits are enforced at the signer, which treats every caller as possibly compromised.
- **Velocity limits per wallet and window.** A hot wallet's outflow per minute and per hour has a ceiling sized to normal withdrawals; beyond it the signer stops and pages. A chain where 233 million XRP can leave in four minutes needs a ceiling counted in minutes.
- **Hot balances are a budget.** Each hot wallet holds what the next hours of withdrawals need and no more, refilled from warm and cold under quorum (Hot, Warm & Cold Wallets covers the floors and ceilings). The hot total is the loss the exchange has decided it can absorb.
- **Revocation must be fast.** Binance's note that MPC prevented immediate revocation is a design input: every delegation, approval or authorization a hot wallet could be tricked into must have a pre-planned, pre-approved reversal (a revoking transaction prepared and quorum-signed in advance, or a contract-level pause).

## Withdrawal Anomaly Detection

Customer withdrawals and treasury movements need different detectors:

- **Customer withdrawals.** Score each request on the account (new device, recent password or 2FA change, new address, recent support contact), the destination (new, high-risk exposure from screening, an address resembling a known one) and the amount (against the account's history and balance). High scores hold the withdrawal for review or require a cooling period; [Deposits & Withdrawals](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#the-checks) has the check pipeline, and On-Chain Analytics & Investigations has destination scoring.
- **Treasury outflows.** Compare each wallet's outflow per window with its baseline and with the ledger: every outbound transaction should match a withdrawal request, a rebalance or a sweep that the ledger expected. An on-chain transfer from a firm wallet with no matching instruction is an incident, immediately, whatever its size.
- **Chain watchers on your own wallets.** Watch firm addresses for any signed message or state change, not just transfers: a new delegation code on an EOA, a new approval, a changed owner on a multisig. Binance's attacker changed what the accounts were before moving funds.

A worked detector of my own: a hot wallet's normal outflow is up to 400 withdrawals an hour averaging 0.05 BTC, a 20 BTC hour at most. A ceiling of 50 BTC an hour with a 10 BTC per-transaction cap means a compromised signer can move at most 50 BTC before the signer itself stops, whatever the attacker's access, against a wallet that might hold 18,270 BTC if no ceiling existed. The ceiling costs a few minutes of delay on the rare legitimate 60 BTC hour, which is the trade worth making.

## Insiders and Support Tooling

Coinbase's incident is the template for a threat that touches no keys. Support agents need to see enough of an account to help; a bribed agent with that view, multiplied by many agents, is a dataset good enough to impersonate the company convincingly. The controls:

- **Show the minimum.** Support views mask identifiers, show balances in bands, and reveal more only for an open case, with the reason logged.
- **Watch the queries.** Alert on agents viewing accounts outside their queue, viewing many high-balance accounts, or exporting.
- **Treat outsourced support as part of the perimeter.** Contractors abroad have different hiring, monitoring and legal exposure; the access they get should be narrower, not the same.
- **Assume the data will leak.** Design customer communication so impersonation is hard: in-app messaging as the only channel that can ask for anything, and a standing message that support never asks customers to move funds.

## Account Takeover and Social Engineering

Most customers who lose crypto at an exchange lose it from their own account: a phished password and code, a SIM swap, or a call from someone posing as the exchange who talks them into moving funds to a "safe" wallet. The platform's controls are holds and friction at the moment value leaves: withdrawal address allowlists with a cooling period, a hold after any credential or device change, step-up authentication on new destinations, and warnings shown when a destination is new or risky. Account Security & Fraud covers them; the bank-side version of the same problem is Banking & Lending's [Account Takeover](/books/banking-and-lending/account-takeover-and-scams#account-takeover), and investment scams run on social platforms are User-Generated Platforms' [Crypto Investment Scams](/books/user-generated-platforms/crypto-investment-scams).

## Incident Response

The playbook's [Incident Response](/docs/operations/incident-response) applies; an exchange adds steps that have to happen in minutes:

1. **Stop the outflow.** Freeze signing on affected wallets and suspend withdrawals for affected assets; Binance's first containment measure was suspending withdrawals. Deposits can stay open (Binance kept them open) if crediting is unaffected.
2. **Revoke and rotate.** Revoke delegations and approvals, rotate keys or shares that may be exposed, and move remaining funds from affected wallets to fresh keys, which needs gas on every chain.
3. **Freeze what can be frozen.** Stablecoin issuers can freeze tokens at their contracts and other exchanges can freeze deposits from the attacker's addresses; the speed of those calls decides how much of the $2.85 billion-type figure you get back ([Freezes, Blacklists & Seizures](/books/investing-and-digital-assets/freezes-and-onchain-compliance) covers issuer freezes).
4. **Reconcile.** A full ledger-to-chain reconciliation of every wallet to establish exactly what left, from where, before any number is published.
5. **Tell people, on a clock.** Customers, regulators, law enforcement and, for a public company, a Form 8-K under Item 1.05 once the incident is determined to be material, as Coinbase filed.
6. **Reopen deliberately.** Binance's staged reopening, by asset, by demand, with deposits open, is the pattern: withdrawals return asset by asset as each wallet is re-keyed and reconciled.

## Customer Reimbursement

Who pays is decided by capital, terms and law, and the record shows every answer:

| Outcome | Example |
| --- | --- |
| The exchange absorbs the loss | Binance (2026): "Binance will absorb the financial impact"; Coinbase (2025) voluntarily reimbursing socially engineered retail customers |
| Creditors share the loss through a court process | WazirX's Singapore scheme of arrangement |
| Bankruptcy and a decade of distributions | Mt. Gox, with repayments still running to October 2027 |

An exchange that wants to be in the first row needs the capital before the incident: an emergency reserve (Binance's SAFU, an emergency fund it established in July 2018, funded by a percentage of trading fees and described by Binance as about $1 billion and held in bitcoin), crime insurance whose limits are usually far below hot wallet balances, and the balance sheet itself. The ledger side is simple and must be decided in advance: a theft is a loss in the firm's accounts, not in customers', unless the terms and a court say otherwise, so customer lines don't move and the firm posts the loss against the omnibus shortfall the day it is known.

## How to Build It

Security incidents get a record that ties every affected wallet and transfer together; treasury anomalies get their own detector output distinct from customer withdrawal checks; reimbursements are payments with their own approvals.

```sql
CREATE TABLE security_incidents (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  kind               TEXT NOT NULL CHECK (kind IN ('key_compromise', 'signing_service_compromise',
                       'supply_chain', 'insider', 'data_theft', 'account_takeover_wave',
                       'contract_exploit', 'other')),
  detected_at        TIMESTAMPTZ NOT NULL,
  contained_at       TIMESTAMPTZ,
  affected_wallets   UUID[] NOT NULL DEFAULT '{}',   -- wallets (id)
  loss_by_instrument JSONB NOT NULL DEFAULT '{}',    -- smallest units, from the reconciliation
  recovered_by_instrument JSONB NOT NULL DEFAULT '{}',
  materiality_determined_at TIMESTAMPTZ,       -- starts the 8-K clock for a public company
  case_id            UUID NOT NULL REFERENCES cases (id),
  status             TEXT NOT NULL CHECK (status IN ('open', 'contained', 'reconciled',
                       'remediated', 'closed'))
);

CREATE TABLE withdrawal_anomalies (        -- treasury-side detections, not customer checks
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  wallet_id          UUID NOT NULL REFERENCES wallets (id),
  onchain_tx_id      UUID REFERENCES onchain_transactions (id),
  rule               TEXT NOT NULL,          -- 'unmatched_outflow', 'velocity', 'new_delegation',
                                             -- 'owner_change', 'approval_granted', ...
  observed           JSONB NOT NULL,         -- amounts, window, baseline
  matched_transfer_id UUID REFERENCES transfers (id),  -- null: nothing the ledger expected
  action             TEXT NOT NULL CHECK (action IN ('alert', 'signing_frozen', 'withdrawals_suspended')),
  security_incident_id UUID REFERENCES security_incidents (id),
  detected_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_reimbursements (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  security_incident_id UUID NOT NULL REFERENCES security_incidents (id),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  instrument_id      UUID NOT NULL REFERENCES instruments (id),
  quantity           NUMERIC(78, 0) NOT NULL CHECK (quantity > 0),
  basis              TEXT NOT NULL CHECK (basis IN ('firm_loss', 'voluntary_social_engineering',
                       'court_scheme', 'insurance')),
  approved_by        UUID[] NOT NULL,
  journal_entry_id   UUID REFERENCES journal_entries (id),
  status             TEXT NOT NULL CHECK (status IN ('proposed', 'approved', 'paid', 'rejected')),
  UNIQUE (security_incident_id, account_id, instrument_id)
);
```

Notes on the sketch:

- **Every outflow matches an instruction.** A treasury reconciliation joins each firm-wallet `onchain_transactions` row to a `transfers` row the ledger created first; an unmatched outflow opens a `withdrawal_anomalies` row with `signing_frozen`, automatically.
- **Watch state, not only value.** Rules for new delegation code, approvals and owner changes run on the firm's own addresses through the chain watcher ([Chain Data & Indexing](/books/investing-and-digital-assets/chain-data-and-indexing#how-to-build-it)).
- **Losses come from the reconciliation.** `loss_by_instrument` is filled from a full reconciliation, never from the first estimate on the incident channel.
- **Reimbursement is a payment.** It posts as a firm-to-customer journal entry with approvals, so the statement, tax records and the incident record agree.
- **Events:** `security_incident.opened`, `withdrawal_anomaly.detected`, `signing.frozen`, `reimbursement.paid` through the [outbox](/docs/architecture/events#the-transactional-outbox); `signing.frozen` pages the on-call and the security lead.

## Auditing

- **Every incident** with its timeline, affected wallets, reconciled loss, recoveries and disclosures, and the clock each notice ran on.
- **Every treasury anomaly** and the action it took, including false positives.
- **Signing policies and velocity limits** per wallet, with their versions and who approved changes.
- **Access to signing systems and support tools,** with the reasons for each access and the alerts raised.
- **Every reimbursement** with its basis, approvals and payment.

## What This Means for the System You Build

- **Enforce policy at the signer** on decoded transactions, with an allowlist of transaction types per wallet; deny authorizations, approvals and `delegatecall` from hot wallets.
- **Cap hot wallets by balance and by velocity,** so the worst case is a number you chose.
- **Match every firm outflow to a ledger instruction** and freeze signing on any that doesn't match.
- **Watch your own addresses for state changes,** not just transfers.
- **Keep engineering endpoints out of signing paths** and assume developers will be targeted by fake recruiters.
- **Give support the least data that works,** monitor it, and tell customers support never asks them to move funds.
- **Pre-plan revocations and reopening,** and decide in advance, in capital and terms, who pays.

## References

**Regulators and guidance**

- [FBI: North Korea responsible for $1.5 billion Bybit hack (PSA I-022625-PSA, February 26, 2025)](https://www.ic3.gov/PSA/2025/PSA250226), attribution to TraderTraitor and the amount
- [IC3: Public service announcements](https://www.ic3.gov/PSA), the list of FBI announcements checked for a release on the October 2026 Binance incident

**Filings**

- [Coinbase Global: Form 8-K, Item 1.05 (May 14, 2025)](https://www.sec.gov/Archives/edgar/data/1679788/000167978825000094/coin-20250514.htm), the support contractors, the data taken, no keys or passwords, the extortion email, the cost estimate and voluntary reimbursement
- [Coincheck Group: Form 20-F for the year ended March 31, 2026](https://www.sec.gov/Archives/edgar/data/1913847/000162828026046005/cnck-20260331.htm), the January 2018 NEM loss, the JFSA order and the JVCEA, the DMM Bitcoin loss and order, and the January 2025 joint statement

**Courts and enforcement**

- [In re FTX Trading Ltd., First Interim Report of John J. Ray III on Control Failures (D. Del. 22-11068, Doc 1242-1, April 9, 2023)](https://storage.courtlistener.com/recap/gov.uscourts.deb.188450/gov.uscourts.deb.188450.1242.1.pdf), Japan's requirement that at least 95% of users' crypto be held offline, as the report cites it
- [Mt. Gox: Announcement of February 28, 2014](https://www.mtgox.com/img/pdf/20140228-announcement_eng.pdf), the civil rehabilitation application, assets and liabilities, and the bitcoins that disappeared
- [Mt. Gox: Announcement of March 20, 2014](https://www.mtgox.com/img/pdf/20140320-btc-announce.pdf), the about 200,000 BTC found in an old-format wallet
- [Mt. Gox Trustee: Notice of October 16, 2026](https://www.mtgox.com/img/pdf/20261016_b3a13e0f-55f6-4653-913b-be80762390e8_announcement_en.pdf), repayment status and the deadline moved to October 31, 2027
- [Mt. Gox: Trustee site](https://www.mtgox.com/), the bankruptcy and rehabilitation dates and repayments from 2024

**In practice**

- [Binance: 29 October 2026 Binance security incident, initial findings and response update (November 3, 2026)](https://www.binance.com/en/blog/community/3229153443759566763), the intrusion path, signing service and EIP-7702 mechanism, assets moved, amounts impacted and frozen, attribution and absorption of losses
- [Binance: Security incident recovery update #8 (November 5, 2026)](https://www.binance.com/en/support/announcement/detail/a225a3b6084c41dc8c8dfb33f4de5872), the staged reopening of withdrawals and open deposits
- [Binance Academy: Secure Asset Fund for Users (SAFU)](https://www.binance.com/en/academy/glossary/secure-asset-fund-for-users), the fund's establishment, funding and size as Binance describes it
- [WazirX: Preliminary report, cyber attack on WazirX multisig wallet (July 2024)](https://wazirx.com/blog/preliminary-report-cyber-attack-on-wazirx-multisig-wallet/), the loss, the multisig signers and Liminal, and the payload mismatch
- [WazirX: One year since the cyberattack](https://wazirx.com/blog/one-year-since-wazirx-cyberattack-rising-rebuilding-and-returning-stronger/), the Lazarus attribution it reports and the Singapore scheme proceedings
- [Chainalysis: Crypto hacking and stolen funds 2026 (December 18, 2025)](https://www.chainalysis.com/blog/crypto-hacking-stolen-funds-2026/), 2025 theft, North Korea's share, Bybit, service compromises and DMM Bitcoin's value
- [Chainalysis: Crypto hacking and stolen funds 2025 (December 19, 2024)](https://www.chainalysis.com/blog/crypto-hacking-stolen-funds-2025/), 2024 theft, incidents and the private key compromise share
