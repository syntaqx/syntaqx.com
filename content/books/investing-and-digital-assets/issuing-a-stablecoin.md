+++
title = "Issuing a Stablecoin"
description = "Mint and burn against wires, minter allowances, the reserve and its liquidity, monthly attestations, supply across chains, CCTP and redemption operations."
category = "Investing & Digital Assets Industry"
order = 2558
part = "Stablecoins"
tags = ["stablecoins", "issuance", "reserves", "attestations", "cctp", "reconciliation"]
+++

Issuing a stablecoin is running two ledgers that must agree to the cent at every moment: a liability ledger that lives on a dozen public chains, which anyone can read and nobody but the issuer can change, and an asset ledger of Treasury bills, repo, fund shares and bank deposits at custodians that only the issuer and its accountants see. A mint adds the same amount to both; a redemption removes it from both; a transfer between holders, or between chains, touches neither. Everything an issuer builds is in service of keeping those two equal and proving it: an onboarding gate in front of minting, a wire matched to every mint, contract roles that bound what a stolen key can create, a reserve that can be turned into cash faster than holders can ask for it, a supply count across every chain, and a monthly report an accountant can examine and an officer must sign.

This chapter is the machine. The economics it serves are in [The Stablecoin Business](/books/investing-and-digital-assets/stablecoin-business), the statute and rules that set its numbers in [Stablecoin Law](/books/investing-and-digital-assets/stablecoin-law), the contract's freeze and blacklist functions in [Freezes, Blacklists & Seizures](/books/investing-and-digital-assets/freezes-and-onchain-compliance), and what happens when the machine is tested by a run in [Depegs, Runs & Synthetic Dollars](/books/investing-and-digital-assets/depegs-and-synthetic-dollars). A single dollar's path through it is traced in [The Life of a Stablecoin Dollar](/books/investing-and-digital-assets/investing-business#the-life-of-a-stablecoin-dollar).

## How the Platforms Do It

How the main issuers mint, redeem and hold the reserve, from their own pages and filings, as of November 2026:

| Issuer | Who mints and redeems directly | Fees and minimums | Reserve | Reporting |
| --- | --- | --- | --- | --- |
| **Circle (USDC, EURC)** | Institutions onboarded to Circle Mint (identity verification, KYC, sanctions screening, suitability) | Minting free; basic redemption free and initiated within two business days; standard redemption initiated nearly instantly for a nominal fee | About 88% of USDC reserves in the Circle Reserve Fund (a 2a-7 government money market fund managed by BlackRock, only for Circle, custody at BNY), the rest cash at large banks; EURC reserves all cash | Holdings disclosed weekly; monthly assurance by a Big Four firm |
| **Tether (USDT)** | Verified customers | $150 verification; 0.1% to acquire; the greater of $1,000 or 0.1% to redeem; $100,000 minimum either way | $132.4B of Treasury bills, direct and indirect, of $191.5B total assets (September 30, 2026) | Quarterly attestation by BDO; circulation typically daily |
| **Paxos (PYUSD, USDG, USDP)** | Paxos's institutional customers; PayPal users buy and sell PYUSD one to one in PayPal and Venmo | No PayPal fee to buy, sell or hold PYUSD | Dollar deposits, Treasuries and cash equivalents (PYUSD) | Issuer reports per token |
| **Ripple (RLUSD)** | Ripple's institutional customers | Not documented publicly | Cash deposits, Treasuries and government money market funds in segregated accounts; BNY primary custodian | Monthly attestations |
| **Anchorage Digital Bank (USAT, for Tether)** | Anchorage is the issuer, under OCC supervision | Not documented publicly | Cantor Fitzgerald as reserve custodian and primary dealer | Not documented publicly |

The pattern: **direct minting and redemption is wholesale.** Only onboarded institutions meet the issuer; everyone else buys and sells on exchanges, and the price there stays at a dollar only because those institutions can arbitrage any gap against the issuer. A redemption window that is free, fast and reliable is what holds the peg for people who will never use it.

## Mint on Deposit

An issuance is a wire matched to an on-chain mint, with a gate on each side.

1. **Onboarding.** The customer passes the issuer's KYC, sanctions screening and suitability review. Circle Mint collects entity, ownership and operations information and reviews business type and anticipated minting volume. Under the GENIUS Act the issuer is a financial institution for Bank Secrecy Act purposes, so this is a full customer identification and due diligence program, not a sign-up form ([KYC and Account Opening](/books/banking-and-lending/kyc-and-account-opening)).
2. **Instruction.** The customer asks for an amount on a chain, to an address it has registered. The request gets an idempotency key and a reference the wire must carry.
3. **Funds in.** The customer wires dollars to the issuer's account at a settlement bank. Circle's 10-K describes the flow: verified customers wire fiat to a Circle bank account and USDC is minted to their Circle Mint account. Nothing is minted until the dollars have arrived and been matched, because a mint against an unfunded promise is an unbacked token.
4. **Mint.** A minter key calls the token contract's mint function for the amount, to the customer's address. In Circle's FiatToken design only a configured minter can mint, only up to its remaining allowance, and never while the contract is paused or to or from a blacklisted address.
5. **Book.** One journal entry with two balanced sets: dollars received into the reserve's cash account against a holder liability, and tokens minted against the same liability in token units. The liability is now on both ledgers.

The wire and the mint are separate systems with separate failures. A wire can arrive without a reference, arrive short, or be recalled; a mint transaction can fail, sit in the mempool or, before finality, be reorganized away. The issuance request is the record that joins them, and its state machine is in How to Build It below.

### Minter Allowances

The token contract limits damage from a compromised minting key. In FiatToken, a **master minter** role calls `configureMinter` to authorize a minter and set its `minterAllowance`; each `mint` reduces the allowance by the amount minted; `burn` does not restore it; and `removeMinter` sets the allowance to zero. Circle's design document says the allowance exists "to limit the damage if any particular `minter` is compromised," that minters are "vetted by Circle before they are allowed to create new tokens," and that Circle will "periodically reset the `minterAllowance` as long as a `minter` remains in good standing." Circle controls the address of every role.

Sizing the allowance is an operational trade-off. Too small and minting stalls on a busy day until someone with the master minter key raises it; too large and a stolen minter key creates that many unbacked tokens before anyone notices. My rule: size each minter's allowance to a few hours of expected gross minting on its chain, top it up from a separately controlled master minter on a schedule and on alarms, and alert on any mint that has no matching issuance request, because the chain will show it before the reconciliation does. Key custody for those roles is the volume's Keys, Signing & Key Management chapter.

### Worked Numbers: An Allowance on a Busy Day

My illustration, using Circle's third-quarter 2026 gross minting of $104 billion as the scale. Spread evenly over 92 days, that is about $1.13 billion a day across all chains. Suppose one chain carries 40% of it, $452 million a day, and its minter's allowance is set to four hours of that, about $75 million, topped up every four hours.

| Event | Allowance remaining |
| --- | --- |
| 08:00 top-up | $75.0M |
| Three customer mints of $10M, $25M, $30M by 10:30 | $10.0M |
| 10:45 request for $40M | Fails: allowance short. Alarm; the request waits |
| 10:50 master minter raises allowance by $75M (dual approval) | $85.0M |
| 10:51 $40M mint succeeds | $45.0M |

The worst case for a stolen minter key at 08:00 is $75 million of unbacked tokens, not the day's $452 million; the cost is a five-minute wait for one customer. A burn of redeemed tokens at 11:00 changes nothing above, because burning never restores an allowance.

## The Reserve

The reserve is the asset side, and the statute decides what may be in it. Under the GENIUS Act a permitted issuer holds identifiable reserves at least one to one in US coins and currency and Federal Reserve balances, demand deposits at insured institutions, Treasuries with 93 days or less remaining to maturity, overnight repo and reverse repo backed by Treasuries, government money market funds investing only in those, other similarly liquid federal government assets its regulator approves, and tokenized forms of the same (12 U.S.C. 5903(a)(1)). It may not pledge, rehypothecate or reuse reserves except to meet margin on permitted investments, for standard custody, or to raise liquidity for redemptions through repo that is centrally cleared or regulator-approved (5903(a)(2)). The OCC's final rule for the issuers it supervises adds at least 5% in on-demand deposits or Federal Reserve balances and a 40% cap on exposure to any single counterparty (with exclusions for US government exposures, qualifying custodial exposures and centrally cleared repo), and requires stress tests including significant rate rises. [Stablecoin Law](/books/investing-and-digital-assets/stablecoin-law) has the full rule set.

Inside those limits the issuer manages three things:

- **Liquidity against redemption.** Deposits and overnight repo are cash today; a money market fund redeems same day under normal conditions; a Treasury bill is cash at maturity or when sold. The reserve is a ladder, and the question it answers is how much can be paid out in one business day, two, and five without selling at a loss.
- **Counterparties.** Bank deposits above the insurance limit are unsecured claims on the bank. USDC's weekend in March 2023, when $3.3 billion of its reserve sat at Silicon Valley Bank, is the case ([Depegs, Runs & Synthetic Dollars](/books/investing-and-digital-assets/depegs-and-synthetic-dollars)). After it, Circle moved most of its reserve into a fund that holds Treasuries and repo and kept the cash at a handful of the largest banks.
- **Rate risk.** A bill bought at 3.5% and held as rates rise is worth less than par until it matures; the 93-day maturity limit keeps that small, and the OCC's stress testing asks the issuer to show it.

Circle's structure is the model the statute largely codified: a single-client government money market fund, the Circle Reserve Fund (USDXX), managed by BlackRock and custodied at BNY, holding cash, short-dated Treasuries and overnight Treasury repo with daily third-party portfolio reporting, beside cash at large banks. Its March 2025 agreement with BlackRock commits at least 90% of its US-managed fiat USDC reserves, excluding bank deposits, to BlackRock-managed products for four years. The fund wrapper gives the issuer a professional manager, daily liquidity and a portfolio the SEC's money market fund rules already constrain; the cost is the manager's fee, which the Coinbase agreement deducts before splitting income ([The Coinbase Agreement](/books/investing-and-digital-assets/stablecoin-business#the-coinbase-agreement)).

### Worked Numbers: A Reserve Ladder Under the OCC Rule

My illustration: an OCC-supervised issuer with $10 billion outstanding, in reserve at par plus a small excess.

| Bucket | Amount | Cash available | Constraint it meets |
| --- | --- | --- | --- |
| Demand deposits at three banks ($200M, $150M, $150M) | $500M | Same day | The 5% on-demand floor; no bank above 40% of reserves |
| Overnight Treasury repo, centrally cleared | $1,500M | Next morning | Liquidity for redemptions; excluded from the counterparty cap |
| Government money market fund | $4,000M | Same day, normal conditions | A single fund is one counterparty unless it qualifies as custodial; 40% cap at $4,000M |
| Treasury bills maturing within 30 days | $2,000M | Rolling maturities, or sale | 93-day limit |
| Treasury bills maturing in 31 to 93 days | $2,010M | Sale | 93-day limit |
| **Total** | **$10,010M** | | One to one at all times, $10M excess |

If $1 billion is presented for redemption in one day (10% of outstanding, the level at which the OCC rule requires notice within 24 hours), the issuer pays the first $500 million from deposits and the rest from the repo maturing next morning, inside the two-business-day standard, without selling a bill. A $3 billion week takes the deposits, the repo and part of the fund. A $6 billion week reaches the bills and sells some before maturity, which is when rate risk turns into a realized loss and the $10 million excess matters. Separately from the reserve, the OCC rule requires an operational backstop of highly liquid assets equal to 12 months of total expenses: an issuer spending $60 million a year holds $60 million apart from the reserve, up to half of it funded with qualifying subordinated debt.

## Attestations and Reports

An issuer proves the two ledgers agree with a report and an accountant's examination of it, and the words matter.

- **An attestation** is an accountant's examination of management's assertions, for example that reserves at a point in time were at least equal to tokens outstanding, under attestation standards (AICPA in the US, ISAE 3000 internationally). It covers what was asserted on the dates tested. Tether's quarterly BDO report and Circle's monthly Big Four reports are attestations.
- **An audit** is an opinion on a set of financial statements, covering the whole company: its other liabilities, related-party transactions, going concern. Circle, as an SEC registrant, files audited statements; the GENIUS Act requires audited annual statements, with related-party disclosure, from any issuer with more than $50 billion outstanding that doesn't already report to the SEC (5903(a)(10)).

What the regimes require of the monthly report:

| Regime | What is published | Who examines | Extra |
| --- | --- | --- | --- |
| **GENIUS Act** | Each month on the issuer's website: total tokens outstanding, the amount and composition of reserves, with the average tenor and geographic location of custody for each category | A registered public accounting firm examines each month-end report | CEO and CFO certify monthly; a knowingly false certification carries the penalties of 18 U.S.C. 1350(c) |
| **OCC final rule** | Monthly public reserve reports | As above | Weekly confidential reports and quarterly financial condition reports to the OCC |
| **NYDFS guidance (2022)** | Management's assertions about the reserve's market value, units outstanding and adequacy | An independent CPA approved by DFS, at least monthly, testing the last business day and at least one randomly selected business day | Public and to DFS within 30 days; an annual internal controls attestation within 120 days |

The random day in New York's version is the best idea in the table: a reserve that is whole on the last day of every month and short on the 17th passes every month-end test. An issuer that builds its reserve report as a query that can run for any day, not a month-end process, passes the random day by construction.

## Supply Across Chains

USDC on ten chains is one instrument and ten asset networks ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)), and the issuer's liability is the sum. The supply side of the reconciliation is therefore a sum over contracts read at a point in time:

- **Native deployments.** Each chain's contract reports a total supply. The issuer reads each one at a recorded block (or slot, or ledger sequence) and sums them.
- **Tokens the issuer holds itself.** If an issuer mints ahead of demand into its own address, those tokens are inventory, not a liability to anyone, and the reconciliation must subtract them explicitly. Circle's approach is to mint on demand to a customer, which avoids the question; an issuer that pre-mints must count and report its treasury addresses.
- **Frozen balances.** Tokens at blacklisted addresses are still on chain and still a liability; Circle's 10-K counts $116.8 million of "access denied tokens" at December 31, 2025, excluded from circulation, with their reserves moved to a segregated bank account ([Freezes, Blacklists & Seizures](/books/investing-and-digital-assets/freezes-and-onchain-compliance)).
- **Bridged copies are not supply.** A token locked in a bridge on one chain and represented by a wrapped token on another is counted once, on the chain where the issuer's contract holds it; the wrapped token is someone else's liability. Circle says bridged `USDC.e` on X Layer "is not issued or backed by Circle" ([What a Payment Stablecoin Is](/books/payments/stablecoins#what-a-payment-stablecoin-is)).

The reconciliation compares that sum with the liability in the issuer's ledger and the reserve at custodians, at one moment. Chains don't share a clock, so "one moment" is a set of block heights chosen to be at or before the same timestamp, recorded with the result.

### Cross-Chain Transfers: CCTP

Moving a native token between chains without a bridge's wrapped copy means burning on one chain and minting on the other. Circle's Cross-Chain Transfer Protocol does it in three steps: the sender calls `depositForBurn` on the source chain's `TokenMessengerV2`, which burns the USDC and emits a message through `MessageTransmitterV2`; after enough confirmations Circle's attestation service, Iris, signs the message; anyone holding the attestation submits it to `receiveMessage` on the destination chain, which mints. Each message carries a nonce that "can only be used once on the destination domain," assigned by Circle off chain.

Two speeds, two risks:

- **Standard Transfer** waits for finality on the source chain (a `minFinalityThreshold` of 2000, "finalized"): about 15 to 19 minutes on Ethereum and its rollups, with a 0 basis point fee. The source burn can't be reorganized away before the destination mint exists.
- **Fast Transfer** attests at a lower threshold (1000, "confirmed") and arrives in about 8 to 20 seconds, for a fee of 1 basis point from Ethereum or Solana and more on some chains (13 from Linea as of November 2026), deducted from the amount minted. Iris attests before the source burn is final, so a reorganization could leave a minted token with no burn behind it; Fast Transfers work "by leveraging Circle's Fast Transfer allowance," which integrators can query and which can run low, at which point they should fall back to Standard.

For supply accounting the consequence is a window: between the burn and the mint, the tokens exist on neither chain. Total supply read across chains in that window is lower than the liability by the amount in flight. The issuer's reconciliation adds burned-but-unminted messages (by nonce) back to supply, and alarms on any that stay unminted past a threshold. In the Fast case, it carries the minted-before-final amount as an exposure against the allowance until the source burn finalizes. Bridges, wrapped tokens and their failures in general are the volume's Layer 2s, Bridges & Cross-Chain chapter; finality per chain is in the Payments volume's [How It Moves](/books/payments/stablecoins#how-it-moves).

### Worked Numbers: A Supply Reconciliation at 16:00

My illustration, an issuer with three native deployments, reading each chain at the last block before 16:00:00 UTC.

| Line | Amount |
| --- | --- |
| Chain A total supply | 6,200,000,000 |
| Chain B total supply | 2,450,000,000 |
| Chain C total supply | 1,340,000,000 |
| Sum of on-chain supply | 9,990,000,000 |
| Less: issuer treasury addresses | 0 (mint on demand) |
| Plus: burns attested, mints not yet received (14 messages) | 12,500,000 |
| Supply for reconciliation | 10,002,500,000 |
| Ledger liability to holders (including frozen) | 10,002,500,000 |
| Reserve at fair value | 10,012,000,000 |
| Excess | 9,500,000 |

If the burned-but-unminted line were left out, the reconciliation would show the liability 12.5 million above supply, a break that is really timing. If a mint appears on chain C with no issuance request and no matching burn message, supply rises above the ledger, and that break is the alarm the minter allowance exists to bound.

## Redemption Operations

A redemption is issuance in reverse, with a promise of time:

1. **Request.** An onboarded customer asks to redeem an amount to its registered bank account. The GENIUS Act requires a published redemption policy with "clear and conspicuous procedures for timely redemption," fees disclosed in plain language and changed only on seven days' notice (5903(a)(1)(B)); the OCC's final rule defines timely as no later than two business days after the issuer receives the request from an onboarded customer, complete when the issuer initiates the outgoing transfer or credits the customer's account. New York's guidance is the same T+2.
2. **Tokens in.** The customer sends the tokens to the issuer's redemption address on any supported chain, or the issuer debits tokens already in its custody (Circle Mint balances).
3. **Checks.** Screening of the customer and, for on-chain deposits, the sending address. The OCC rule lets an issuer decline where redeeming would violate other law, such as sanctions or the Bank Secrecy Act; Circle's terms condition redemption on no pending action by a regulator, law enforcement or a court that would restrict it.
4. **Burn.** A minter burns the tokens (in FiatToken only a minter can burn, and only tokens it holds). Liability falls on chain.
5. **Wire out.** Dollars leave the reserve's cash account to the customer's bank. Liability and reserve fall together in the ledger.

The clock runs from step 1, not step 5, so the operations that matter are the ones that make cash available in two business days: the ladder above, settlement banks that can wire on the day, and enough bank relationships that one bank's cutoff or outage doesn't stop redemptions. Circle's 10-K notes its settlement banks provide multiple rails, including 24/7 funds flow where available; a wire queued on Friday evening is still a Monday payment on the Fedwire calendar ([The Banking Calendar](/books/payments/treasury#the-banking-calendar)). The OCC rule's 24-hour notice when redemptions exceed 10% of outstanding issuance in a day is a reporting trigger, not a gate; the issuer may ask for an extension and the OCC may grant, deny or limit it.

Minimums and fees shape who uses the window. Tether's $100,000 minimum and fee of the greater of $1,000 or 0.1% mean that redeeming $1 million costs $1,000 and redeeming $100,000 costs $1,000 too, 1%. Circle's free basic redemption and fee-bearing near-instant redemption price speed rather than access. Neither changes the holder's legal claim; both change how quickly arbitrage closes a gap on an exchange.

## Institutional Onboarding

The direct customer list is short, deliberate and the issuer's real distribution: exchanges, market makers, payment companies, fintechs and banks. Onboarding is a business account opening with crypto additions: the entity and its owners, the business model and expected volumes, the bank accounts it will wire from and to (verified as its own), and the blockchain addresses it will mint to and redeem from, registered in advance so that a mint never goes to an address the issuer hasn't seen. Circle Mint's onboarding covers entity, ownership and operations information, identity verification, KYC, sanctions screening and suitability. The registered addresses are also the issuer's best evidence in a dispute about where tokens went, and the place its Travel Rule and screening obligations begin (AML & the Travel Rule for Crypto, a later chapter of this volume, covers them).

## How to Build It

These extend [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model). An issuance or a redemption is a `transfers` row on the customer's account (one wire, one on-chain leg) plus a request that joins them; the reserve is a set of holdings at custodians; supply is a reading per asset network.

```sql
CREATE TABLE issuance_requests (             -- a wire matched to a mint
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),       -- the onboarded customer
  asset_network_id     UUID NOT NULL REFERENCES asset_networks (id), -- coin on the chosen chain
  to_address           TEXT NOT NULL,         -- a registered address of the customer
  amount               NUMERIC(78, 0) NOT NULL CHECK (amount > 0),   -- token smallest units
  fiat_amount          BIGINT NOT NULL,       -- minor units expected on the wire
  wire_reference       TEXT NOT NULL UNIQUE,  -- what the incoming wire must carry
  funding_transfer_id  UUID REFERENCES transfers (id),   -- the wire in
  mint_transfer_id     UUID REFERENCES transfers (id),   -- the on-chain mint out
  minter_allowance_id  UUID,                  -- which minter's allowance it used
  status               TEXT NOT NULL CHECK (status IN ('requested', 'funded', 'minting',
                         'minted', 'final', 'rejected', 'returned')),
  idempotency_key      TEXT NOT NULL UNIQUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  final_at             TIMESTAMPTZ
);

CREATE TABLE redemption_requests (           -- tokens in, burn, wire out, on a clock
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  asset_network_id     UUID REFERENCES asset_networks (id),          -- null: from a platform balance
  amount               NUMERIC(78, 0) NOT NULL CHECK (amount > 0),
  fee                  BIGINT NOT NULL DEFAULT 0,                    -- minor units, per the policy
  redemption_policy_id UUID,                  -- the published policy version (Stablecoin Law)
  received_at          TIMESTAMPTZ NOT NULL,  -- the regulatory clock starts here
  due_at               TIMESTAMPTZ NOT NULL,  -- two business days later, on the bank calendar
  tokens_transfer_id   UUID REFERENCES transfers (id),   -- tokens in
  burn_tx_id           UUID REFERENCES onchain_transactions (id),
  payout_transfer_id   UUID REFERENCES transfers (id),   -- the wire out
  status               TEXT NOT NULL CHECK (status IN ('received', 'tokens_received',
                         'held', 'burned', 'paid', 'rejected')),
  hold_reason          TEXT,                  -- 'screening', 'legal_order', 'bank_details', ...
  initiated_at         TIMESTAMPTZ,           -- outgoing transfer initiated: redemption complete
  idempotency_key      TEXT NOT NULL UNIQUE
);

CREATE TABLE minter_allowances (             -- each minter role per network, append-only
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  asset_network_id     UUID NOT NULL REFERENCES asset_networks (id),
  minter_address       TEXT NOT NULL,
  configured_amount    NUMERIC(78, 0) NOT NULL,  -- what configureMinter set
  configured_tx_id     UUID NOT NULL REFERENCES onchain_transactions (id),
  approved_by          TEXT[] NOT NULL,       -- the approvers of the master minter call
  valid_from           TIMESTAMPTZ NOT NULL,
  superseded_at        TIMESTAMPTZ,
  removed              BOOLEAN NOT NULL DEFAULT FALSE
);
ALTER TABLE issuance_requests ADD FOREIGN KEY (minter_allowance_id)
  REFERENCES minter_allowances (id);

CREATE TABLE reserve_holdings (              -- the asset ledger at custodians, per day
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  issuer_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  backs_instrument_id  UUID NOT NULL REFERENCES instruments (id),   -- the coin it backs
  as_of                DATE NOT NULL,
  category             TEXT NOT NULL CHECK (category IN ('currency', 'fed_balance',
                         'demand_deposit', 'treasury_bill', 'repo', 'reverse_repo',
                         'government_mmf', 'tokenized', 'other')),
  counterparty         TEXT NOT NULL,         -- the bank, fund, repo counterparty or CCP
  custodian            TEXT NOT NULL,
  custody_location     TEXT NOT NULL,         -- reported monthly under GENIUS
  cusip                CHAR(9),               -- bills and fund shares
  maturity_date        DATE,                  -- null for deposits and fund shares
  par_amount           BIGINT NOT NULL,       -- minor units
  fair_value           BIGINT NOT NULL,
  liquidity_days       SMALLINT NOT NULL,     -- business days to cash in normal conditions
  encumbered           BOOLEAN NOT NULL DEFAULT FALSE,  -- only for the statute's exceptions
  source_ref           TEXT NOT NULL,         -- the custodian or fund statement line
  UNIQUE (issuer_entity_id, backs_instrument_id, as_of, counterparty, custodian, cusip)
);

CREATE TABLE supply_by_network (             -- total supply read from each contract
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  asset_network_id     UUID NOT NULL REFERENCES asset_networks (id),
  read_at              TIMESTAMPTZ NOT NULL,  -- the common cutoff for this reconciliation
  block_number         BIGINT NOT NULL,       -- or slot or ledger sequence
  block_hash           TEXT NOT NULL,
  total_supply         NUMERIC(78, 0) NOT NULL,
  issuer_held          NUMERIC(78, 0) NOT NULL DEFAULT 0,   -- treasury inventory, not liability
  frozen               NUMERIC(78, 0) NOT NULL DEFAULT 0,   -- still liability, reported apart
  in_flight_out        NUMERIC(78, 0) NOT NULL DEFAULT 0,   -- burned here, not yet minted there
  reconciliation_id    UUID REFERENCES reconciliations (id),
  UNIQUE (asset_network_id, read_at)
);
```

The issuance request's states:

| From | To | When |
| --- | --- | --- |
| `requested` | `funded` | The wire with the request's reference has settled for the full amount |
| `requested` | `rejected` | Screening fails or the wire never arrives by the request's expiry |
| `funded` | `minting` | The mint transaction is signed and broadcast against a minter's allowance |
| `minting` | `minted` | The mint is included in a block |
| `minted` | `minting` | A reorganization dropped the block; rebroadcast with the same idempotency key |
| `minted` | `final` | The chain's finality rule is met; the journal entry posts |
| `funded` | `returned` | The mint can't be completed (address now blacklisted, customer offboarded); the wire is returned |

Design notes:

- **Fund, then mint, then post.** The liability posts once, at `final`, keyed by the request, so a reorganized mint posts nothing and a retried one posts once ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)).
- **The redemption clock is a column.** `due_at` is computed from `received_at` on the bank calendar at the moment the request arrives, and a job alarms on every request near it, because the regulator counts from receipt, not from when operations got to it.
- **Allowances are history.** `configureMinter` sets an allowance, it doesn't add to it, so the table stores each configuration and the chain is the source for what remains; an alert compares the allowance consumed on chain with the issuance requests that used it.
- **The reserve is a daily query.** `reserve_holdings` for any date, grouped by category, counterparty and custodian, is the monthly report, the OCC's counterparty and on-demand tests, and the liquidity ladder; the random-day examination is the same query on another date.
- **Reconcile three ways.** For each coin and cutoff: on-chain supply (from `supply_by_network`, net of issuer-held, plus in-flight) equals the holder liability in `journal_lines` equals or is less than the reserve at fair value. A `reconciliations` row with source `issuer` records it, and every difference is a `recon_breaks` row with an owner.

## Auditing

- **Every mint matched to a wire,** and every burn to a redemption, with the request, the transactions, the finality status at which the issuer acted and the journal entry.
- **Every allowance change,** who approved it and the transaction that set it, and every mint that consumed it.
- **Reserve holdings for every day,** tied to custodian and fund statements, so the monthly report and any randomly chosen day can be reproduced and examined.
- **Supply readings with block heights** for every reconciliation, including in-flight cross-chain messages by nonce and frozen balances.
- **Every redemption against its clock,** with received, due and initiated times, any hold and its legal basis, and the notices sent when redemptions exceeded 10% of outstanding in a day.
- **The signed monthly certification** for each report, with the report and the examination it certified.

## What This Means for the System You Build

- **Two ledgers, one invariant:** on-chain supply equals holder liability, and the reserve is at least that, at any moment you choose to check.
- **Never mint against a promise.** The wire settles and is matched before the mint is signed.
- **Bound every minting key** with an allowance sized to hours, refilled by a separately controlled role, with an alarm on any unmatched mint.
- **The reserve is a liquidity ladder,** built to pay a large day from deposits and repo without selling bills, and recorded daily by category, counterparty and custodian.
- **Report from a query, not a process,** so any day, not just month end, can be examined.
- **Count supply per chain at a recorded block,** subtract issuer inventory, add burns in flight, and treat bridged copies as someone else's liability.
- **The redemption clock starts at receipt** and lives on the request as a due time.

## References

**Law and regulation**

- [12 U.S.C. 5903: Requirements for issuing payment stablecoins](https://www.law.cornell.edu/uscode/text/12/5903), eligible reserves, rehypothecation limits, the redemption policy and fee notice, monthly reports with tenor and custody location, accountant examination, CEO and CFO certification, and audited statements above $50 billion
- [OCC: Implementing the GENIUS Act (91 FR 67000, October 23, 2026)](https://www.federalregister.gov/api/v1/documents/2026-21706.json), the final rule's citation and January 18, 2027 effective date

**Regulators and guidance**

- [Mayer Brown: OCC finalizes GENIUS Act rulemaking](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking), the 5% on-demand floor, the 40% counterparty cap and its exclusions, stress testing, the operational backstop, two-business-day redemption and when it is complete, the 10% notice, and weekly, monthly and quarterly reports
- [NYDFS: Guidance on the issuance of US dollar-backed stablecoins (June 8, 2022)](https://www.dfs.ny.gov/industry_guidance/industry_letters/il20220608_issuance_stablecoins), T+2 redemption, permitted reserve assets, monthly CPA examination including a random business day, publication within 30 days and the annual controls attestation

**Filings**

- [Circle Internet Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000062/crcl-20251231.htm), Circle Mint onboarding, fees and redemption timing, the wire-to-mint flow, settlement banks, the Circle Reserve Fund, the BlackRock agreement, EURC's cash reserves and access denied tokens
- [Circle Internet Group: Third quarter 2026 results (November 4, 2026)](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000309/finalq3epr-110326.htm), $104 billion minted and redeemed in the quarter

**Standards and protocols**

- [Circle: FiatToken design (stablecoin-evm)](https://raw.githubusercontent.com/circlefin/stablecoin-evm/master/doc/tokendesign.md), the owner, master minter, minter, pauser, blacklister and rescuer roles, `configureMinter`, `removeMinter`, allowances and their resets, mint and burn rules and the proxy upgrade path
- [Circle: CCTP overview](https://developers.circle.com/cctp), burn-and-mint transfers, Fast and Standard timing, hooks and the non-USDC token service
- [Circle: CCTP technical guide](https://developers.circle.com/cctp/technical-guide), `depositForBurn`, `MessageTransmitterV2`, Iris attestations, `receiveMessage`, finality thresholds 1000 and 2000, fees and nonces
- [Circle: CCTP fees](https://developers.circle.com/cctp/concepts/fees), the 0 basis point Standard fee, Fast Transfer fees by source chain and the Fast Transfer allowance

**Vendor documentation**

- [Circle: Transparency and stability](https://www.circle.com/transparency), the Circle Reserve Fund's holdings, daily reporting via BlackRock, weekly disclosure and monthly assurance
- [Tether: Fees](https://tether.to/en/fees/), verification, acquisition and redemption fees and the $100,000 minimum
- [Tether: Q3 2026 attestation release (October 30, 2026)](https://tether.io/news/tether-generates-1-5-billion-in-q3-net-operating-profit-as-reserve-buffer-doubles-to-almost-8-billion/), total assets, Treasury bill exposure and BDO
- [PayPal: What is PayPal USD (PYUSD)?](https://www.paypal.com/us/cshelp/article/what-is-paypal-usd-pyusd-help1005), Paxos as issuer, backing and buying and selling one to one
- [Ripple: RLUSD](https://ripple.com/solutions/stablecoin/), reserve assets, segregated accounts, BNY and monthly attestations

**In practice**

- [Decrypt: Tether launches USAT issued by Anchorage Digital (January 27, 2026)](https://decrypt.co/356045/tether-launches-us-regulated-stablecoin-issued-anchorage-digital), Anchorage as issuer and Cantor Fitzgerald as reserve custodian
