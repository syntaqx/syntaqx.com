+++
title = "Tokenized Stocks & 24/7 Securities"
nav_title = "Tokenized Stocks"
description = "Stock tokens from Robinhood, xStocks and Ondo, DTC's tokenization service, Nasdaq's rule, the SEC's 2026 exemption, corporate actions, wrappers vs native."
category = "Investing & Digital Assets Industry"
order = 2568
part = "Tokenization"
tags = ["tokenization", "tokenized-stocks", "xstocks", "dtc", "nasdaq", "corporate-actions", "24-7-trading"]
+++

A tokenized stock is a token whose value follows a share of a listed company. That one sentence covers four different things that trade under similar tickers: a share the issuer itself records on a chain, a DTC security entitlement minted as a token between registered wallets, a certificate from a special-purpose issuer that holds the share and owes it to the token holder, and a derivative contract with a broker that tracks the price and owns nothing at all. They look alike in a wallet. They differ in who the holder can sue, whether there is a vote, what happens on a dividend, and which regulator cares.

The appeal is the same in every case: a share that moves when the chain does. A token can trade at 2 a.m. on a Saturday, settle in seconds, sit in a lending protocol as collateral, and reach customers in countries where a US brokerage account is hard to open. The catch is the same too. The company, its transfer agent, DTC, the exchanges and the dividend paying agent all keep their own hours, and the token has to carry every dividend, split, merger and vote from that world into one that never closes. How it does that, and who stands between the holder and the share when it does, is the chapter.

This chapter covers the products as of November 2026, the kinds of stock token and the rights each carries, the US rules that moved in 2025 and 2026 (DTC's tokenization relief and service, Nasdaq's tokenized securities rule, the SEC's exemption for tokenized NMS stock trading venues), trading when the underlying market is closed, corporate actions through a wrapper with worked numbers, and the wrapper versus native question, on the core model of [The Investing & Digital Assets Business](/books/investing-and-digital-assets/investing-business#the-core-data-model). Tokenized funds are [Tokenized Treasuries & Funds](/books/investing-and-digital-assets/tokenized-funds); the transfer agent and permissioned token mechanics are [Transfer Agents & Permissioned Tokens](/books/investing-and-digital-assets/transfer-agents-and-permissioned-tokens).

## How the Platforms Do It

The main stock token programs, from their own documents and filings, with distributed value from the rwa.xyz data aggregator (page dated November 5, 2026), as of November 2026:

| Program | What the holder has | Issuer | Who can buy | Dividends | Chains | Value (rwa.xyz) |
| --- | --- | --- | --- | --- | --- | ---: |
| **Robinhood Stock Tokens** | "a derivative contract that tracks the price of a U.S. stock or ETP," without owning the share (2025 10-K) | Not named in the filing passages I read | Eligible customers in the EEA only | "Mirror" the underlying, paid in the app | Arbitrum; Robinhood Chain planned | $149.2M |
| **xStocks** | A token "backed by the underlying stock or ETF on a 1:1 basis"; in Kraken's words, xStocks "don't confer ownership" of the stock | Backed Assets (JE) Limited, a Jersey company; offered on Kraken by Payward Digital Solutions Ltd (Bermuda) | Not US persons; Kraken also excludes Canada, the UK and Australia | Reinvested net of withholding through an on-chain multiplier | Ethereum, Solana, Arbitrum, Mantle, TON, Ink and other EVM chains | $685.5M |
| **Ondo Global Markets** | A token "fully backed with the underlying asset (together with any cash in transit)"; no "shareholder voting rights, statutory information rights or other shareholder rights" | Ondo Global Markets (BVI) Limited | "generally available to non-US investors"; direct purchase limited to institutions | Reinvested into the stock (total return) | Ethereum, BNB Chain, Solana | $922.4M |
| **Superstate Opening Bell** | The issuer's own registered shares, issued on chain, with "the same economic and governance rights as traditional shares" | The company itself, with Superstate as digital transfer agent | Eligible investors with allowlisted addresses | As for any share | Solana, Ethereum | $47.0M |
| **DTCC Tokenization Service** | A tokenized form of a DTC-held security, backed 1:1 by securities "held at DTC," with one CUSIP | DTC | DTC participants, between DTC-registered wallets | As for the security | Canton Network and DTCC's private Besu network | n/a |

rwa.xyz counted $3.99 billion of distributed tokenized stocks across 6,755 assets and 4.71 million holders, with $34.68 billion of transfers in the month, the largest platform being bStocks at $1.6 billion. Coinbase's own stock tokens appear as $40.3 million, and Aave has accepted them as collateral for non-US persons ([Real-World-Asset Collateral](/books/investing-and-digital-assets/defi-lending#real-world-asset-collateral)). The pattern: **offshore wrappers and derivatives serve non-US retail now; US-native tokenization runs through the issuer's transfer agent or through DTC, and US secondary trading of tokens was only opened by exemption in September 2026.** None of the wrappers gives a vote.

## Four Kinds of Stock Token

What matters is the chain of claims between the token holder and the company:

| Kind | Example | Claim of the token holder | Vote | Holder's main risk beyond the stock |
| --- | --- | --- | --- | --- |
| **Issuer-native** | Superstate Opening Bell | Shareholder of record; the token is the share | Yes | Key loss and transfer agent operations |
| **Tokenized entitlement** | DTCC Tokenization Service | A DTC participant's security entitlement in tokenized form, same CUSIP | Through the participant, as today | DTC's network and the participant's wallet |
| **Backed wrapper** | xStocks, Ondo | A claim on a special-purpose issuer that holds the shares, with a security interest for holders | No | The issuer, its custodians and the security agent |
| **Derivative** | Robinhood Stock Tokens | A contract with the broker that tracks the price | No | The broker's credit and its terms |

The first two are the share. The last two are something else that pays like the share. Kraken's terms put the wrapper case plainly: holders have "no voting rights, or distribution entitlements, or legal claims to the underlying stocks," and an insolvency of the depositary "may result in delayed or impossible access to the underlying stocks." xStocks' structure is built to narrow that risk, with "a bankruptcy-remote issuing SPV," custody in "segregated custody accounts governed by a three-party Account Control Agreement," and "an independent Security Agent with visibility over collateral"; Ondo describes "a first-priority security interest held by a third-party security agent" and "daily attestations." Those are credit structures. The token is a secured debt-like claim on an issuer, and the platform that sells it is selling the issuer's credit along with the stock's price.

For the ledger, each kind is an `instruments` row of type `tokenized_security` with its own identifiers. A backed wrapper of Apple is not Apple: it doesn't share Apple's CUSIP, its corporate actions are the wrapper issuer's, and it can't be delivered to settle an Apple trade. A DTC tokenized entitlement is the opposite: Nasdaq's rule requires a tokenized share to be "fungible with, shares the same CUSIP number with and trading symbol" with the traditional share. My rule is that two rows are the same instrument only when the law makes them interchangeable, and a token with its own issuer never is.

## The US Rules as of November 2026

Three actions in eleven months changed what a US platform can do.

**DTC's tokenization relief and service.** The staff of the SEC's Division of Trading and Markets gave DTC a no-action letter dated December 11, 2025 for a pilot of the tokenization service, under Reg SCI, Exchange Act Section 19(b) and Rule 19b-4, and Rules 17Ad-22(e) and 17Ad-25(i) and (j). Eligible securities are limited to Russell 1000 securities, US Treasury bills, notes and bonds, and ETFs that track major indices; only DTC participants may register wallets, tokens "would only be transferable to Registered Wallets," DTC screens each wallet against OFAC requirements before registering it, tokenized entitlements get no collateral or settlement value in DTC's risk management, and the letter "is withdrawn without further action three years from the date DTC launches" the pilot. DTCC launched the DTCC Tokenization Service on **October 28, 2026**: it "enables the minting of tokenized representations of real-world assets held at DTC," lets eligible users convert DTC-custodied entitlements between traditional and tokenized forms, runs on the Canton Network and DTCC's private Besu network with more networks planned for 2027, and had 20 DTC participants signed at launch. Tokens move "24/7 intra-chain, peer-to-peer" between DTC-registered wallets.

**Nasdaq's tokenized securities rule.** The SEC approved SR-NASDAQ-2025-072, as modified by Amendment No. 2, on March 18, 2026 (Rel. 34-105047, 91 FR 13900). Tokenized shares of eligible securities trade "on the same order book as, and with the same execution priority as, its traditional counterpart." A DTC-eligible participant marks an order with a tokenization flag; Nasdaq passes the preference to DTC after the trade, and if the participant or security isn't eligible, or DTC can't execute it, the trade settles in traditional form. The order requires that the token "affords its shareholders the same rights and privileges as does a share of an equivalent class," does not cover non-fungible tokenized instruments, and gives no launch date: trading waits on DTC's infrastructure, with 30 calendar days' notice to members.

**The SEC's exemption for tokenized NMS stock venues.** On September 17, 2026 the Commission issued temporary conditional exemptive relief (Rel. 34-106402, 91 FR 60168, File No. 4-927), effective "from September 17, 2026, until September 17, 2031":

- **What it covers.** A "Tokenized NMS Stock" is an NMS stock tokenized by or on behalf of the issuer, or by an unaffiliated third party, with the same rights as the class (interest in the company, dividends, voting, residual assets). It excludes a third party's token "that provides synthetic exposure," such as "a tokenized linked security or a tokenized security-based swap." A derivative stock token is outside it; a backed wrapper that passes rights through could fit.
- **Who it exempts.** A Tokenized Securities Venue operating AMM liquidity pools for permissioned participants on "a public, permissionless distributed ledger," exempt from the definition of "exchange," plus "Covered Firms" that supply liquidity to the pools from proprietary capital, exempt from the definition of "dealer" if they don't hold customer assets and say they aren't registered.
- **What can trade.** Tokenized NMS stock against another tokenized NMS stock, a non-security crypto asset such as a payment stablecoin, or a tokenized money market fund. No primary issuance on the venue.
- **Caps.** Up to 75 symbols and 0.25% of prior-month average daily share volume for LULD Tier 1 stocks; up to 250 symbols and 2.5% for the other tier; repeated volume breaches force a three-month pause.
- **Conditions.** Public notice at least 30 calendar days before operating; for third-party tokens, notice to the issuer, at least 30 days' wait, and no trading if the issuer objects; the third party distributes proxy materials "at no cost to the issuer or the shareholders"; trading stops "concurrently with any stoppage" on the primary listing exchange; transaction data in dollars within 10 minutes; no leverage; the venue is a US person, complies with OFAC, keeps records in the US and isn't a Regulation NMS trading center.

The wrappers above stay offshore. Robinhood's 2025 10-K says it "currently only offer[s] Robinhood Stock Tokens in the EEA" and that "the SEC or other U.S. regulators, including the CFTC, could assert jurisdiction" over the offering; xStocks are "not intended for distribution in the United States, to any US person."

## Trading When the Market Is Closed

A token can trade every hour; the stock it tracks trades in sessions. Robinhood and Kraken offer their tokens 24/5; Ondo's tokens "generally trade 24/5" with pauses during corporate actions; xStocks issuance and redemption "operate 24/5, aligned with U.S. equity market hours." Outside those windows, and inside them whenever the underlying is halted, the token's price has no arbitrage anchor. A wrapper issuer can only create or redeem against shares it can buy or sell, so on a Saturday the token's price is whatever holders agree, and on Monday it snaps back to the opening print.

Three consequences for a platform:

- **Halts propagate.** The SEC's exemption makes its venues stop trading when the primary market halts the stock. A platform that offers wrapper tokens on its own book should do the same by rule, from the same halt feed it uses for the stock ([Pre-Trade Risk, Halts & Volatility](/books/investing-and-digital-assets/pre-trade-risk-and-halts)).
- **Marks need a policy.** A position valued at Friday's close all weekend understates risk; one valued at the token's thin weekend trades overstates noise. Lending protocols hold the last price over weekends and price the gap with lower collateral factors ([Real-World-Asset Collateral](/books/investing-and-digital-assets/defi-lending#real-world-asset-collateral)). My default is to mark at the underlying's last regular-session or extended-session price, show the token's own last trade beside it, and widen margin over the closed hours.
- **Hours are converging.** US venues plan longer sessions ([23/5 on Exchanges](/books/investing-and-digital-assets/extended-and-overnight-trading#23-5-on-exchanges)), and DTC's tokens already move peer to peer around the clock. The gap a wrapper fills narrows as the market's own hours grow.

## Corporate Actions Through a Wrapper

When Apple pays a dividend, the cash goes to Cede & Co., then to DTC participants, then to the custodian that holds the wrapper issuer's shares, then to the issuer. The token holders never appear in that chain, so the issuer has to turn every corporate action into a change to the token. xStocks does it with a multiplier:

- "Every xStock launches with a multiplier of 1.0," so one token equals one share.
- A cash dividend is received by the custodian and reinvested "net of applicable withholding taxes" into more of the same stock, and the multiplier rises (their example: 1.0 to 1.008).
- A split raises it by the ratio (a 4-for-1 split takes 1.008 to 4.032); a reverse split lowers it (2-for-1 reverse takes 4.032 to 2.016).
- The new multiplier "is published onchain before each corporate event takes effect," with activation "set for 00:30 UTC on the day immediately following the Ex-Date," and venues and protocols are asked to pause the token briefly around activation.
- On EVM chains, "The standard balanceOf() function returns the current equity-adjusted balance." On Solana "The onchain balance remains constant" and "A multiplier is stored in token metadata," which wallets and apps apply for display; TON works like Solana.

Ondo's tokens are total-return trackers too, with a display multiplier on Solana and BNB Chain. Robinhood's derivative pays dividends that mirror the stock in the app. A native or DTC-tokenized share takes corporate actions as a share does ([Corporate Actions & Asset Events](/books/investing-and-digital-assets/corporate-actions)).

### Worked numbers: a dividend and a split through the multiplier

A wrapper token on stock XYZ has 1,000,000 base units outstanding and a multiplier of 1.000000; the issuer's custodian holds 1,000,000 shares. A platform holds 25.000000 tokens for one customer in its omnibus wallet.

1. **Dividend.** XYZ declares $1.00 a share, ex-date Thursday, November 12, 2026. Assume withholding takes 30% (the actual rate depends on the issuer's tax position), so the custodian receives $0.70 a share, $700,000 in all, and buys 4,000 shares at $175.00. The issuer now holds 1,004,000 shares, and the multiplier becomes 1.000000 × (1 + 0.70 / 175.00) = **1.004000**, active at 00:30 UTC on Friday, November 13.
   - On an EVM chain, the customer's balanceOf reads **25.100000** after activation, with no transfer.
   - On Solana, the raw balance stays 25.000000 and the displayed balance is 25.100000.
   - Holder value: 25.100000 × the share price. Holders got $0.70 of stock per share instead of $1.00 of cash, and no cash at all.
2. **Split.** XYZ splits 4-for-1, ex-date Monday, November 30. The custodian's position becomes 4,016,000 shares and the multiplier **4.016000**. The customer's EVM balance reads **100.400000**; with XYZ trading at $45.00 after the split, a token is worth 4.016 × $45.00 = **$180.72** and the customer's position $4,518.00, the same as 25.1 shares' worth at $180.00 before the split.
3. **The invariant.** At every moment, base units × multiplier = shares held: 1,000,000 × 4.016 = 4,016,000. Any other number is a break.

What the platform's ledger has to do:

- **Book the event, don't infer it.** On an EVM chain the omnibus wallet's balance rises at activation with no transfer to watch for. The platform records an `asset_events` row for the wrapper (kind `dividend` or `split`, with the new multiplier in `terms`) and posts the per-customer change itself, so the ledger and the chain agree after activation, not by accident.
- **Choose a unit and keep it.** The ledger can hold base units and apply the multiplier for display, or hold equity-adjusted units and post every rebase. The same token behaves differently on Solana and Ethereum, so I hold base units in the ledger for every chain and store the multiplier as a dated series; display and valuation multiply.
- **Pause around activation.** Orders and withdrawals of the token stop from the published multiplier until activation plus a margin, the window the issuer asks for.
- **Tax lots follow the economics, not the token count.** A reinvested dividend inside a wrapper is not a dividend paid to the holder in the way a 1099-DIV expects; how it is taxed depends on what the token is under the holder's tax law. Wrapper tokens are sold to non-US persons today, but the lot engine still records the multiplier change as an adjustment with its cause ([Corporate Actions and Basis](/books/investing-and-digital-assets/cost-basis-and-tax-lots#corporate-actions-and-basis)).

### Voting

Wrappers give no vote, and the derivative gives none. A native share or a DTC entitlement votes as a share does, which for a broker means the record-date snapshot and pass-through it already runs ([Proxy and Pass-Through Voting](/books/investing-and-digital-assets/corporate-actions#proxy-and-pass-through-voting)). The SEC's exemption adds a duty for third-party tokens on its venues: "regardless of the mechanism used to pass through any voting rights," the third party distributes proxy materials and issuer communications at no cost. A rights-passing wrapper therefore needs the broker's proxy machinery on the token side: a record-date snapshot of token holders, materials to each, and instructions back to the custodian.

## Wrapper or Native

The choice is the issuer's and the market's, but a platform picks which to list and has to explain the difference to its customers:

| | Backed wrapper or derivative | Native or DTC-tokenized |
| --- | --- | --- |
| Who can launch it | Anyone with custody of the shares (wrapper) or a balance sheet (derivative) | The issuer, its transfer agent, or DTC |
| Rights | Economic exposure only; no vote | The share's rights |
| Credit risk | The wrapper issuer and its custodians, or the broker | The issuer's record, as for any share |
| US availability, November 2026 | Offshore only | Issuer-native issuance; DTC tokens among participants; venue trading under the September 2026 exemption |
| Corporate actions | Translated by the issuer (multiplier, reinvestment) | Native |
| Fungible with the listed share | No | Yes (Nasdaq requires the same CUSIP and symbol) |

My view is that wrappers are a bridge: they exist because the native path wasn't open, and they carry a layer of issuer credit and a loss of rights to buy hours and reach. As DTC's tokens and issuer-native shares grow and US venues lengthen their sessions, a platform should expect to support both, with the wrapper clearly labeled as the issuer's product and not the company's stock.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): every stock token is an `instruments` row with `instrument_type = 'tokenized_security'`, its chains are `asset_networks`, its corporate actions are `asset_events` on the token's own instrument, and customer holdings are `positions` derived from the ledger. This chapter adds what the token is a claim on, the holdings that back it, and each customer's entitlement through it.

```sql
CREATE TABLE token_wrappers (                -- what a stock token is, versioned
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),   -- the token
  underlying_id       UUID NOT NULL REFERENCES instruments (id),   -- the share it tracks
  kind                TEXT NOT NULL CHECK (kind IN ('issuer_native', 'dtc_entitlement',
                        'backed_wrapper', 'derivative')),
  issuer              TEXT NOT NULL,         -- the legal issuer of the token
  issuer_jurisdiction TEXT NOT NULL,
  fungible_with_underlying BOOLEAN NOT NULL, -- same CUSIP and symbol
  passes_votes        BOOLEAN NOT NULL,
  dividend_mode       TEXT NOT NULL CHECK (dividend_mode IN ('native', 'multiplier',
                        'cash_mirror', 'reinvest_display')),
  multiplier_storage  TEXT CHECK (multiplier_storage IN ('balance_rebase', 'metadata')),
  eligibility         TEXT NOT NULL,         -- 'non_us', 'eea_only', 'dtc_participants', ...
  security_agent      TEXT,
  terms               JSONB NOT NULL,        -- prospectus, final terms, fees, hours
  valid_during        TSTZRANGE NOT NULL,
  EXCLUDE USING gist (instrument_id WITH =, valid_during WITH &&)
);

CREATE TABLE underlying_holdings (           -- the issuer's backing, as published or attested
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  token_wrapper_id    UUID NOT NULL REFERENCES token_wrappers (id),
  as_of               TIMESTAMPTZ NOT NULL,
  shares_held         NUMERIC(38, 9) NOT NULL,
  cash_in_transit     BIGINT NOT NULL DEFAULT 0,      -- minor units
  tokens_outstanding  NUMERIC(38, 18) NOT NULL,       -- base tokens across every chain, at recorded blocks
  multiplier          NUMERIC(38, 18) NOT NULL,
  source              TEXT NOT NULL CHECK (source IN ('attestation', 'issuer_report',
                        'custodian_statement', 'own_custody')),
  UNIQUE (token_wrapper_id, as_of, source)
);

CREATE TABLE token_entitlements (            -- one customer's change through one event
  asset_event_id      UUID NOT NULL REFERENCES asset_events (id),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  base_units          NUMERIC(78, 0) NOT NULL,        -- unchanged by a rebase
  multiplier_before   NUMERIC(38, 18) NOT NULL,
  multiplier_after    NUMERIC(38, 18) NOT NULL,
  equity_units_after  NUMERIC(78, 0) NOT NULL,        -- base_units * multiplier_after
  journal_entry_id    UUID REFERENCES journal_entries (id),  -- posted where the ledger holds equity units
  activated_at        TIMESTAMPTZ NOT NULL,           -- 00:30 UTC the day after ex-date
  PRIMARY KEY (asset_event_id, account_id)
);
```

Design notes:

- **The token is never the stock.** `underlying_id` links them for pricing, halts and disclosures; a wrapper is never netted against, delivered for or reported as the underlying share.
- **Multipliers are a dated series.** Each multiplier change is an `asset_events` row with the new value and its activation time, and every valuation reads the multiplier in force at its own time.
- **Reconcile the issuer's backing** whenever it publishes: base units across all chains times the multiplier against shares held plus cash in transit. A persistent difference is the issuer's credit problem showing up as a number.
- **Halts and hours come from the underlying.** Trading and withdrawal controls read the underlying's halt state and session calendar, and the token's own state on top.
- **Eligibility is per wrapper and per customer.** A customer's jurisdiction and the wrapper's `eligibility` decide whether the token can be bought at all; US persons are blocked from the offshore wrappers at order entry.

## Auditing

Selling a stock token is selling a security, with records to match. Keep:

- **What each token is,** with its offering documents, issuer, jurisdiction, eligibility and the disclosure each customer saw before buying.
- **Every multiplier change** and corporate action, with publication and activation times, the pause applied and each customer's entitlement.
- **Every backing reconciliation** against the issuer's attestations or reports, with differences and how they were resolved.
- **Halts and session controls** applied to the token, with the underlying's halt that triggered them.
- **Proxy distributions** where the token passes votes: the record-date snapshot, what was sent and the instructions returned.

## What This Means for the System You Build

- **Name the claim:** issuer-native, DTC entitlement, backed wrapper or derivative, and model each wrapper as its own instrument with its own issuer.
- **Disclose the issuer's credit** and the missing vote for every wrapper, in plain words, before the first purchase.
- **Hold base units and a dated multiplier,** post corporate actions as events, and pause around activation.
- **Reconcile backing to tokens** across every chain, and treat a gap as a credit event.
- **Take hours and halts from the underlying,** and mark weekend positions by a written policy.
- **Track the US rules by date:** DTC tokens among participants since October 28, 2026; Nasdaq's rule approved March 18, 2026 and waiting on DTC; the venue exemption from September 17, 2026 to September 17, 2031.

## References

**Regulators and guidance**

- [SEC: Order granting temporary conditional exemptive relief for tokenized NMS stock trading venues and liquidity providers (Rel. 34-106402, 91 FR 60168, September 22, 2026)](https://www.federalregister.gov/documents/full_text/text/2026/09/22/2026-19388.txt), the definition and exclusions, Tokenized Securities Venues and Covered Firms, permitted pairs, tier caps, issuer notice and objection, proxy distribution, halts, transparency, no leverage and the September 17, 2031 end date
- [SEC: Order approving SR-NASDAQ-2025-072 (Rel. 34-105047, 91 FR 13900, March 23, 2026)](https://www.federalregister.gov/documents/full_text/text/2026/03/23/2026-05563.txt), tokenized shares on the same book with the same priority, fungibility and the same CUSIP, the tokenization flag, fallback to traditional settlement, the December 11, 2025 DTC letter's eligible securities and registered wallets, 30 days' notice
- [SEC Division of Trading and Markets: No-action letter to DTC on the DTCC Tokenization Services (December 11, 2025)](https://www.sec.gov/files/tm/no-action/dtc-nal-121125.pdf), the pilot's relief, eligible securities including Treasuries, registered wallets and OFAC screening, no collateral or settlement value, and withdrawal three years after launch

**Filings**

- [Robinhood Markets: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000023/hood-20251231.htm), stock tokens as derivative contracts tracking US stocks and ETPs, 24/5 trading, dividends that mirror the underlying, EEA-only availability, the SEC jurisdiction risk, RHEU's MiCA and MiFID licenses and Robinhood Chain

**Vendor documentation**

- [DTCC: Tokenization Service](https://www.dtcc.com/products-and-services/digital-assets/tokenization), 1:1 backing by securities held at DTC, one CUSIP, peer-to-peer transfers between DTC-registered wallets
- [DTCC: DTCC Tokenization Service goes live (October 28, 2026)](https://www.dtcc.com/press-releases/2026/dtcc-tokenization-service-goes-live), launch, conversion of entitlements, Canton and Besu networks, 20 participants and the no-action letter's scope
- [Robinhood: Stock tokens launch (June 30, 2025)](https://robinhood.com/newsroom/robinhood-launches-stock-tokens-reveals-layer-2-blockchain-and-expands-crypto-suite-in-eu-and-us-with-perpetual-futures-and-staking/), 200+ US stock and ETF tokens for EU customers on Arbitrum, 24/5, dividends in the app, no commissions or added spreads
- [xStocks: Documentation](https://docs.xstocks.fi/), 1:1 backing, the bankruptcy-remote SPV, account control agreement and security agent, chains, 24/5 issuance and redemption, the US exclusion
- [xStocks: Dividends and stock splits](https://docs.xstocks.fi/docs/dividends-and-stock-splits), the multiplier, reinvestment net of withholding, split and reverse split examples, publication and 00:30 UTC activation, balanceOf on EVM and metadata on Solana and TON
- [Kraken: xStocks legal terms](https://www.kraken.com/legal/xstocks), Backed Assets (JE) Limited, Payward Digital Solutions Ltd, no ownership, votes or legal claims to the stock, redemption with Backed, excluded countries and depositary risk
- [Kraken: xStocks](https://www.kraken.com/xstocks), 24/5 trading, withdrawal to self-custody and dividends as balance increases
- [Ondo: Ondo Stocks overview](https://docs.ondo.finance/ondo-stocks/overview.md), Ondo Global Markets (BVI) Limited, full backing with cash in transit, the security agent, no shareholder rights, total return, display multipliers, 24/5 with corporate action pauses and chains
- [Superstate: Opening Bell](https://docs.superstate.com/issuers/opening-bell.md), registered shares issued on chain, the digital transfer agent's registry and same rights as traditional shares

**In practice**

- [rwa.xyz: Tokenized stocks (page dated November 5, 2026)](https://app.rwa.xyz/stocks), a data aggregator's distributed value, holders, asset count, monthly transfers and value by platform
