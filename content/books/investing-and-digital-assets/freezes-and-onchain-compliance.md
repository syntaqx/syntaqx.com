+++
title = "Freezes, Blacklists & Seizures"
nav_title = "Freezes & Blacklists"
description = "How issuers freeze stablecoins: blacklist functions in USDC and USDT, OFAC and Tornado Cash, seizures and reissuance, GENIUS duties, the exchange side."
category = "Investing & Digital Assets Industry"
order = 2560
part = "Stablecoins"
tags = ["stablecoins", "sanctions", "freezes", "law-enforcement", "smart-contracts", "compliance"]
+++

A fiat-backed stablecoin is a bearer token with a landlord. Anyone holding the key to an address can move the tokens in it, and no bank stands between sender and recipient, but the issuer wrote the token contract and kept a function in it that stops a given address from sending or receiving. Pulled, it turns the address's balance into a number the chain still displays and nobody can spend. Some contracts also let the issuer destroy the frozen balance and, separately, mint the same amount to someone else. That is the stablecoin's answer to a court order, a sanctions designation and a hack, and it is why a stolen stablecoin is often recoverable when stolen bitcoin almost never is.

It is also the property the GENIUS Act now requires: a permitted issuer must have the technical capability to block, freeze and reject transactions that violate law and may issue only if it can comply with lawful orders to seize, freeze, burn or prevent transfer. This chapter is how those functions work in the contracts, when issuers use them, what the law requires, how a freeze, a burn and a reissuance are recorded, and what an exchange or custodian has to do when a token in its wallets, or arriving at them, is frozen. Sanctions screening as a program is in the Banking & Lending volume's [Sanctions Screening](/books/banking-and-lending/sanctions-screening); screening wallet addresses at a payment provider is the Payments volume's [Screening Wallets and Addresses](/books/payments/stablecoins#screening-wallets-and-addresses).

## How the Platforms Do It

The freeze tools in the largest tokens' contracts and terms, as of November 2026:

| Token | On-chain control | Who decides | Destroy and reissue | Published policy |
| --- | --- | --- | --- | --- |
| **USDC (Circle)** | `blacklist` / `unblacklist` by a blacklister role; `pause` halts all transfers, mints and burns; upgradeable proxy | Circle, under its USDC terms and blocklisting policy, and on legal orders | No destroy function in the FiatToken design; frozen tokens stay outstanding as "access denied tokens" ($116.8M at December 31, 2025) | USDC terms section 13: Circle may block addresses, and freeze USDC at addresses it custodies, that it determines "in its sole discretion, may be associated with illegal activity" |
| **USDT (Tether, Ethereum)** | `addBlackList` / `removeBlackList`; `destroyBlackFunds` zeroes a blacklisted balance and reduces total supply | Tether, under its terms, on government direction, and voluntarily for SDN-listed wallets since December 2023 | Yes: burn the frozen balance, reissue to the victim or the government | Tether terms: freeze "as required by applicable Law or where Tether, in its sole discretion, determines it is prudent to do so" |
| **USDS (Sky)** | Not described on the token's developer page, which documents an upgradeable (UUPS) contract | Sky governance | Not documented | n/a |
| **USDe (Ethena)** | No freeze function documented in the pages cited; minting is by whitelisted users and Ethena can reject mint orders | Ethena | Not documented | n/a |

The split that matters: **fiat-backed issuers freeze; protocol stablecoins mostly can't, or haven't said.** A token without a freeze function cannot meet the GENIUS Act's technical capability requirement, which is one of the reasons crypto-collateralized and synthetic dollars sit outside the payment stablecoin regime ([Depegs, Runs & Synthetic Dollars](/books/investing-and-digital-assets/depegs-and-synthetic-dollars)).

## The Contract Controls

### USDC: Blacklist and Pause

Circle's FiatToken has a **blacklister** role that calls `blacklist(address)` and `unblacklist(address)`. A blacklisted address cannot transfer, receive, mint or burn; since version 2.2 it can still call `approve` and `permit`, but cannot move assets. A **pauser** role calls `pause`, which prevents "all transfers, minting, burning, and adding minters" for every address at once, while blacklisting, removing minters, changing roles and upgrading keep working so the issuer can fix what made it pause. A **rescuer** can move other ERC-20 tokens accidentally sent to the token contract itself. Circle controls every role's address. There is no function that seizes a balance: a blacklisted USDC balance stays on the chain, counted in total supply, until Circle unblacklists it or upgrades the contract.

### USDT: Blacklist and Destroy

Tether's original Ethereum contract (`TetherToken`, written for Solidity `^0.4.17`) keeps a public mapping `isBlackListed`, and the owner calls `addBlackList(address)` and `removeBlackList(address)`. `transfer` requires `!isBlackListed[msg.sender]` and `transferFrom` requires `!isBlackListed[_from]`, so a blacklisted address can't send (the check is on the sender, not the recipient). `destroyBlackFunds(address)`, callable only by the owner and only on a blacklisted address, sets its balance to zero and subtracts it from `_totalSupply`, emitting `DestroyedBlackFunds`. Burning the frozen balance and minting the same amount to a new address is how Tether "reissues" tokens to victims and to the government.

The difference has consequences for the issuer's books. A frozen USDC balance remains a liability with reserves behind it, which Circle moves to a segregated bank account and keeps in the reserve; the liability is extinguished only when the funds go to the relevant authority or the denial is reversed and the holder redeems. A destroyed USDT balance is no longer outstanding; if it is reissued, a new liability appears to the new holder.

### What a Freeze Can't Do

- **It acts on an address, not a person.** A freeze stops one address; funds moved before it are beyond it, which is why speed decides outcomes (below).
- **It can't reach other tokens.** Freezing USDC does nothing to ETH or to another issuer's coin at the same address, and a thief who swaps into a token without a freeze function in a decentralized exchange is beyond it.
- **It needs the contract to have the function.** A bridged or wrapped copy issued by a bridge, not the issuer, carries the bridge's contract, which may have no freeze at all.
- **It is a governance key.** The blacklister and owner roles are keys like any other, and their custody, approvals and logging are as important as the minter's ([Minter Allowances](/books/investing-and-digital-assets/issuing-a-stablecoin#minter-allowances)).

## When Issuers Freeze

Three triggers, in the issuers' own terms.

**Legal orders.** Circle "may also be required to freeze USDC and/or surrender associated USD held in Segregated Accounts" when it "receives a legal order from a valid government authority requiring it to do so." Tether freezes "when Tether is directed to do so by any Government" or when tokens are "subject to pending litigation, investigation, or Government proceedings," and reserves the right to "seize and deliver your property to any applicable Government, law enforcement, or other authorities," with reports to authorities possibly made "without providing any notice to you."

**Sanctions.** Circle's terms say "Applicable laws require us to prevent Restricted Persons from holding USDC using USDC Services." On December 9, 2023 Tether announced "a new voluntary wallet-freezing policy designed to combat activity connected with Sanctioned persons," extending to the secondary market "the Sanctions controls it already enforces for wallets on its platform," including "freezing wallets previously added to the SDN List."

**The issuer's own judgment.** Circle may block addresses it determines "in its sole discretion, may be associated with illegal activity or activity that otherwise violates these Terms," and a holder sending to or receiving from a blocked address "may forfeit any rights associated with your USDC, including the ability to redeem USDC for USD." Tether "reserves the right to bar transactions ... for any reason (or for no reason) at any time." Neither issuer's terms set out an appeal process for a frozen holder beyond contacting support; Circle conditions redemption on no pending action by "a regulator, law enforcement or a court of competent jurisdiction that would restrict redemption."

## OFAC and Tornado Cash

The case that defined the practice. On August 8, 2022, OFAC designated Tornado Cash, an Ethereum mixing protocol, under the cyber sanctions order (E.O. 13694), saying it had been used to launder more than $7 billion since 2019, including over $455 million stolen by North Korea's Lazarus Group, more than $96 million from the Harmony bridge theft and at least $7.8 million from Nomad. The designation listed Ethereum addresses, including the protocol's smart contracts. Circle froze the USDC at the listed addresses the same day, at least 75,000 USDC per block explorer data at the time, telling The Block that "Circle is a regulated company and conforms to sanctions compliance requirements."

The legal question was whether code could be sanctioned. In *Van Loon v. Department of the Treasury* (No. 23-50669, 5th Cir., November 26, 2024), the Fifth Circuit held that "Tornado Cash's immutable smart contracts (the lines of privacy-enabling software code) are not the 'property' of a foreign national or entity, meaning (1) they cannot be blocked under IEEPA, and (2) OFAC overstepped its congressionally defined authority," because they "are not capable of being owned," and reversed with instructions to grant summary judgment under the Administrative Procedure Act. On March 21, 2025 Treasury removed the sanctions, saying it had "exercised [its] discretion" after reviewing "novel legal and policy issues." The lesson for an issuer is narrower than the headlines: an SDN listing of an address controlled by a sanctioned person still requires blocking, and Circle's and Tether's freezes of sanctioned persons' addresses continue; what *Van Loon* removed was OFAC's power to block immutable code nobody owns. Holding and reporting blocked virtual currency (within 10 business days, then annually) is in the Payments volume's [Screening Wallets and Addresses](/books/payments/stablecoins#screening-wallets-and-addresses), and a platform's sanctions exposure when its customers use protocols is in [DeFi from a Regulated Platform](/books/investing-and-digital-assets/defi-from-a-regulated-platform#sanctions-exposure).

## Seizure, Burn and Reissue

A freeze stops the money; a seizure moves it to the government, and with a reissuing issuer it moves without the thief's key. The court record of one case shows the mechanics. In *United States v. Approximately 225,364,961 USDT* (No. 25-cv-1907, D.D.C., complaint June 18, 2025), a civil forfeiture action over proceeds of cryptocurrency confidence scams with over 430 suspected victims, the complaint says the Secret Service received a report in November 2023 from Tether, working with OKX, of "approximately $250 million dollars in USDT traceable to cryptocurrency confidence scams," that "On or around November 20, 2023, USSS requested that Tether voluntarily freeze approximately 225 million USDT," and describes balances held "before the tokens were burned and reissued pursuant to their seizure." The sequence is the one the contract supports: blacklist the addresses, destroy the frozen balances, mint the same amount to an address the government controls, and litigate forfeiture from there.

The same tool works in hours when the theft is fresh. After the theft from Binance on October 29, 2026, which Tether's release says the FBI has attributed to North Korea, Tether said it froze more than $1.5 billion of USDT "within 30 minutes," and that its cumulative freezes reached "more than 7 billion USD₮ in secondary market addresses (including the Binance freezes)," with about 1.2 billion USDT obtained through fraud and theft returned; that as of October 31, 2026 it had helped freeze more than 3,590 wallets holding about 1.6 billion USDT with the DOJ, the Secret Service and the FBI; and that it works with more than 360 law enforcement agencies across 73 countries. These are Tether's own figures, published November 2, four days after the theft; the incident is the volume's [Exchange Security & Hacks](/books/investing-and-digital-assets/exchange-security) chapter.

### Worked Numbers: Freeze, Burn, Reissue

My illustration of the ledger effects at a reissuing issuer, for 10,000,000 tokens frozen at a thief's address and later forfeited.

| Step | On chain | Issuer's ledger | Reserve |
| --- | --- | --- | --- |
| Before | Thief's address holds 10,000,000; total supply S | Liability S | At least S |
| Blacklist | Balance unchanged, untransferable; supply S | Liability S, of which 10,000,000 restricted | Unchanged |
| Destroy | Thief's balance 0; supply S − 10,000,000 | Liability to the thief's address extinguished; 10,000,000 held as an obligation under the legal order | Unchanged; 10,000,000 now earmarked |
| Reissue to the government's address | Government's address holds 10,000,000; supply S | Liability S, the 10,000,000 now owed to the government | Unchanged |
| Government redeems | Burned; supply S − 10,000,000 | Liability S − 10,000,000 | Falls by 10,000,000 |

The reserve never moves until someone redeems: a freeze and a reissuance change only who the liability is owed to, and the issuer's supply reconciliation must carry the destroyed-but-not-reissued balance as a liability in the gap between the two transactions, or the books will show an excess reserve that belongs to a victim. At a non-destroying issuer like Circle, the table stops at the second row until the order is resolved; the access denied tokens line is that balance, $116.8 million at the end of 2025 against $91.8 million a year earlier.

## What the GENIUS Act Requires

The duties, from the codified text:

- **Capability.** A permitted issuer must have "technical capabilities, policies, and procedures to block, freeze, and reject specific or impermissible transactions that violate Federal or State laws, rules, or regulations" (12 U.S.C. 5903(a)(5)(A)(iv)), and "may issue payment stablecoins only if the issuer has the technological capability to comply, and will comply, with the terms of any lawful order" (5903(a)(6)(B)).
- **What a lawful order is.** A final and valid writ, process, order, rule, decree or command under federal law, from a court or an authorized federal agency, that "requires a person to seize, freeze, burn, or prevent the transfer of payment stablecoins issued by the person," "specifies the payment stablecoins or accounts subject to blocking with reasonable particularity," and is "subject to judicial or administrative review or appeal as provided by law" (5901(16)).
- **Sanctions at issuance.** Treasury coordinates with issuers so they can "effectively block a payment stablecoin of the foreign person upon issuance," and "is not required to notify any permitted payment stablecoin issuer of any intended action" (5903(a)(6)(A)).
- **Foreign issuers.** A digital asset service provider may not offer a foreign issuer's coin unless the issuer "has the technological capability to comply and complies with the terms of any lawful order"; Treasury may designate a noncompliant foreign issuer, and if it isn't compliant 30 days after notice, publish the determination and prohibit providers from "facilitating secondary trading" in its coins, effective 30 days later, with civil penalties of up to $100,000 per violation per day for a knowing violation (5907).

FinCEN and OFAC's proposed program rule for permitted issuers (91 FR 18582, April 10, 2026, comments closed June 9, 2026; a new 31 CFR part 1033) would make it operational. It would require internal controls to block, freeze and reject applicable transactions; it defines secondary market activity as activity not involving the issuer except through a smart contract, such as "an individual sending payment stablecoins from a self-hosted wallet to a vendor"; it does not propose that issuers monitor secondary market activity or file suspicious activity reports on it; and it does propose secondary market "policies and procedures to block, freeze, and reject impermissible transactions" and "technical capabilities to comply, and complying, with the terms of lawful orders." As of November 5, 2026 it is a proposal; the OCC's final rule left BSA and sanctions standards to separate rulemaking, this one and the OCC's own June 2026 proposal for the issuers it supervises (91 FR 37840).

## What the Issuer and the Exchange Each Do

The issuer controls the contract; the exchange controls its customers' accounts and its own wallets. Each has a job when a freeze happens.

**The issuer:**

- Receives the order, verifies it is a lawful order (court or agency, particularity, reviewable), and records it.
- Calls the blacklist function from a controlled key, with approval, and verifies the transaction is final.
- Records the frozen amount as restricted, moves its reserves where its policy requires (Circle's segregated account), and keeps it in the supply reconciliation.
- Destroys and reissues, or surrenders dollars, only when the order says so, and redeems for whoever ends up entitled.
- Releases with `unblacklist` when an order is vacated or a designation removed, as OFAC did for Tornado Cash.

**The exchange or custodian:**

- **Screens before it sweeps.** A deposit from a sanctioned or stolen-funds address that reaches an omnibus hot wallet mixes tainted tokens with everyone's. Screen the sending address on arrival, hold the deposit at its deposit address until it clears, and only then sweep ([Screening Wallets and Addresses](/books/payments/stablecoins#screening-wallets-and-addresses); deposit flows are in [Deposits & Withdrawals](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals)).
- **Treats a hit as blocked property, not a refund.** Sanctioned funds are held so that no one can access them and reported to OFAC; the exchange doesn't send them back ([Blocking, Rejecting and Reporting](/books/banking-and-lending/sanctions-screening#blocking-rejecting-and-reporting)).
- **Freezes its own ledger, too.** A law enforcement request for a customer's balance is legal process against the account, handled like a bank's restraint ([Freezes, Setoff and Holds](/books/banking-and-lending/legal-process#freezes-setoff-and-holds)): place a hold on the ledger balance, and if the tokens were already swept into an omnibus wallet there is nothing for the issuer to freeze on chain, so the exchange is the only control.
- **Watches for freezes of its own addresses.** An issuer blacklisting one of the exchange's wallets freezes every customer's tokens in it. Monitor the issuer contracts' blacklist events (in Tether's contract, `AddedBlackList`) for every address the exchange controls, alarm immediately, suspend withdrawals of that token from that wallet, and move the ledger's omnibus line for that wallet to suspense until resolved, so customer balances aren't shown as spendable when they aren't.
- **Delists when the law says so.** From July 18, 2028 a provider may not offer a non-permitted coin, and a noncompliant foreign issuer's coin can be barred from secondary trading on 30 days' notice; the process is [Listing & Delisting Assets](/books/investing-and-digital-assets/listing-assets).

## How to Build It

These extend [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) and reuse the Payments volume's `address_screenings` for every screening decision ([How to Build It](/books/payments/stablecoins#how-to-build-it)). An order is a `cases` row with a clock; each address it names becomes a freeze; any destroy-and-reissue is its own record linked to both on-chain transactions.

```sql
CREATE TABLE freeze_orders (                 -- the instruction behind a freeze
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id              UUID NOT NULL REFERENCES cases (id),   -- clock, owner, outcome
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  source               TEXT NOT NULL CHECK (source IN ('court_order', 'agency_order',
                         'sanctions_designation', 'law_enforcement_request',
                         'issuer_policy', 'incident_response')),
  authority            TEXT NOT NULL,         -- court and docket, agency, OFAC program
  reference            TEXT NOT NULL,         -- order or SDN entry identifier
  lawful_order         BOOLEAN NOT NULL,      -- meets 12 U.S.C. 5901(16)
  directs              TEXT[] NOT NULL CHECK (directs <@ ARRAY['freeze', 'burn',
                         'reissue', 'surrender_fiat', 'prevent_transfer', 'release']),
  document_ref         TEXT NOT NULL,
  received_at          TIMESTAMPTZ NOT NULL,
  vacated_at           TIMESTAMPTZ
);

CREATE TABLE address_freezes (               -- one address frozen on one network
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  freeze_order_id      UUID NOT NULL REFERENCES freeze_orders (id),
  asset_network_id     UUID NOT NULL REFERENCES asset_networks (id),
  address              TEXT NOT NULL,
  ours                 BOOLEAN NOT NULL DEFAULT FALSE,   -- one of our own wallets' addresses
  account_id           UUID REFERENCES accounts (id),    -- the customer, if known
  frozen_amount        NUMERIC(78, 0) NOT NULL,          -- balance at the freeze block
  freeze_tx_id         UUID REFERENCES onchain_transactions (id),   -- issuer: our call
  observed_tx_id       UUID REFERENCES onchain_transactions (id),   -- exchange: the issuer's event
  screening_id         UUID,                  -- Payments' address_screenings, where one triggered it
  status               TEXT NOT NULL CHECK (status IN ('requested', 'frozen', 'destroyed',
                         'released')),
  frozen_at            TIMESTAMPTZ,
  released_at          TIMESTAMPTZ,
  release_tx_id        UUID REFERENCES onchain_transactions (id),
  UNIQUE (asset_network_id, address, freeze_order_id)
);

CREATE TABLE reissuances (                   -- destroy at one address, mint to another
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  address_freeze_id    UUID NOT NULL REFERENCES address_freezes (id),
  freeze_order_id      UUID NOT NULL REFERENCES freeze_orders (id),   -- the order directing it
  amount               NUMERIC(78, 0) NOT NULL CHECK (amount > 0),
  destroy_tx_id        UUID NOT NULL REFERENCES onchain_transactions (id),
  recipient            TEXT NOT NULL,         -- victim, government or claimant
  recipient_address    TEXT NOT NULL,
  mint_tx_id           UUID REFERENCES onchain_transactions (id),     -- null until minted
  journal_entry_id     UUID REFERENCES journal_entries (id),
  status               TEXT NOT NULL CHECK (status IN ('destroyed', 'reissued', 'redeemed')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Design notes:

- **The order, not the transaction, is the record of authority.** Every blacklist call references a `freeze_orders` row; a freeze with no order behind it is an incident, and the key that made it is the first thing to check.
- **Frozen is a liability state.** The supply reconciliation in [Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin#supply-across-chains) reads frozen balances from `address_freezes` and destroyed-not-reissued amounts from `reissuances`, so neither shows up as excess reserve.
- **Watch your own addresses.** An exchange's chain watcher subscribes to the issuer contracts' freeze events and matches them against `addresses`; a hit on an `ours` address pages someone and moves that wallet's omnibus line to suspense.
- **Release is a transition, not a deletion.** A vacated order produces a `released` freeze with the unblacklist transaction, and the history stays ([Append-Only Records](/docs/money/payment-states#append-only-records)).

## Auditing

- **Every freeze with its authority:** the order or designation, when it arrived, who verified it was a lawful order, who approved the contract call and the transaction that made it.
- **Every frozen, destroyed and reissued amount,** reconciled to the issuer's supply and liability on the day it happened and at every month end.
- **Response time,** from order receipt to on-chain freeze, because speed is what an incident response or a regulator measures.
- **Blocked property reports** and their dates, for sanctions freezes.
- **Releases,** with the event that justified each.
- **At the exchange:** every freeze event observed on its own addresses, the hold placed on the ledger, and the customer communications.

## What This Means for the System You Build

- **A freeze is a governance key,** held and approved like the minter key, logged against an order every time.
- **Know your contract.** Blacklist-only (USDC) and blacklist-and-destroy (USDT) produce different books; model both.
- **Frozen tokens are still owed** to someone; keep them in supply and liability until an order says otherwise.
- **Speed matters,** so keep the path from a law enforcement call to a confirmed on-chain freeze measured in minutes, with the approvals pre-arranged.
- **At an exchange, screen before sweeping** and watch every one of your own addresses for an issuer's freeze event.
- **Expect the rule to tighten:** GENIUS requires the capability now, and FinCEN's proposal would extend freeze policies to the secondary market.

## References

**Law and regulation**

- [12 U.S.C. 5901: Definitions](https://www.law.cornell.edu/uscode/text/12/5901), the definition of lawful order in paragraph (16)
- [12 U.S.C. 5903: Requirements for issuing payment stablecoins](https://www.law.cornell.edu/uscode/text/12/5903), the capability to block, freeze and reject, coordination with Treasury on sanctions, and issuing only with capability to comply with lawful orders
- [12 U.S.C. 5907: Anti-money laundering protections](https://www.law.cornell.edu/uscode/text/12/5907), foreign issuers' compliance with lawful orders, noncompliance designations, the secondary trading prohibition and penalties
- [FinCEN and OFAC: Permitted payment stablecoin issuer AML/CFT and sanctions program requirements (91 FR 18582, April 10, 2026)](https://www.federalregister.gov/api/v1/documents/2026-06963.json), the proposal's docket, comment date and part 1033
- [FinCEN and OFAC proposal, full text](https://www.federalregister.gov/documents/full_text/html/2026/04/10/2026-06963.html), block, freeze and reject controls, the definition of secondary market activity, no secondary market monitoring or SARs, and secondary market freeze policies and lawful order capability
- [OCC: AML/CFT and sanctions risk management for permitted issuers, proposed rule (91 FR 37840, June 24, 2026)](https://www.federalregister.gov/api/v1/documents/2026-12692.json), the OCC's own pending BSA and sanctions proposal

**Courts and enforcement**

- [Van Loon v. Department of the Treasury, No. 23-50669 (5th Cir. November 26, 2024)](https://www.ca5.uscourts.gov/opinions/pub/23/23-50669-CV0.pdf), immutable smart contracts are not property and cannot be blocked under IEEPA
- [United States v. Approximately 225,364,961 USDT, No. 25-cv-1907 (D.D.C.), verified complaint](https://www.justice.gov/usao-dc/media/1403996/dl?inline=), over 430 suspected victims, Tether's report of about $250 million traceable to confidence scams, the Secret Service's freeze request of November 20, 2023, and tokens burned and reissued on seizure

**Regulators and guidance**

- [Treasury: Sanctions on Tornado Cash (August 8, 2022)](https://home.treasury.gov/news/press-releases/jy0916), the designation under E.O. 13694, more than $7 billion laundered and the Lazarus, Harmony and Nomad amounts
- [Treasury: Tornado Cash delisting (March 21, 2025)](https://home.treasury.gov/news/press-releases/sb0057), removal of the sanctions in Treasury's discretion

**Filings**

- [Circle Internet Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000062/crcl-20251231.htm), access denied tokens of $116.8 million and $91.8 million, their segregated reserves and when the liability is extinguished

**Standards and protocols**

- [Circle: FiatToken design (stablecoin-evm)](https://raw.githubusercontent.com/circlefin/stablecoin-evm/master/doc/tokendesign.md), the blacklister, pauser and rescuer roles, what blacklisting and pausing prevent, and version 2.2's change to approvals
- [Tether: TetherToken.sol](https://raw.githubusercontent.com/tethercoin/USDT/master/TetherToken.sol), `isBlackListed`, `addBlackList`, `removeBlackList`, `destroyBlackFunds` and the sender checks in `transfer` and `transferFrom`
- [Sky: USDS developer documentation](https://developers.skyeco.com/protocol/tokens/usds/), the upgradeable UUPS contract and DAI to USDS conversion

**Vendor documentation**

- [Circle: USDC terms](https://www.circle.com/legal/usdc-terms), blocked addresses and forfeited funds, legal orders, restricted persons and conditions on redemption
- [Tether: Terms of service](https://tether.to/en/legal/), freezing on law, prudence and government direction, blacklisting, seizure and delivery to authorities, and barring transactions
- [Tether: New policy to strengthen ecosystem security (December 9, 2023)](https://tether.io/news/tether-introduces-new-policy-to-strengthen-ecosystem-security), the voluntary secondary market freezing policy for SDN-listed wallets
- [Tether: Freezes over $1.5 billion from the Binance hack (November 2, 2026)](https://tether.io/news/tether-freezes-over-1-5-billion-from-binance-hack-keeping-funds-out-of-north-koreas-reach/), the company's figures on the October 2026 freezes, the FBI attribution as Tether reports it, cumulative freezes, funds returned and agencies
- [Ethena: Minting USDe](https://docs.ethena.fi/technical-design/minting-usde.md), the ability to reject mint orders
- [Ethena: How USDe works](https://docs.ethena.fi/overview/how-usde-works.md), minting by whitelisted users

**In practice**

- [The Block: Circle freezes USDC in Tornado Cash's sanctioned wallets (August 2022)](https://www.theblock.co/post/162172/circle-freezes-usdc-funds-in-tornado-cashs-us-treasury-sanctioned-wallets), at least 75,000 USDC frozen and Circle's statement
