+++
title = "Crypto ETPs"
description = "Spot bitcoin and ether ETPs: the 2024 approvals, generic listing standards, cash and in-kind creation worked, custody, NAV at 4 pm, staking and surveillance."
category = "Investing & Digital Assets Industry"
order = 2554
part = "Institutional Crypto"
tags = ["crypto", "etf", "etp", "bitcoin", "ether", "creation-redemption", "custody", "nav"]
+++

A spot crypto exchange-traded product is a trust that holds one asset, usually bitcoin or ether, and issues shares that trade on a stock exchange. It isn't an investment company under the 1940 Act; it's a grantor trust registered under the Securities Act, listed under an exchange rule for commodity-based trust shares, with a sponsor that runs it, a custodian that holds the coins, a cash custodian and administrator, and a small set of broker-dealers, the authorized participants, who are the only ones allowed to create and redeem shares with the trust. Everyone else buys and sells shares on the exchange. Between the trust and the market sits an arbitrage: when the shares trade above the value of the coins behind them, authorized participants create shares and sell them, and when they trade below, they buy shares and redeem them.

Since January 2024 these products have become the largest institutional holders of bitcoin outside exchanges. The iShares Bitcoin Trust alone held 770,792 bitcoin, $67.4 billion of net assets, at December 31, 2025. For an engineer the product is three systems joined at 4 pm Eastern: a creation and redemption order book with cutoffs and baskets, a custody stack with a segregated vault and an omnibus trading balance, and a net asset value computed once a day from a benchmark rate. This chapter covers the 2024 approvals and their surveillance reasoning, the generic listing standards of 2025, creation and redemption in cash and in kind with the authorized participant's arbitrage worked, the custody stack and its concentration, NAV at 4 pm worked, and staking inside ETPs. It extends `instruments`, `transfers` and `wallets` with `etp_funds`, `etp_creations`, `etp_redemptions` and `nav_strikes`.

## How the Products Do It

Three products whose filings show the range, as of their latest filings:

| Product | Structure and listing | Custody | Benchmark for NAV | Fee | Size | Staking |
| --- | --- | --- | --- | --- | --- | --- |
| **iShares Bitcoin Trust (IBIT)** | Delaware statutory trust, Nasdaq since January 11, 2024; baskets of 40,000 shares | Coinbase Custody Trust Company; Anchorage Digital Bank as additional custodian with no plans to move bitcoin there; BNY cash custodian and administrator; Coinbase, Inc. prime execution agent | CME CF Bitcoin Reference Rate, New York Variant | 0.25% a year of NAV | $67.4 billion, 770,792 BTC, 1,358,680,000 shares (December 31, 2025) | Not applicable |
| **iShares Ethereum Trust (ETHA)** | Baskets of 40,000 shares | Named in its 10-K, same sponsor model as IBIT | CME CF Ether-Dollar Reference Rate, New York Variant | 0.25% | $10.3 billion, 3,467,229 ETH (December 31, 2025) | No: the trust "will not earn any form of staking rewards" |
| **Grayscale Ethereum Staking ETF (ETHE)** | Converted trust; NYSE Arca since July 23, 2024 | Coinbase Custody (custodian), Coinbase, Inc. (prime broker), Anchorage (alternative custodian) | CoinDesk Ether Benchmark Rate since April 1, 2026 | 2.5% | 95,828,500 shares at $12.77 NAV; 774,998.5 ETH (June 30, 2026) | Since October 6, 2025; about 82% of ether staked at June 30, 2026 |

The same skeleton runs through all of them: one asset, a named benchmark rate at 4 pm, a sponsor fee accrued daily and paid by selling the asset, Coinbase entities on the custody and execution side of most products, and baskets created only by authorized participants. What varies is the fee (a converted trust like ETHE kept a 2.5% fee while new products launched at 0.25% or less), the benchmark provider, and whether the trust stakes.

## The 2024 Approvals

For years the SEC disapproved spot bitcoin ETPs on the ground that the listing exchanges hadn't shown surveillance sharing with a regulated market of significant size in the underlying asset, while it had approved products holding CME bitcoin futures, which are themselves regulated and surveilled. Grayscale argued the two were indistinguishable, and the D.C. Circuit held in Grayscale v. SEC that "the Commission failed to adequately explain its reasoning" for treating them differently, and vacated the disapproval of Grayscale's conversion.

On January 10, 2024 the Commission approved eleven spot bitcoin trusts on three exchanges (Release No. 34-99306). The order's reasoning is the one an engineer building surveillance should know:

- **Surveillance sharing is one route, not the only one.** "Other means to prevent fraudulent and manipulative acts and practices will be sufficient," and the Commission found them here through CME.
- **The correlation analysis.** "Spot bitcoin, however, does not trade on the CME and the CME does not engage in surveillance of spot bitcoin markets," but the SEC's own analysis over about two and a half years found CME futures "consistently highly correlated" with spot prices: at least 98.4% hourly, 94.2% at five-minute and 76.9% at one-minute intervals against Coinbase and Kraken. Manipulating the spot market enough to move the ETP would show up in the surveilled futures market.
- **Coinbase agreements weren't the basis.** The exchanges' amended filings dropped surveillance agreements with Coinbase, and "the surveillance-sharing agreements with Coinbase are not a basis for approval."

Chair Gensler's statement the same day said "we did not approve or endorse bitcoin" and that approval was the most sustainable path after the court's decision. Spot ether ETPs followed: the Commission approved the exchange rule changes on May 23, 2024 (Release No. 34-100224), and ETHE began trading on NYSE Arca as a spot product on July 23, 2024. [Market Surveillance & Manipulation](/books/investing-and-digital-assets/market-surveillance#crypto-wash-trading-and-venue-surveillance) covers the surveillance systems themselves.

## Generic Listing Standards

Until 2025 every new crypto ETP needed its own exchange rule change under Section 19(b), a filing, comment period and Commission order per product. On September 17, 2025, the SEC approved generic listing standards for commodity-based trust shares at Nasdaq, Cboe BZX and NYSE Arca (Release No. 34-103995), so a qualifying product can list without first submitting a proposed rule change under Section 19(b). The order says the standards "reduce the time frame for bringing the shares to market." Each commodity the trust holds must meet at least one of three tests:

1. **It trades on a market that is an Intermarket Surveillance Group member**, initially and continuing (two ISG members are treated as having surveillance sharing with each other).
2. **It underlies a futures contract that has been available on a designated contract market for at least six months**, with comprehensive surveillance sharing directly or through ISG, initially and continuing.
3. **An ETF with at least 40% of its NAV exposed to the commodity is already listed**, on an initial basis only.

The standards add conditions the product's systems must meet: no leveraged or inverse returns, no registration under the 1940 Act, NAV and premium or discount published on the website, and written liquidity risk policies if less than 85% of assets are readily available each day, where an asset that can't be liquidated or transferred within one business day doesn't count. That last condition is the one staking engages: staked ether that takes days to unstake may not be "readily available." The same day the Commission approved the Grayscale Digital Large Cap Fund, a multi-asset product on the CoinDesk 5 index, and options on Cboe's bitcoin ETF indexes.

For a listing team the tests are a data problem: which assets have six months of DCM futures with surveillance sharing, on which date each crossed the line, and which ETFs hold 40% exposure, all as dated facts, because a product's eligibility is checked at listing and, for the first two tests, continuously after.

## Creation and Redemption

Shares come into existence only in baskets, and only through authorized participants. IBIT's 10-K describes the mechanics:

- **Baskets of 40,000 shares.** "The Basket Amount necessary for the creation of a Basket changes from day to day": it is NAV per share times 40,000.
- **Orders by cutoff.** "The Creation Early Order Cutoff Time is 6:00 p.m. ET on the Business Day prior to the trade date," and the redemption cutoff is the same; the order is priced at the trade date's NAV.
- **Authorized participants.** Thirteen named broker-dealers, from ABN AMRO Clearing and BofA Securities to Citadel Securities, Goldman Sachs, Jane Street, JP Morgan Securities and Virtu; four had in-kind bitcoin agreements.
- **Fees.** A flat ETF servicing fee and custody transaction costs per order, regardless of how many baskets; the amounts aren't disclosed.

**Cash creations** were the only kind the SEC allowed in 2024. The AP delivers cash; the trust buys the bitcoin. "In connection with a purchase order, the Trust will first borrow cash from the Trade Credit Lender using the Trade Financing Agreement, and then purchase bitcoin," to "lock in the bitcoin price on the trade date"; on trade date the trust chooses whether to buy from a bitcoin trading counterparty or through the prime execution agent. The execution price won't equal the benchmark used for NAV, and the filing puts the gap on the AP: if the trust pays more than the NAV price, "the Authorized Participant is responsible for the dollar cost of the difference," and the same for a redemption that sells below it.

**In-kind creations** arrived on July 29, 2025, when the SEC approved orders "to permit in-kind creations and redemptions by authorized participants" for crypto ETPs, and IBIT's 10-K for 2025 names four authorized participants with in-kind agreements. The staff of the SEC's Division of Trading and Markets had said in a May 15, 2025 FAQ that broker-dealer custody and capital rules don't prohibit facilitating in-kind creations and redemptions for these products. In kind, bitcoin rather than cash comes in, credited first to the trust's Trading Balance and swept to the Vault. IBIT recorded $5.76 billion of bitcoin received in kind for shares issued in 2025, and paid out bitcoin with a fair value of $845 million for in-kind redemptions, against a cost basis of $355 million: the $491 million realized gain stayed with the trust, not the redeeming shareholder, which is the tax efficiency in-kind redemption gives any ETF.

![The creation order state machine. A row of states: received, accepted, priced, delivered and issued, with that path accented and issued a terminal state. A dashed exit from received down to the terminal rejected state, labeled after cutoff or incomplete. A dashed exit from delivered down to the terminal canceled state, labeled trade not completed by settlement: AP cancels.](/diagrams/ida-etp-creation-states.svg "A creation order is accepted before the prior-day cutoff, priced at the trade date's 4 pm NAV, completed when cash buys bitcoin or bitcoin arrives in the trading balance, and ends when shares are issued. Redemptions run the same states in reverse.")

### Worked numbers: the authorized participant's arbitrage

My own example on IBIT's year-end figures: NAV $49.61 per share, so a basket of 40,000 shares is $1,984,400, which is 22.6884 BTC at the 4 pm benchmark of $87,463.03 (I ignore accrued fees for the arithmetic). During the day the shares trade at $49.71, a 0.20% premium, and an AP sells 40,000 shares short at $49.71 for $1,988,400 and creates a basket to cover. Order fees are assumed at $300.

```text
in kind
  AP buys 22.6884 BTC on its venues at 87,480.00           1,984,781.23
  delivers BTC, receives 40,000 shares, covers the short   proceeds 1,988,400.00
  fee                                                       300.00
  AP's profit                                               3,318.77

cash
  AP delivers the basket amount                             1,984,400.00
  trust buys 22.6884 BTC through its counterparty at 87,520.00
  gap to the NAV price: 22.6884 × (87,520.00 − 87,463.03) = 1,292.56, paid by the AP
  fee                                                       300.00
  AP's profit: 1,988,400.00 − 1,984,400.00 − 1,292.56 − 300.00 = 2,407.44
```

The premium is the AP's gross margin either way; what differs is who controls the bitcoin purchase. In kind, the AP buys when it sells the shares, at prices it can hedge against, from its own inventory if it has one. In cash, the trust buys later, through a counterparty the AP doesn't choose, and the AP still pays any shortfall, so it widens the premium it needs before creating. The arbitrage runs until the premium is smaller than the fees and execution risk, which is why in-kind creation should keep these products' premiums and discounts tighter. Redemption is the mirror: shares at a discount, the AP buys them, redeems a basket, and receives bitcoin (in kind) or the cash from the trust's sale (cash), with the same gap rule.

## The Custody Stack

The custody arrangement is the most-read part of these filings, because it's where an exchange failure would reach the fund. IBIT's version ([Two ledgers in one product](/books/investing-and-digital-assets/crypto-exchange-architecture#two-ledgers-in-one-product-the-etf-custody-model) in How a Crypto Exchange Works introduces it):

- **Vault Balance.** "Trust assets held in the Vault Balance are held in segregated wallets," Trust-only addresses with keys in cold storage.
- **Trading Balance.** An "omnibus claim" on bitcoin held by Coinbase, Inc. as prime execution agent, swept to the Vault "each trading day." Moving bitcoin the other way "may take up to 24 hours, or longer if the Bitcoin blockchain is experiencing delays," which is why sales for redemptions and fees are financed.
- **Trade Credits.** Coinbase Credit lends cash or bitcoin so the trust can settle trades before assets move; credits "do not bear any interest" and are due "by 6:00 p.m. ET on the business day following the day that the Trade Credit was extended," secured by a lien on the Trading and Vault Balances.
- **Liability caps.** Coinbase Custody's liability is capped at the greater of $5 million or the prior 12 months' fees, with $100 million per cold storage address.

**Concentration** is the stack's systemic feature. Coinbase Custody is custodian to IBIT and ETHE, and Coinbase's 10-K says it serves "as a custodian for several Bitcoin and Ethereum ETF issuers"; Coinbase, Inc. is prime execution agent or prime broker to the same funds, and Coinbase Credit is the trade credit lender. Sponsors have responded by naming backups (Anchorage for IBIT and ETHE) without moving assets to them. A failure or an operational outage at one custodian would touch a large share of US spot crypto ETP assets at once, and a sponsor's ability to move to the backup depends on how fast it can re-key and transfer hundreds of thousands of bitcoin, which no filing quantifies. <!-- source-gap: etp-custody-share | missing | the share of US spot bitcoin and ether ETP assets held by Coinbase Custody | closes with: a filing or an industry dataset that aggregates custodian by fund and AUM | checked: 2026-11-05 -->

## NAV at 4 pm

An ETP's NAV is struck once a day, "as soon as practicable after 4:00 p.m. ET," from a benchmark rate rather than the trust's own trades: an index provider's published rate (the CME CF Bitcoin Reference Rate, New York Variant, for IBIT), computed under the provider's methodology from trading on its constituent venues, so the price behind NAV is one the trust can name in advance and an auditor can look up. The computation:

```text
NAV = (asset units × benchmark rate) − accrued liabilities
NAV per share = NAV / shares outstanding

IBIT, December 31, 2025, as reported
  bitcoin held                 770,792
  benchmark used               87,463.03
  bitcoin at fair value        67,415,764,355
  other assets                         38,894
  liabilities                      14,648,005      about one month of sponsor fee, paid monthly
  net assets                   67,401,155,244
  shares outstanding          1,358,680,000
  NAV per share                        49.61       (49.6078…)
  bitcoin per share                0.00056731
```

The sponsor fee accrues daily at 0.25% a year of NAV, about $461,650 a day on $67.4 billion, and is paid by selling bitcoin: IBIT sold 1,658 bitcoin for expenses in 2025, against 354,176 bought for creations and 133,644 sold for redemptions. So bitcoin per share falls by roughly the fee rate each year, which is the only way a holder of a fee-paying trust can lose bitcoin without a price move.

Three details make NAV a system rather than a formula:

- **The benchmark is a dependency.** If the benchmark isn't published, the trust's fallback (another rate, the sponsor's fair value determination) is in the prospectus and has to be implemented, tested and audited. ETHE changed benchmark providers on April 1, 2026, a dated change the NAV history must carry.
- **Crypto trades after 4 pm.** The shares trade on an exchange calendar; the asset doesn't stop. A weekend move shows up in Monday's opening premium or discount, not in NAV, and an exchange holiday means no NAV that day.
- **Premium and discount are published.** The generic standards require the website to show NAV and the premium or discount, which means a daily job that joins the NAV strike with the closing share price.

## Staking Inside ETPs

A fund that stakes faces the platform's decisions plus redemption liquidity ([Staking as a Product](/books/investing-and-digital-assets/staking#staking-in-etps) covers the platform side). ETHE is the clearest public case:

- **Since when.** "On October 6, 2025, the Trust commenced Staking pursuant to the Staking Arrangements," through "one or more third-party staking service providers, which may include affiliates of the Custodian."
- **How much.** At June 30, 2026, $999,963 thousand of $1,223,358 thousand of the trust's ether was staked, about 82%.
- **The cut.** "The Sponsor's Staking Fee and the Validator Fees together represent an aggregate of 23% of the gross staking rewards"; rewards are revenue net of validator fees ($8,286 thousand in the second quarter of 2026).
- **Distributions.** An amended trust agreement dated August 6, 2026 requires rewards to be converted to cash "no less often than quarterly"; the trust paid $0.196777 a share in the first half of 2026.
- **The liquidity risk.** "Staked Ether may be inaccessible for a period of time required to un-stake and withdraw Ether," which is the redemption problem in one sentence: a basket redeemed today must be met from the unstaked 18% or from credit, because Ethereum's exit queue can take days to weeks.

The design rule follows the generic standards' 85% liquidity threshold: a staking trust needs a policy for how much stays unstaked, a forecast of redemptions against the exit queue, and a credit line for the gap. ETHA, by contrast, states that no one will "employ the Trust's ether in Staking Activities." <!-- source-gap: staking-in-etps | missing | the full list of US ETPs that stake, since when, through which providers, and the share staked | closes with: each product's prospectus or 10-Q and the exchange rule filings | checked: 2026-11-05 -->

## How to Build It

An ETP is an `instruments` row (`instrument_type` `etf`) for the shares and another for the asset, a set of `wallets` for the vault and trading balances, and four tables for the fund's daily cycle:

```sql
CREATE TABLE etp_funds (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  share_instrument_id   UUID NOT NULL REFERENCES instruments (id),
  asset_instrument_id   UUID NOT NULL REFERENCES instruments (id),
  trust_entity_id       UUID NOT NULL REFERENCES legal_entities (id),
  basket_shares         INT NOT NULL CHECK (basket_shares > 0),        -- 40,000
  sponsor_fee_bps       INT NOT NULL,                                   -- per year, of NAV
  benchmark             TEXT NOT NULL,     -- the rate named in the prospectus
  benchmark_fallback    TEXT NOT NULL,
  order_cutoff          TEXT NOT NULL,     -- '18:00 America/New_York, prior business day'
  in_kind_allowed_since DATE,
  staking_allowed       BOOLEAN NOT NULL DEFAULT FALSE,
  min_unstaked_bps      INT CHECK (min_unstaked_bps BETWEEN 0 AND 10000)
);

CREATE TABLE nav_strikes (                 -- one per fund per business day
  fund_id               UUID NOT NULL REFERENCES etp_funds (id),
  trade_date            DATE NOT NULL,
  benchmark_value       NUMERIC(38, 12) NOT NULL,   -- dollars per whole unit
  benchmark_source      TEXT NOT NULL,              -- primary or the fallback used
  asset_units           NUMERIC(78, 0) NOT NULL,    -- smallest units held, all wallets
  liabilities_cents     BIGINT NOT NULL,            -- accrued fees and other payables
  shares_outstanding    BIGINT NOT NULL,
  nav_cents             BIGINT NOT NULL,
  nav_per_share         NUMERIC(20, 6) NOT NULL,
  closing_price         NUMERIC(20, 6),             -- for the published premium or discount
  struck_at             TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (fund_id, trade_date)
);

CREATE TABLE etp_creations (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  fund_id               UUID NOT NULL REFERENCES etp_funds (id),
  authorized_participant_id UUID NOT NULL REFERENCES parties (id),
  baskets               INT NOT NULL CHECK (baskets > 0),
  kind                  TEXT NOT NULL CHECK (kind IN ('cash', 'in_kind')),
  trade_date            DATE NOT NULL,
  received_at           TIMESTAMPTZ NOT NULL,
  basket_amount_cents   BIGINT,               -- NAV × basket shares, set when priced
  asset_units_due       NUMERIC(78, 0),       -- in kind, or what the trust must buy for cash
  execution_cost_cents  BIGINT,               -- cash: what the trust paid for the asset
  ap_shortfall_cents    BIGINT,               -- cash: execution cost minus basket amount, billed to the AP
  inbound_transfer_id   UUID REFERENCES transfers (id),   -- the cash or the asset received
  status                TEXT NOT NULL CHECK (status IN ('received', 'accepted', 'rejected',
                          'priced', 'delivered', 'issued', 'canceled')),
  idempotency_key       TEXT NOT NULL UNIQUE,
  FOREIGN KEY (fund_id, trade_date) REFERENCES nav_strikes (fund_id, trade_date)
    DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE etp_redemptions (             -- the mirror: shares in, cash or asset out
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  fund_id               UUID NOT NULL REFERENCES etp_funds (id),
  authorized_participant_id UUID NOT NULL REFERENCES parties (id),
  baskets               INT NOT NULL CHECK (baskets > 0),
  kind                  TEXT NOT NULL CHECK (kind IN ('cash', 'in_kind')),
  trade_date            DATE NOT NULL,
  asset_units_out       NUMERIC(78, 0),
  sale_proceeds_cents   BIGINT,               -- cash: what the trust's sale raised
  ap_shortfall_cents    BIGINT,               -- cash: basket amount minus proceeds, billed to the AP
  outbound_transfer_id  UUID REFERENCES transfers (id),
  realized_gain_cents   BIGINT,               -- the trust's, from the lots it delivered
  status                TEXT NOT NULL CHECK (status IN ('received', 'accepted', 'rejected',
                          'priced', 'delivered', 'settled', 'canceled')),
  idempotency_key       TEXT NOT NULL UNIQUE
);
```

The NAV job runs after 4 pm: it reads the benchmark (or records the fallback), sums the asset across vault and trading wallets from the ledger (never from a custodian's report alone; the custodian's statement is a `reconciliations` row against it), accrues the day's sponsor fee as a liability, and writes the strike. Orders for the trade date are priced from that strike, and an order whose cash execution cost exceeds its basket amount gets an AP shortfall invoice. A redemption's delivered lots come from the trust's tax lots, which is why `realized_gain_cents` is the trust's figure and why in-kind redemptions show realized gains the shareholders never see.

## Auditing

What an ETP's auditor, the SEC and the listing exchange look for:

- **Every NAV strike** with its benchmark value and source, holdings by wallet, liabilities and shares, reproducible from the ledger.
- **Every creation and redemption** from receipt to issuance or settlement, with the cutoff check, the price, the transfer, and any AP shortfall.
- **Holdings reconciled daily** across the vault, the trading balance and any trade credit outstanding.
- **Benchmark changes and fallbacks**, dated, and every day a fallback was used.
- **For staking funds**, staked and unstaked amounts each day against the liquidity policy, and rewards gross and net.

## What This Means for the System You Build

- Price every creation and redemption from one daily NAV strike, and make the strike reproducible from the ledger and the benchmark.
- Treat cash creations as an execution the trust performs on the AP's account: record the execution cost and bill the shortfall.
- Credit in-kind deposits to the trading balance, sweep to the vault daily, and reconcile both every day.
- Store listing eligibility (ISG markets, six months of DCM futures, 40% ETF exposure) as dated facts checked at listing and after.
- Model the custodian as a concentration risk: name the backup, and know how long a move to it would take.
- For a staking fund, hold the unstaked buffer the redemption forecast requires, and publish what's staked.

## References

**Regulators and guidance**

- [SEC: Order approving spot bitcoin ETPs, Release No. 34-99306 (January 10, 2024; published January 17, 2024)](https://www.federalregister.gov/documents/full_text/html/2024/01/17/2024-00743.html), the eleven trusts, the surveillance-sharing route and its alternative, the CME correlation analysis, Grayscale v. SEC and the Coinbase agreements
- [SEC: Order approving spot ether ETPs, Release No. 34-100224 (May 23, 2024; 89 FR 46937)](https://www.federalregister.gov/documents/full_text/html/2024/05/30/2024-11804.html), the approval of the exchange rule changes for ether-based ETPs
- [SEC: Statement of Chair Gensler on the approval of spot bitcoin ETPs (January 10, 2024)](https://www.sec.gov/news/statement/gensler-statement-spot-bitcoin-011023), the statement that the Commission did not approve or endorse bitcoin
- [SEC: Order approving generic listing standards, Release No. 34-103995 (September 17, 2025)](https://www.federalregister.gov/documents/full_text/html/2025/09/22/2025-18258.html), the three tests, the ISG and DCM conditions, the liquidity threshold and other conditions
- [SEC: Press Release 2025-121, generic listing standards for commodity-based trust shares (September 17, 2025)](https://www.sec.gov/newsroom/press-releases/2025-121-sec-approves-generic-listing-standards-commodity-based-trust-shares), listing without a 19(b) filing and the same-day approvals
- [SEC: Press Release 2025-101, in-kind creations and redemptions for crypto ETPs (July 29, 2025)](https://www.sec.gov/newsroom/press-releases/2025-101-sec-permits-kind-creations-redemptions-crypto-etps), the in-kind orders and same-day approvals
- [SEC Division of Trading and Markets: Frequently asked questions relating to crypto asset activities and distributed ledger technology (May 15, 2025)](https://www.sec.gov/rules-regulations/staff-guidance/trading-markets-frequently-asked-questions/frequently-asked-questions-relating-crypto-asset-activities-distributed-ledger-technology), broker-dealers facilitating in-kind creations and redemptions

**Filings**

- [iShares Bitcoin Trust: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1980994/000143774926006058/bit20251231_10k.htm), baskets, cutoffs, authorized participants, fees, cash creation and the AP's responsibility for the difference, in-kind authorization, custodians, Vault and Trading Balances, Trade Credits, NAV and benchmark, sponsor fee, year-end holdings, shares and NAV, and 2025 creations, redemptions and sales for expenses (financial statements in the filing's [R pages](https://www.sec.gov/Archives/edgar/data/1980994/000143774926006058/R2.htm))
- [iShares Ethereum Trust: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/2000638/000143774926006054/etha20251231_10k.htm), no staking, the fee, the benchmark, the basket and year-end holdings
- [Grayscale Ethereum Staking ETF: Form 10-Q for the second quarter of 2026](https://www.sec.gov/Archives/edgar/data/1725210/000172521026000016/ethe-20260630.htm), staking since October 6, 2025, providers, staked share, the 23% aggregate fee, rewards, distributions, the un-staking risk, custodians, the fee, listing history, the benchmark change and NAV
- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), custodian for several bitcoin and ether ETF issuers
