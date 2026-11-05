+++
title = "DeFi from a Regulated Platform"
nav_title = "DeFi from a Platform"
description = "Self-custody wallets and DEX trading at regulated platforms, swap APIs, screening contracts, the repealed DeFi broker rule, sanctions and disclosures."
category = "Investing & Digital Assets Industry"
order = 2566
part = "Decentralized Finance"
tags = ["defi", "dex", "self-custody", "compliance", "sanctions", "disclosures"]
+++

The large regulated platforms now offer DeFi to retail customers. Coinbase reports DEX trading integrated into its app with access to "over 20 million assets," Robinhood ships a self-custody wallet that swaps through DEX aggregators on ten networks, and a dozen other wallets and brokers do some version of the same. Each one is putting a regulated company's brand, app and support line in front of contracts it doesn't control, counterparties it can't identify, and tokens nobody has listed. The question every such product answers, explicitly or by accident, is which parts are the platform's responsibility and which are the customer's.

The answer is built from a few design choices. Who holds the keys decides whether the platform is a custodian with ledger liabilities or a software provider. Which contracts the app will route to decides what risk the platform is underwriting. Which addresses and tokens it screens decides its sanctions exposure. And what it tells the customer, before each swap and in its terms, decides who bears a loss when a pool, a token or a signature goes wrong. This chapter covers how the platforms offer self-custody wallets and DEX trading, swap APIs and aggregators with the fees worked through, screening contracts and counterparties, the IRS DeFi broker rule and its 2025 repeal, sanctions exposure after Tornado Cash, and the disclosures. It adds DEX routes and contract screenings to [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business. The wallet itself is [A Regulated Platform's Self-Custody Wallet](/books/investing-and-digital-assets/wallets#a-regulated-platform-s-self-custody-wallet); pools, quotes and slippage are [DEXs & AMMs](/books/investing-and-digital-assets/dexs-and-amms); contract review is [Smart Contract Risk & Exploits](/books/investing-and-digital-assets/smart-contract-risk); sanctions screening in general is Banking & Lending's [Sanctions Screening](/books/banking-and-lending/sanctions-screening).

## How the Platforms Do It

From their filings and help centers, as of November 2026:

| Platform | Product | How swaps are sourced | Fees as published | Chains |
| --- | --- | --- | --- | --- |
| **Coinbase** | DEX trading integrated in the Coinbase app; the Base App (formerly Coinbase Wallet) with "wallet, onchain trading, payments, social" | DEX integration on Base, extended to Solana by "integrating Jupiter to enable trading of newly created tokens" | Not sourced here (help pages refused the fetcher) | Solana added through Jupiter; the company says it supports "60+ blockchains" overall |
| **Robinhood Wallet** | "a self-custody wallet," where "you hold the private keys to your assets" | "via 0x API and LI.FI, decentralized exchange (DEX) aggregators," trying a market maker first, then AMMs; some Solana swaps powered by Jupiter | 0.80% same-chain, 0.73% cross-chain, plus 0x at 0.05% and LI.FI at 0.05% same-chain or 0.12% cross-chain; network fees on top | Ethereum, Bitcoin, Solana, Dogecoin, Arbitrum, Polygon, Optimism, Binance Smart Chain, Base and Robinhood Chain |
| **0x Swap API** (a provider) | Aggregated quotes and transactions for apps | "150+ sources" | The integrator sets its own fee, 0 to 1,000 bps | Many EVM chains |
| **Uniswap Labs** | Interface, wallet and API over Uniswap pools and UniswapX | Uniswap pools, UniswapX fillers | A November 10, 2025 governance proposal would set Labs' interface, wallet and API fees to zero | Ethereum and many L2s |

Coinbase's first-quarter 2026 earnings presentation reported "$450M+ in cumulative volume" for DEX trading and "2x Q/Q growth in DEX Trading Volume driven by our native integration in Coinbase app." <!-- source-gap: coinbase-dex-fees | missing | Coinbase's fee for DEX trades in the Coinbase app and the aggregators it routes through on Base | closes with: Coinbase help center DEX trading article or a filing that states the fee (help.coinbase.com and coinbase.com blog returned 403 to the fetcher) | checked: 2026-11-05 --> <!-- source-gap: uniswap-interface-fee | status | whether the UNIfication proposal passed and Uniswap Labs' interface fee is now zero | closes with: the executed governance proposal or Uniswap Labs' support page on interface fees | checked: 2026-11-05 --> Coinbase's DEX trading fee and the outcome of Uniswap's fee proposal aren't stated here because neither could be confirmed from a primary page.

## Two Models

A platform offers DeFi in one of two shapes, and almost every rule in this chapter follows from which:

- **The customer's own wallet.** The customer holds the keys (on a device, or in an embedded wallet whose shares the platform can't use alone), signs every swap, and owns the tokens on chain. The platform provides software, quotes and routing, and may charge a fee inside the transaction. Its ledger holds nothing for the customer: self-custody balances "are never customer liabilities in `journal_lines`" ([A Regulated Platform's Self-Custody Wallet](/books/investing-and-digital-assets/wallets#a-regulated-platform-s-self-custody-wallet)). Robinhood's wallet is this shape, and its support pages say so in the first sentence.
- **DEX access from a custodial account.** The customer's balance is a liability on the platform's ledger; when the customer buys a long-tail token "from a DEX," the platform (or its affiliate) executes on chain from a wallet it controls and credits the customer's account. The platform is now the counterparty or agent for the customer's trade, holds a token it didn't list through its normal process, and owes the customer that token in custody, with everything custody implies ([Omnibus Custody](/books/investing-and-digital-assets/crypto-exchange-architecture#omnibus-custody); [Listing & Delisting Assets](/books/investing-and-digital-assets/listing-assets)).

The second model is a listing decision made per trade, at scale, by software. Its risks are the custodian's: a token that is later found to be a security, a token with a blacklist that freezes the omnibus wallet, a token whose contract can mint without limit. A platform choosing it needs automated token checks ([Nonstandard Tokens](/books/investing-and-digital-assets/tokens-and-standards#nonstandard-tokens); [Freeze and Blacklist Functions](/books/investing-and-digital-assets/tokens-and-standards#freeze-and-blacklist-functions)) that run before the first customer buys, not after.

## Swap APIs and Aggregators

### The integration

Behind most platform swap buttons is an aggregator API. The flow for a self-custody swap:

1. **Indicative price** while the customer types (0x's `/swap/allowance-holder/price`).
2. **Firm quote** when they review: the route, the expected and minimum outputs, every fee, and a transaction ready to sign (`/swap/allowance-holder/quote`, whose response "includes a full 0x order, ready for submission to the network"). Robinhood describes the two kinds a customer sees: guaranteed rates locked for 30 seconds before refreshing, and estimated rates that refresh continually.
3. **Approval, if needed,** to the allowance target the quote names, which the platform checks against its pinned list for that provider and chain. 0x's own warning: approve the AllowanceHolder, "do not approve the Settler contract."
4. **Checks:** the route's pools and contracts against the platform's approved list, the tokens against its token screens, the destination against sanctions lists ([Screening Contracts and Counterparties](#screening-contracts-and-counterparties)).
5. **Signature** in the wallet, with the decoded transaction and simulated balance changes shown ([Approval Phishing, Drainers and Address Poisoning](/books/investing-and-digital-assets/wallets#approval-phishing-drainers-and-address-poisoning)).
6. **Private submission** by default ([Private Order Flow](/books/investing-and-digital-assets/oracles-and-mev#private-order-flow)), then tracking to finality and recording the execution against the quote.

A failed swap still costs the customer: Robinhood's help center says "Even if a swap fails, you will still be responsible for network fees," and a failed cross-chain swap may return a different token or amount than was sent.

### Worked numbers: what a $1,000 swap costs

A customer swaps $1,000 of USDC for ETH in Robinhood Wallet, on the fee schedule Robinhood publishes.

| Cost | Same-chain via 0x | Cross-chain via LI.FI |
| --- | --- | --- |
| Robinhood Wallet fee | 0.80% = $8.00 | 0.73% = $7.30 |
| Provider fee | 0x 0.05% = $0.50 | LI.FI 0.12% = $1.20 |
| Published fees together | **$8.50** (0.85%) | **$8.50** (0.85%) |
| Network fee | Variable, paid in the chain's native asset; first-time token approvals add one | Variable, on both chains |
| Inside the route | Pool fees and price impact, in the quoted output | Pool fees, price impact and bridge costs, in the quoted output |
| Exposure to slippage | Up to the maximum slippage the customer accepts | The same |

Against a custodial simple buy, where the cost is a spread and a fee inside one quoted price ([Worked numbers: what a $1,000 buy costs](/books/investing-and-digital-assets/crypto-trading-products#worked-numbers-what-a-1-000-buy-costs)), a DEX swap's cost is split across four or five parties, and only some of it is known before signing. The disclosure on the review screen has to show the platform's fee, the provider's fee, an estimate of the network fee, the expected output and the minimum, in the customer's terms.

## Screening Contracts and Counterparties

A custodial exchange screens a withdrawal address once. A DEX swap touches a router, one or more pools, possibly a hook or a bridge, two token contracts and a recipient, and each is a place the platform can be routing customers into harm. What gets screened, and against what:

| Object | Screen | Source of truth |
| --- | --- | --- |
| **Token contracts** | Resolved by contract address to a known token, or flagged as unlisted; mint, blacklist, pause, fee-on-transfer and proxy powers; spoofed symbol | The platform's token register ([How to Build It](/books/investing-and-digital-assets/tokens-and-standards#how-to-build-it) in Tokens & Token Standards) |
| **Pools, routers, hooks, bridges** | On the approved list with a current review of the deployed code hash | `contract_risk_reviews` ([Smart Contract Risk & Exploits](/books/investing-and-digital-assets/smart-contract-risk#how-to-build-it)) |
| **Allowance targets** | Exactly the provider's published contract for that chain | Pinned per provider and chain |
| **Recipient and counterparty addresses** | Sanctions lists, exposure to sanctioned or stolen funds, known drainer contracts | Analytics providers and OFAC lists ([Screening Wallets and Addresses](/books/payments/stablecoins#screening-wallets-and-addresses)) |
| **The customer's own wallet** | Exposure scoring on its history, like a deposit address | [On-Chain Analytics & Investigations](/books/investing-and-digital-assets/blockchain-analytics) |

Two points distinguish this from screening a payment. First, most of what a swap touches is code, not a person, and code has no nationality; the question for a contract is whether it is safe and whether it is itself sanctioned, not who owns it. Second, the screen has to run in the quote path, in milliseconds, against a route the aggregator chose; a route that includes an unapproved pool is rejected and requoted with that pool excluded, not shown with a warning.

## The DeFi Broker Rule and Its Repeal

The IRS's 2024 rules would have pulled DeFi front ends into broker reporting. T.D. 10021, "Gross Proceeds Reporting by Brokers That Regularly Provide Services Effectuating Digital Asset Sales," published December 30, 2024 (89 FR 106928) and effective February 28, 2025, required those brokers to "file information returns and furnish payee statements" on gross proceeds; in its words, "the only DeFi participants that should be treated as brokers are trading front-end service providers." It never took effect in practice. Congress disapproved it under the Congressional Review Act: H.J.Res. 25 passed the House on March 11, 2025 and the Senate on March 26, and was signed as **Public Law 119-5 on April 10, 2025**. On July 11, 2025 Treasury and the IRS published a "CRA Revocation" (90 FR 30825) removing the rule from the Code of Federal Regulations and restoring the prior text, since under the resolution the rule has no force or effect.

What that leaves, as of November 2026:

- **Custodial platforms are still brokers.** The June 2024 final regulations, which "apply to brokers that take possession of the digital assets being sold by their customers," are unaffected: Form 1099-DA gross proceeds for transactions from January 1, 2025 and basis for certain transactions from January 1, 2026 ([Crypto Tax](/books/investing-and-digital-assets/crypto-tax#the-broker-s-side)). A custodial account's DEX-sourced trades are the platform's trades and are reported like any other.
- **Self-custody swaps through a front end have no broker reporting.** The IRS's page on the June 2024 rules says they "do not include reporting requirements for brokers commonly known as decentralized or non-custodial brokers." The platform has no 1099-DA obligation for a swap the customer signs from their own wallet, and the customer still owes tax on it. A platform that offers a transaction history export helps the customer and doesn't create a reporting obligation by doing so.
- **The disapproval constrains a replacement.** Under 5 U.S.C. 801(b)(2), a disapproved rule "may not be reissued in substantially the same form" unless "specifically authorized by a law enacted after the date of the joint resolution," so DeFi broker reporting would need legislation.

## Sanctions Exposure

The Tornado Cash sequence, told from the issuer's side in [OFAC and Tornado Cash](/books/investing-and-digital-assets/freezes-and-onchain-compliance#ofac-and-tornado-cash), is the precedent for any platform that routes customers into contracts. OFAC designated the mixer on August 8, 2022, naming the protocol's smart contract addresses; on November 26, 2024 the Fifth Circuit held in *Van Loon v. Department of the Treasury* (No. 23-50669) that its "immutable smart contracts ... cannot be blocked under IEEPA"; and on March 21, 2025 Treasury announced it had "exercised our discretion to remove the economic sanctions against Tornado Cash," while saying it "will continue to monitor closely any transactions that may benefit malicious cyber actors or the DPRK" and that "U.S. persons should exercise caution before engaging in transactions that present such risks."

What a platform takes from that sequence:

- **Persons and their addresses are sanctionable; immutable code, per the Fifth Circuit, is not.** A mutable contract controlled by a designated person is still that person's property, and an address on the SDN list is blocked whatever it is. The court's holding is binding in the Fifth Circuit only.
- **Screening runs on every address the platform facilitates a transfer to or from,** including the counterparties of a swap where they are identifiable (a pool is a contract; the recipient is a person). A route that pays out to a sanctioned address is the platform's problem whether or not the platform held the funds ([Blocking, Rejecting and Reporting](/books/banking-and-lending/sanctions-screening#blocking-rejecting-and-reporting)).
- **Exposure travels.** Tokens received from a mixer or from a hack are still traced to their source, and a customer whose self-custody wallet received them may find the platform's custodial side refusing the deposit. The wallet product should show that risk before the customer interacts, not after.

## Disclosures

Every DeFi product needs disclosures that a custodial trade doesn't, and they belong both in the terms and on the screen at the moment they matter:

- **Custody and protection.** The customer holds the keys; the platform can't recover lost keys or reverse transfers. Protections that apply to the custodial account don't apply: the SEC's trading and markets staff note that "Non-security crypto assets are not protected by SIPA," and a self-custody wallet isn't an account at the broker at all ([Customer Protection, Net Capital & SIPC](/books/investing-and-digital-assets/customer-protection)).
- **Who the counterparty is.** A swap executes against pools, market makers or fillers chosen by an aggregator, not against the platform; the platform's fee and the route are shown.
- **Fees, each separately,** as in the worked table, and the fact that network fees are charged on failed swaps.
- **Price risk inside the trade.** Price impact, slippage, the maximum the customer accepted, and MEV exposure if the customer opts out of private submission.
- **Contract and token risk.** Pools, routers and tokens are third-party code that can be exploited, upgraded or frozen; listing in the app is not an endorsement, and an unlisted token's presence in search results isn't either.
- **Tax.** The platform doesn't report self-custody swaps; the customer is responsible.

Each disclosure is a `disclosures` row with its version, and each quote records the version shown ([`swap_quotes`](/books/investing-and-digital-assets/dexs-and-amms#how-to-build-it)), so a complaint about a loss can be answered with what the customer saw.

## How to Build It

A customer swap is an `orders` row and an `executions` row against a `venues` row of kind `dex`, priced by a `swap_quotes` row from [DEXs & AMMs](/books/investing-and-digital-assets/dexs-and-amms#how-to-build-it); the wallet is a `self_custody_wallets` row ([Wallets](/books/investing-and-digital-assets/wallets#how-to-build-it)); addresses screened reuse Payments' `address_screenings` ([Stablecoins](/books/payments/stablecoins#how-to-build-it)). This chapter adds the route a quote resolved to, hop by hop, and the screening decision for every contract on it.

```sql
CREATE TABLE dex_routes (                    -- the hops a quote resolved to, in order
  swap_quote_id       UUID NOT NULL REFERENCES swap_quotes (id),
  hop                 SMALLINT NOT NULL,      -- 0, 1, 2, ...
  split_bps           INT NOT NULL DEFAULT 10000,  -- share of the input through this path
  provider            TEXT NOT NULL,          -- '0x', 'lifi', 'uniswapx', 'direct'
  chain_id            UUID NOT NULL REFERENCES chains (id),
  pool_id             UUID REFERENCES liquidity_pools (id),  -- null for market makers and bridges
  contract_address    TEXT NOT NULL,          -- pool, market maker settlement, bridge or hook
  token_in_network_id UUID NOT NULL REFERENCES asset_networks (id),
  token_out_network_id UUID NOT NULL REFERENCES asset_networks (id),
  amount_in_base      NUMERIC(78, 0) NOT NULL,
  expected_out_base   NUMERIC(78, 0) NOT NULL,
  contract_screening_id UUID NOT NULL,        -- every hop has a screening decision
  PRIMARY KEY (swap_quote_id, hop, contract_address),
  CHECK (split_bps BETWEEN 1 AND 10000)
);

CREATE TABLE contract_screenings (           -- one decision per contract per quote path
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  chain_id            UUID NOT NULL REFERENCES chains (id),
  contract_address    TEXT NOT NULL,
  code_hash           BYTEA NOT NULL,         -- what is deployed now, read at quote time
  role                TEXT NOT NULL CHECK (role IN ('token', 'pool', 'hook', 'router',
                        'allowance_target', 'bridge', 'market_maker', 'recipient')),
  risk_review_id      UUID REFERENCES contract_risk_reviews (id),  -- the approval it matched
  token_contract_id   UUID,                   -- token_contracts row, for tokens
  address_screening_id UUID,                  -- Payments' address_screenings, for sanctions
  result              TEXT NOT NULL CHECK (result IN ('approved', 'blocked_unreviewed',
                        'blocked_code_changed', 'blocked_sanctions', 'blocked_token_powers',
                        'blocked_spoofed', 'blocked_exposure')),
  reasons             TEXT[] NOT NULL DEFAULT '{}',
  screened_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (result <> 'approved' OR risk_review_id IS NOT NULL OR role IN ('recipient', 'token'))
);

ALTER TABLE dex_routes ADD FOREIGN KEY (contract_screening_id) REFERENCES contract_screenings (id);
```

Notes on the sketch:

- **No hop without a screening.** The foreign key makes a route unrecordable unless every contract on it was screened, and the check makes `approved` impossible for a pool, router, hook or bridge without a matching review. A blocked hop sends the quote back to the provider with that source excluded.
- **Code hash at quote time.** A screening compares the deployed code hash with the reviewed one; an upgraded contract fails as `blocked_code_changed` until re-reviewed ([Upgradeability and Admin Keys](/books/investing-and-digital-assets/smart-contract-risk#upgradeability-and-admin-keys)).
- **Screenings are cached, briefly.** Most quotes reuse the same few routers and pools; a screening result is reused for minutes, never across a code change or a list update, and each quote still records which result it relied on.
- **Custodial DEX trades add ledger entries.** When the platform buys on chain for a custodial account, the route is the same, and the execution also posts journal lines: the firm wallet's on-chain movement and the customer's credit, with the token passing the same checks a listing would.
- **Events:** `contract_screening.blocked`, `dex_route.requoted` and `swap.sanctions_block` go through the [outbox](/docs/architecture/events#the-transactional-outbox); a sanctions block also opens a `cases` row with the rule's clock ([How to Build It](/books/banking-and-lending/sanctions-screening#how-to-build-it) in Sanctions Screening).

## Auditing

- **Every swap's full route** with the screening result for each hop, joined to the quote, the disclosure version and the execution.
- **Every block:** contracts, tokens and addresses the platform refused to route through, with reasons and what the customer was told.
- **The approved contract list** and its reviews, with code hashes and expiry.
- **Fee records** for every swap: platform fee charged on chain, provider fees, and the revenue entries for the platform's share.
- **Sanctions handling:** every blocked swap, any case opened, and any report filed.

## What This Means for the System You Build

- **Decide the model first:** self-custody wallet (software, no liabilities) or custodial DEX access (custody, listings by software). Don't mix them in one flow.
- **Screen every hop of every route,** in the quote path, against reviewed code hashes, token powers and sanctions lists, and requote instead of warning.
- **Pin allowance targets and provider contracts** per chain.
- **Show every fee separately** and say network fees are charged on failed swaps.
- **Submit privately by default** and record the route and submission path for every swap.
- **Track the law by citation, not by memory:** the DeFi broker rule is gone (Pub. L. 119-5), custodial reporting is not, and the Tornado Cash holding binds one circuit.
- **Disclose custody, protection, counterparty, price, contract and tax risk** in the terms and on the screen, and record which version each customer saw.

## References

**Law and regulation**

- [5 U.S.C. 801: Congressional review](https://www.law.cornell.edu/uscode/text/5/801), the bar on reissuing a disapproved rule in substantially the same form
- [Public Law 119-5 (H.J.Res. 25)](https://www.govinfo.gov/app/details/PLAW-119publ5), congressional disapproval of the digital asset gross proceeds rule, approved April 10, 2025, with House and Senate passage dates
- [Federal Register: T.D. 10021, Gross Proceeds Reporting by Brokers That Regularly Provide Services Effectuating Digital Asset Sales](https://www.federalregister.gov/api/v1/documents/2024-30496.json), December 30, 2024, effective February 28, 2025
- [Federal Register: T.D. 10021 full text](https://www.federalregister.gov/documents/full_text/html/2024/12/30/2024-30496.html), trading front-end service providers as the only DeFi brokers
- [Federal Register: CRA revocation of the gross proceeds rule](https://www.federalregister.gov/api/v1/documents/2025-12967.json), July 11, 2025, removal from the CFR and restoration of prior text

**Regulators and guidance**

- [IRS: Final regulations and related guidance for reporting by brokers on digital assets](https://www.irs.gov/newsroom/final-regulations-and-related-IRS-guidance-for-reporting-by-brokers-on-sales-and-exchanges-of-digital-assets), custodial brokers covered, non-custodial brokers excluded and the 2025 and 2026 reporting dates
- [OFAC: U.S. Treasury sanctions notorious virtual currency mixer Tornado Cash (jy0916)](https://home.treasury.gov/news/press-releases/jy0916), August 8, 2022, $7 billion laundered and $455 million from the Lazarus Group
- [Treasury: Tornado Cash delisting (sb0057)](https://home.treasury.gov/news/press-releases/sb0057), March 21, 2025, the removal and the continuing caution
- [SEC: Trading and Markets FAQ on crypto asset activities](https://www.sec.gov/rules-regulations/staff-guidance/trading-markets-frequently-asked-questions/frequently-asked-questions-relating-crypto-asset-activities-distributed-ledger-technology), non-security crypto assets not protected by SIPA

**Filings**

- [Coinbase: Q4 2025 shareholder letter (8-K exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000011/q425shareholderletter.htm), DEX integration with access to over 20 million assets, Solana DEX trading through Jupiter and the Base App
- [Coinbase: Q1 2026 earnings presentation (8-K exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000053/q126earningsdeck-finalse.htm), DEX trading volume growth and $450M+ cumulative volume, 60+ supported blockchains
- [Coinbase: Q2 2025 shareholder letter (8-K exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1679788/000167978825000153/q225shareholderletter.htm), the planned DEX trading integration and the Base App beta

**Courts and enforcement**

- [Van Loon v. Department of the Treasury, No. 23-50669 (5th Cir. Nov. 26, 2024)](https://www.ca5.uscourts.gov/opinions/pub/23/23-50669-CV0.pdf), immutable smart contracts are not property under IEEPA; reversed and remanded

**Vendor documentation**

- [Robinhood: Robinhood Wallet](https://robinhood.com/us/en/support/articles/robinhood-wallet/), self-custody, private keys held by the user and supported networks
- [Robinhood: Send, receive and swap crypto](https://robinhood.com/us/en/support/articles/send-receive-and-swap-crypto/), routing via 0x and LI.FI, the wallet and provider fees, guaranteed and estimated rates, slippage, failed swaps and Jupiter
- [0x: Swap tokens with 0x Swap API](https://docs.0x.org/evm/0x-swap-api/guides/swap-tokens-with-0x-swap-api), price and quote endpoints, the ready transaction and the allowance target warning
- [0x: Monetize your app using Swap API](https://docs.0x.org/evm/0x-swap-api/guides/monetize-your-app-using-swap), integrator fees from 0 to 1,000 bps
- [Uniswap: UNIfication](https://blog.uniswap.org/unification), the November 10, 2025 proposal to set Labs' interface, wallet and API fees to zero
