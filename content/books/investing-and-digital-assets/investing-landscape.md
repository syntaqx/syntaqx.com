+++
title = "The Investing & Crypto Landscape"
nav_title = "The Landscape"
description = "Brokers by accounts and assets, wholesalers, crypto exchanges, custodians, stablecoin supply, brokerage APIs, the deals and the 2025-26 IPOs, November 2026."
category = "Investing & Digital Assets Industry"
order = 2502
part = "The Business"
tags = ["investing", "brokerage", "crypto", "stablecoins", "market-size", "consolidation"]
+++

The investing industry looks crowded from an app store and concentrated from a filing cabinet. A handful of brokers carry most retail accounts, a handful of wholesalers fill most retail stock orders, two issuers account for most stablecoins, one custodian holds the bitcoin behind the $67 billion iShares Bitcoin Trust, and a few clearing and API firms sit underneath dozens of apps that never show their names. Crypto adds venues offshore that dwarf the US ones in derivatives volume and a set of US firms that spent 2025 and 2026 going public, buying licenses and applying for bank charters.

Every count in this chapter comes with a definition that differs by company, and the differences are the first thing a builder learns. Schwab reports active brokerage accounts, Robinhood reports funded customers, Interactive Brokers reports customer accounts; client assets, platform assets, customer equity and assets on platform measure different things, and [Investing & Digital Assets Metrics](/books/investing-and-digital-assets/investing-metrics#why-the-same-metric-disagrees) sets out each definition. This chapter maps the brokers, the wholesalers and venues, the crypto exchanges, the custodians, the stablecoin issuers and the API providers from filings and rule-required reports as of November 2026, records who bought whom and who listed, and ends with how to keep that map as data. It adds `market_participants`, `participant_metrics` and `corporate_transactions` to [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model).

## How the Platforms Do It

The largest US retail and active-trader brokers, from their third quarter 2026 releases (each company's own metric names; Fidelity is private and is covered below the table):

| Broker | Accounts (as defined) | Assets (as defined) | Cash and credit | Activity |
| --- | --- | --- | --- | --- |
| **Charles Schwab** | 40.26 million active brokerage accounts | $13.33 trillion of client assets | $492.8 billion of transactional sweep cash; $187.9 billion of margin loans | 10.7 million daily average trades |
| **Interactive Brokers** | 5.58 million customer accounts, up 35% | $964.7 billion of customer equity | $186.2 billion of customer credits; $105.2 billion of margin loans | 4.27 million daily average revenue trades |
| **Robinhood** | 28.7 million funded customers; 5.2 million Gold subscribers | $396 billion of total platform assets | $32.3 billion of cash sweep; $22.1 billion margin book | $992 billion of equity notional and 905 million options contracts in the quarter |

Three patterns run through it:

- **Assets and accounts tell different stories.** Schwab holds about 34 times Robinhood's assets with about 1.4 times its accounts (my arithmetic): about $331,000 of client assets per active account against about $13,800 of platform assets per funded customer. Interactive Brokers sits between them at about $173,000 of customer equity per account. A product decision priced per account and one priced per dollar of assets come out very differently at each firm.
- **Cash and credit are businesses of their own.** Schwab's sweep cash alone is larger than Robinhood's total platform assets, and Interactive Brokers' margin loans are about 11% of its customer equity. [How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models#net-interest-on-cash-and-margin) works through what each earns on them.
- **Activity concentrates where the customers trade most.** Interactive Brokers' 4.27 million daily trades on 5.58 million accounts is about 0.77 trades per account per day; Schwab's 10.7 million on 40.26 million is about 0.27 (my arithmetic). Order systems, market data and surveillance are sized by the trade count, not the account count.

Fidelity, which is private, publishes a corporate page stating "over 80,000 associates," but no audited account or asset totals of the kind a public filing gives. <!-- source-gap: fidelity-assets | missing | Fidelity's assets under administration and account count | closes with: a Fidelity annual report or corporate fact page with dated totals | checked: 2026-11-05 --> Webull, Public, SoFi Invest, eToro, Moomoo and Morgan Stanley's E*Trade complete the retail list; their figures appear in the chapters that use them.

## Wholesalers and Venues

US equity orders from retail customers mostly don't go to an exchange. When the SEC proposed its Order Competition Rule in December 2022, it found that retail brokers "route more than 90% of marketable orders of individual investors in NMS stocks to a small group of six" wholesalers, with two firms capturing about 66% of wholesalers' executed share volume and the six internally executing 23.9% of all NMS stock share volume in the first quarter of 2022. The proposal (File S7-31-22) was among 14 proposed rules the SEC withdrew on June 17, 2025, and the concentration it measured is still visible in every broker's Rule 606 report.

Robinhood Securities' report for April 2026 shows the split for S&P 500 stocks, as a share of non-directed orders, and what each venue paid:

| Venue | Share of non-directed orders | Paid for market orders | Cents per hundred shares |
| --- | --- | --- | --- |
| Virtu Americas | 35.62% | $772,056.10 | 96.31 |
| Citadel Securities | 27.38% | $625,328.42 | 78.09 |
| G1 Execution Services | 13.79% | $663,236.03 | 105.05 |
| Jane Street Capital | 13.19% | $567,312.97 | 116.52 |
| Hudson River Trading | 5.20% | $209,828.49 | 84.82 |

The relationship runs both ways. Citadel Securities alone accounted for 17% of Robinhood's total net revenues in the third quarter of 2026, up from 13% a year earlier, which is a concentration risk the broker discloses and a reason wholesaler agreements are records in [How to Build It](#how-to-build-it). [How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models#payment-for-order-flow) works through what those cents per hundred shares are; [Order Routing, PFOF & Best Execution](/books/investing-and-digital-assets/routing-and-best-execution) reads the whole report.

The exchanges themselves belong to a few groups (Intercontinental Exchange's NYSE markets, Nasdaq, Cboe) plus independents such as IEX and MEMX and newer entrants such as 24X, and overnight trading has run on ATSs. Exchange market share is published daily by the exchanges as market data rather than in a filing, and this chapter doesn't fix a figure to it. <!-- source-gap: exchange-group-shares | missing | dated US equity market share by exchange group | closes with: a dated exchange group market share report or SEC staff analysis | checked: 2026-11-05 --> [US Equity Market Structure](/books/investing-and-digital-assets/equity-market-structure) covers the venues, and [Extended Hours & 24-Hour Trading](/books/investing-and-digital-assets/extended-and-overnight-trading) the overnight ones.

## Crypto Exchanges

Coinbase is the only large US crypto exchange that reports quarterly as a public company with a long history, and its third quarter 2026 deck carries the market figures the others don't publish:

- **Scale.** $377 billion of assets on platform, 12.5% of the total crypto market capitalization, which the company calls the largest platform for crypto stored globally.
- **Share.** 10.7% of global crypto trading volume, up from 5.6% a year earlier, and first in US crypto spot trading volume share by its own measure.
- **Mix.** $1,213.8 billion of total trading volume in the quarter, of which $963.0 billion was crypto derivatives, $134.5 billion crypto spot and $93.5 billion stablecoin volume including mints and burns. Derivatives were about 79% of the volume (my arithmetic), while consumer transaction revenue, $450 million, was still the largest transaction revenue line.

The other US-facing venues are smaller or private:

| Venue | What is public (latest reported) |
| --- | --- |
| **Robinhood** (app and Bitstamp) | $50 billion of crypto notional in the third quarter of 2026, $21 billion in the app and $29 billion on Bitstamp; crypto revenue of $120 million, down 55% |
| **Gemini** | Listed on Nasdaq in September 2025; second quarter 2026 revenue of $45.5 million, of which $12.5 million exchange transactions and $16.2 million from its credit card; prediction markets through Gemini Titan, a CFTC designated contract market |
| **Bullish** | Listed on NYSE in August 2025 (below) |
| **Kraken** (Payward) | Private; no public registration statement on EDGAR as of November 2026; publishes its fee schedule, with Kraken Pro spot fees from 0.40% maker and 0.80% taker down to 0% and 0.05% |

Gemini's card revenue passing its exchange fees in the second quarter of 2026 is the clearest public sign of what US crypto exchanges are doing about volatile trading revenue: adding lines that don't depend on spot volume. Kraken's deals of 2025 and 2026 (NinjaTrader, the Backed xStocks business, Bitnomial) are reported in press but sit outside EDGAR because the company is private. <!-- source-gap: kraken-deals | secondary | Kraken's acquisitions of NinjaTrader, Backed and Bitnomial and their closing dates | closes with: Kraken's own announcements of each closing, or a registration statement | checked: 2026-11-05 -->

Offshore, Binance is the venue whose regulatory record matters most to anyone who interacts with it: its November 2023 resolution with FinCEN, OFAC, the CFTC and the Justice Department is in [Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses#enforcement-defines-the-map), and the October 29, 2026 theft from it, about $6.34 billion of assets impacted by Binance's own count and attributed to North Korea by the FBI as Binance reports it, is in [Crises & the Rules They Wrote](/books/investing-and-digital-assets/crises-and-the-rules#2025-and-2026). OKX, Bybit, Crypto.com, Bitso, Hyperliquid and others complete the global list; [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture) surveys their structures.

## Custodians

Institutional crypto custody is a small set of firms, now mostly with bank or trust charters:

| Custodian | What is public |
| --- | --- |
| **Coinbase Custody Trust Company** | A New York limited purpose trust company; the bitcoin custodian of the iShares Bitcoin Trust, which had $67.4 billion of net assets at December 31, 2025, with Coinbase, Inc. as its prime execution agent |
| **Anchorage Digital Bank** | A national trust bank; named the iShares Bitcoin Trust's additional bitcoin custodian, with no current plan to move the trust's bitcoin there |
| **BitGo** | $81.6 billion of assets on platform at December 31, 2025, down 9.2% from $89.9 billion; over 5,320 clients in over 100 countries, over 1,770 assets supported, $15.6 billion staked, up to $250 million of insurance for qualified custody; listed on NYSE in January 2026 |
| **Fidelity Digital Assets, Paxos, Circle, Ripple** | Conditionally approved for national trust bank charters (Fidelity Digital Assets, Paxos and BitGo as conversions, Circle and Ripple de novo) on December 12, 2025 |
| **Fireblocks, Copper, BNY and others** | Custody technology and services for exchanges, funds and banks; [Custody Platforms & Policy Engines](/books/investing-and-digital-assets/custody-platforms) compares the models |

The concentration worth noticing is in the ETFs: the iShares Bitcoin Trust names one custodian for its bitcoin and an affiliate of the same group as its prime execution agent, and [Crypto ETPs](/books/investing-and-digital-assets/crypto-etps) covers what that means. The charter wave is in [Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses#trust-charters-for-custody), and the general rules for trust banks are in Banking & Lending's [Trust Banks and Novel Charters](/books/banking-and-lending/charters-and-regulators#trust-banks-and-novel-charters).

## Stablecoin Supply

Two issuers hold most of the market. DefiLlama's cross-issuer data, read on November 5, 2026, by circulating supply:

| Token | Issuer or protocol | Circulating |
| --- | --- | --- |
| USDT | Tether | $177.47 billion |
| USDC | Circle | $70.80 billion |
| USDS | Sky | $6.47 billion |
| DAI | Sky (formerly Maker) | $4.69 billion |
| USDe | Ethena | $4.56 billion |
| USD1 | World Liberty Financial | $3.65 billion |
| USDG | Global Dollar Network (issued by Paxos) | $2.75 billion |
| PYUSD | Paxos for PayPal | $2.67 billion |
| RLUSD | Ripple | $2.60 billion |
| BUIDL | BlackRock (a tokenized money market fund, not a payment stablecoin) | $1.88 billion |

USDT and USDC are about 88% of the top twelve's $280.8 billion (my arithmetic). Issuers' own figures run higher than the aggregator's because they count differently and at quarter-end: Tether's attestation as of September 30, 2026 put tokens issued at $183.5 billion, and Circle reported $73.9 billion of USDC in circulation at the same date and a 27% share of US dollar fiat-backed stablecoins. My rule: cite issuers for issuers and one aggregator, dated, for comparisons between them, and never mix the two in one ratio. The list also mixes designs: USDS and DAI are crypto-collateralized, USDe is a synthetic dollar backed by hedged crypto positions, and BUIDL is a fund share, so a "stablecoin market share" depends on which rows the denominator includes ([The Stablecoin Business](/books/investing-and-digital-assets/stablecoin-business) and [Depegs, Runs & Synthetic Dollars](/books/investing-and-digital-assets/depegs-and-synthetic-dollars) cover each design).

## Brokerage APIs

Under many investing apps sits a broker-dealer the customer never sees:

| Provider | What is public |
| --- | --- |
| **Apex Fintech Solutions** | Clearing and custody, margin and stock lending, ACATS, 24x5 trading, an OMS/EMS and FIX engine, fractional trading, cost basis and tax reporting; company figures of $280 billion or more in assets under custody, 42 million or more brokerage accounts and 200 or more clients at September 30, 2026, and 1.1 billion or more trades in the 12 months to July 31, 2026 |
| **Alpaca** | A Broker API used in broker-dealer setups (fully disclosed or omnibus) and by RIAs; in the omnibus setup the partner submits orders to accounts created up front and keeps its end customers' accounting itself |
| **DriveWealth** | Embedded investing from $1 in dollar amounts; US equities, ETFs, OTC securities, mutual funds, fixed income and options; a registered broker-dealer, FINRA and SIPC member, registered in all 50 states |

The split that matters is who carries the customer: in a fully disclosed arrangement the clearing firm carries each end customer's account and knows them by name, and in an omnibus arrangement it carries one account for the partner, which keeps the customer records itself. [Brokerage as a Service](/books/investing-and-digital-assets/brokerage-as-a-service) covers who owns which obligation in each, and the same choice exists for crypto offered through a partner's license.

## Who Bought Whom

Dated, from each acquirer's filing or announcement, as of November 2026:

| Date | Move | Why it matters |
| --- | --- | --- |
| October 2, 2020 | Morgan Stanley completes its all-stock acquisition of E*Trade at 1.0432 Morgan Stanley shares per share | A wirehouse buys a retail online broker |
| October 6, 2020 | Charles Schwab completes its acquisition of TD Ameritrade at 1.0837 Schwab shares per share | Two of the largest retail brokers combine, followed by a multi-year account conversion ([Conversions, Shutdowns & Distributions](/books/investing-and-digital-assets/conversions-and-shutdowns)) |
| February 4, 2025 | Stripe completes its acquisition of Bridge, a stablecoin infrastructure company | A payments company buys stablecoin rails ([Stablecoins](/books/payments/stablecoins)) |
| February 26, 2025 | Robinhood completes its acquisition of TradePMR, an RIA custody and portfolio platform, for about $175 million of cash plus about $100 million of unvested stock compensation | A retail broker buys an advisor custodian |
| June 2, 2025 | Robinhood completes its acquisition of Bitstamp, about $224 million of cash at fair value | A US broker buys a licensed global crypto exchange |
| August 14, 2025 | Coinbase completes its acquisition of Deribit for $4.29 billion ($721 million of cash and $3.57 billion of stock), $2.82 billion of it goodwill | A US exchange buys an offshore crypto options venue, and its volume turns mostly to derivatives |
| October 8, 2025 | Coinbase acquires Echo (Gm Echo Ltd) for $176 million ($68 million of cash, $108 million of stock) | Exchanges keep buying adjacent products |
| December 12, 2025 | The OCC conditionally approves national trust banks for Circle and Ripple and conversions for BitGo, Fidelity Digital Assets and Paxos | Crypto custodians and issuers move under federal supervision |
| January 20, 2026 | Rothera, Robinhood's joint venture with Susquehanna, acquires 90% of MIAXdx, renamed Rothera E&C | A broker co-owns a CFTC-licensed exchange and clearing house |
| March 2, 2026 | Charles Schwab completes its acquisition of Forge Global, agreed November 5, 2025 at $45.00 a share in cash | A retail broker buys a private-company share marketplace |
| June 2026 | Robinhood completes its acquisition of WonderFi, agreed May 12, 2025 at C$0.36 a share | A US broker buys outside the US |

Stripe's purchase of Privy, an embedded wallet provider, in 2025 is reported in press but not in a Stripe announcement this chapter could open. <!-- source-gap: stripe-privy | secondary | Stripe's acquisition of Privy and its date | closes with: a Stripe or Privy announcement of the acquisition | checked: 2026-11-05 -->

Three patterns run through the list. **Brokers buy crypto, and crypto buys derivatives.** Robinhood bought a licensed global exchange; Coinbase, which already ran a CFTC-regulated designated contract market, bought the options venue whose volume now dominates its own. **Everyone wants a charter or a license they didn't have.** The December 2025 trust approvals and Rothera's exchange purchase are the same move as the Bitstamp deal: buy or apply for the permission rather than rent it ([Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses)). **Payments companies buy the stablecoin stack.** Stripe bought Bridge's stablecoin infrastructure, and press reports a wallet provider after it.

## The 2025-26 Listings

Crypto and fintech firms went public in a run that started in May 2025. From each final prospectus (Form 424B4):

| Prospectus date | Company | Venue and ticker | Price | Shares offered | Net proceeds to the company |
| --- | --- | --- | --- | --- | --- |
| May 13, 2025 | eToro | Nasdaq, ETOR | $52.00 | 5,961,509 by the company and 5,961,509 by selling holders | $291.4 million |
| June 4, 2025 | Circle | NYSE, CRCL | $31.00 | 34,000,000 (14.8 million by the company, 19.2 million by selling holders) | $433.6 million |
| August 12, 2025 | Bullish | NYSE, BLSH | $37.00 | 30,000,000 | $1,054.5 million |
| September 10, 2025 | Figure Technology | Nasdaq, FIGR | $25.00 | 31,500,000 (23,506,605 by the company) | $552.4 million |
| September 11, 2025 | Gemini | Nasdaq, GEMI | $28.00 | 15,178,572 | $398.4 million |
| December 11, 2025 | Wealthfront | Nasdaq, WLTH | $14.00 | 34,615,384 (21,468,038 by the company) | $282.1 million |
| January 21, 2026 | BitGo | NYSE, BTGO | $18.00 | 11,026,365 by the company and 795,230 by selling holders | $184.6 million |

Galaxy Digital moved its listing to Nasdaq in May 2025 and sold shares in its first underwritten US offering as a listed company at $19.00 on May 29, 2025; Gemini also sold 1,904,761 shares to Nasdaq, Inc. in a concurrent private placement at $26.25. Grayscale Investments filed a public registration statement on November 13, 2025 and amended it in January 2026 but had not priced as of November 5, 2026; Kraken had filed none publicly.

A listing changes what a builder can know about a counterparty. A listed exchange, custodian or issuer files quarterly results, a risk factor list, its material agreements (Circle's collaboration agreement with Coinbase is an exhibit) and an 8-K under Item 1.05, generally within four business days of determining that a cybersecurity incident is material, as Coinbase did in May 2025 ([Crises & the Rules They Wrote](/books/investing-and-digital-assets/crises-and-the-rules#2025-and-2026)). A private one publishes what it chooses.

## How to Build It

A platform that routes to wholesalers, holds assets at custodians, lists stablecoins and partners with clearing and API firms needs a record of each outside firm, its metrics as reported and dated, and its corporate history. These extend `legal_entities` (the platform's own companies) and `venues` (where orders fill) from [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) with the firms around them:

```sql
CREATE TABLE market_participants (         -- outside firms: counterparties, peers, issuers
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_name          TEXT NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('broker', 'clearing_firm', 'wholesaler',
                        'exchange', 'ats', 'crypto_exchange', 'custodian', 'stablecoin_issuer',
                        'brokerage_api', 'adviser', 'clearing_house', 'data_provider')),
  lei                 CHAR(20),              -- ISO 17442 legal entity identifier
  crd_number          INT,                   -- FINRA CRD, for broker-dealers and advisers
  sec_cik             INT,                   -- EDGAR filer ID, for filings
  venue_id            UUID REFERENCES venues (id),  -- when the firm is also a venue we route to
  parent_id           UUID REFERENCES market_participants (id),
  is_public           BOOLEAN NOT NULL,
  UNIQUE (lei)
);

CREATE TABLE participant_metrics (         -- reported figures, with their definitions
  participant_id      UUID NOT NULL REFERENCES market_participants (id),
  metric              TEXT NOT NULL,         -- 'funded_customers', 'active_brokerage_accounts',
                                             -- 'client_assets', 'assets_on_platform', 'circulating'
  definition_ref      TEXT NOT NULL,         -- how the source defines it, quoted or summarized
  as_of               DATE NOT NULL,
  value               NUMERIC(38, 4) NOT NULL,
  unit                TEXT NOT NULL,         -- 'count', 'USD', 'percent', 'contracts'
  source_kind         TEXT NOT NULL CHECK (source_kind IN ('10-K', '10-Q', '8-K', '424B4',
                        '606_report', 'attestation', 'company_page', 'aggregator', 'regulator')),
  source_url          TEXT NOT NULL,
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (participant_id, metric, as_of, source_kind)
);

CREATE TABLE corporate_transactions (      -- acquisitions, listings, charters, failures
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                TEXT NOT NULL CHECK (kind IN ('acquisition', 'merger', 'ipo',
                        'direct_listing', 'charter_approval', 'license_grant', 'bankruptcy',
                        'name_change', 'wind_down')),
  subject_id          UUID NOT NULL REFERENCES market_participants (id),
  counterparty_id     UUID REFERENCES market_participants (id),  -- the acquirer
  announced_on        DATE,
  effective_on        DATE,                  -- closing, pricing or approval date
  consideration       JSONB,                 -- cash, shares, exchange ratio, as filed
  source_url          TEXT NOT NULL
);
```

Design notes:

- **A metric is meaningless without its definition.** `participant_metrics` stores the source's own metric name and how it defines it, so funded customers and active brokerage accounts are never summed or compared as if they were the same thing; the Metrics chapter covers the definitions.
- **Key outside firms on public identifiers.** LEI, FINRA CRD and SEC CIK are how 606 reports, FINRA BrokerCheck, EDGAR and regulators name a firm; names change (and the Robinhood 606 report spells one venue in capitals), identifiers don't.
- **A wholesaler is both a participant and a venue.** `venue_id` links the firm a broker pays and is paid by to the venue its orders route to, so a 606 line, a revenue concentration and a routing decision join on one row.
- **Corporate events are effective-dated facts.** An acquisition changes who a custodian's parent is, which licenses stand behind an exchange and which entity a contract is with; record the event with its source rather than updating the name ([Temporal Data](/docs/database/temporal-data#effective-dated-rows)).

## Auditing

- **Every figure with its source and date.** A market share, an asset total or a supply figure used in a decision or a disclosure is kept with its filing or page and its as-of date, so it can be re-checked when the source restates.
- **Counterparty concentration over time.** Each wholesaler's, custodian's and issuer's share of the platform's routing, revenue or holdings by period, since filings disclose concentration and examiners ask about it.
- **Corporate changes behind each counterparty.** Which parent, charter and licenses stood behind a custodian or partner on the date an asset was placed with it.

## What This Means for the System You Build

- **Expect concentration at every layer:** a few wholesalers, two stablecoin issuers, one custodian behind a $67 billion ETF; design for the day one of them changes terms or fails.
- **Compare firms only on matching definitions,** and store each metric with the source's own definition and date.
- **Key counterparties on LEI, CRD and CIK,** not names.
- **Record acquisitions, charters and listings as dated events,** because they change who stands behind an asset you hold with them.
- **Prefer counterparties that file.** A listed or chartered firm discloses what a private one may not, and its filings are the cheapest diligence available.

## References

**Regulators and guidance**

- [SEC: Order Competition Rule, proposed rule (88 FR 128, January 3, 2023)](https://www.govinfo.gov/content/pkg/FR-2023-01-03/html/2022-27617.htm), six wholesalers receiving more than 90% of individual investors' marketable orders, two with about 66% of wholesaler volume and 23.9% of NMS share volume internalized in the first quarter of 2022
- [SEC: Withdrawal of Proposed Regulatory Actions (90 FR 25531, June 17, 2025)](https://www.federalregister.gov/api/v1/documents/2025-11110.json), 14 proposed rules withdrawn, including File S7-31-22
- [OCC: Conditional approvals of national trust bank charters (NR 2025-125, December 12, 2025)](https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-125.html), Circle, Ripple, BitGo, Fidelity Digital Assets and Paxos
- [SEC: Press Release 2023-139 (July 26, 2023)](https://www.sec.gov/newsroom/press-releases/2023-139), Form 8-K Item 1.05 and its four-business-day timing

**Filings**

- [Charles Schwab: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/316709/000031670926000035/a3q26exhibit991.htm), active brokerage accounts, client assets, sweep cash, margin loans and daily average trades
- [Interactive Brokers: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1381197/000138119726000154/ibkr-ex99_1.htm), customer accounts, customer equity, customer credits, margin loans and DARTs
- [Robinhood Markets: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000164/q32026robinhoodexhibit991.htm), funded customers, platform assets, Gold subscribers, margin book, cash sweep, trading volumes and crypto notional by app and Bitstamp
- [Robinhood Markets: Form 10-Q for the third quarter of 2026](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000167/hood-20260930.htm), Citadel Securities' share of net revenues and the WonderFi closing
- [Robinhood Markets: Form 10-Q for the second quarter of 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387925000251/hood-20250630.htm), the TradePMR and Bitstamp closings and consideration, and the WonderFi agreement
- [Robinhood Securities: Rule 606 report, second quarter 2026](https://cdn.finra.org/606/2026/287900_606_NMS_2026_Q2_V1.pdf), April 2026 S&P 500 venue shares and payments
- [Coinbase Global: Third quarter 2026 earnings deck](https://www.sec.gov/Archives/edgar/data/0001679788/000167978826000121/q326earningsdeck_vsec.htm), assets on platform and share of market capitalization, trading volume share and volume by product
- [Coinbase Global: Form 10-Q for the third quarter of 2026](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000122/coin-20260930.htm), the Deribit and Echo acquisitions
- [Coinbase Global: Form 8-K for the Deribit agreement (May 8, 2025)](https://www.sec.gov/Archives/edgar/data/1679788/000167978825000086/coin-20250508.htm), the agreed consideration
- [Coinbase Global: Form 8-K (Item 1.05) dated May 14, 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978825000094/coin-20250514.htm), the cybersecurity incident disclosure
- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), Coinbase Custody Trust Company as a New York limited purpose trust company
- [Gemini Space Station: Form 10-Q for the second quarter of 2026](https://www.sec.gov/Archives/edgar/data/0002055592/000205559226000065/gemi-20260630.htm), revenue by line and Gemini Titan's DCM license
- [BitGo Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1740604/000174060426000020/btgo-form10xk.htm), assets on platform, clients, assets supported and staked, insurance and the national trust bank conversion
- [iShares Bitcoin Trust ETF: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1980994/000143774926006058/bit20251231_10k.htm), the bitcoin custodian, additional custodian, prime execution agent and net assets
- [Circle Internet Group: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000309/finalq3epr-110326.htm), USDC in circulation and stablecoin market share
- [Charles Schwab: Form 8-K completing the TD Ameritrade acquisition (October 6, 2020)](https://www.sec.gov/Archives/edgar/data/316709/000095010320019743/dp138313_8k.htm), the closing and exchange ratio
- [Morgan Stanley: Completion of the E*Trade acquisition (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/895421/000095010320019435/dp138036_ex9901.htm), the October 2, 2020 closing and exchange ratio
- [Forge Global: Form 8-K completing the merger with Charles Schwab](https://www.sec.gov/Archives/edgar/data/1827821/000182782126000010/forge8-kschwabmergerclose.htm), the March 2, 2026 closing and $45.00 per share
- [eToro Group: Prospectus (424B4)](https://www.sec.gov/Archives/edgar/data/1493318/000121390025043558/ea0223534-12.htm), price, shares and proceeds
- [Circle Internet Group: Prospectus (424B4)](https://www.sec.gov/Archives/edgar/data/1876042/000119312525135795/d737521d424b4.htm), price, shares and proceeds
- [Bullish: Prospectus (424B4)](https://www.sec.gov/Archives/edgar/data/1872195/000110465925077583/tm2421409-32_424b4.htm), price, shares and proceeds
- [Figure Technology Solutions: Prospectus (424B4)](https://www.sec.gov/Archives/edgar/data/2064124/000206412425000013/figuretechnologysolutionsi.htm), price, shares and proceeds
- [Gemini Space Station: Prospectus (424B4)](https://www.sec.gov/Archives/edgar/data/2055592/000110465925089710/tm255912-34_424b4.htm), price, shares, proceeds and the Nasdaq private placement
- [Wealthfront: Prospectus (424B4)](https://www.sec.gov/Archives/edgar/data/1524566/000162828025056780/wealthfront-424b4.htm), price, shares and proceeds
- [BitGo Holdings: Prospectus (424B4)](https://www.sec.gov/Archives/edgar/data/1740604/000162828026003180/bitgoholdingsinc424b4-janu.htm), price, shares and proceeds
- [Galaxy Digital: Prospectus (424B4, May 29, 2025)](https://www.sec.gov/Archives/edgar/data/1859392/000162828025028640/galaxydigitalinc-capitalra.htm), the first underwritten offering as a listed company
- [SEC EDGAR: Grayscale Investments filings](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0002073548), the registration statement and amendment without a final prospectus

**Vendor documentation**

- [Tether: Q3 2026 attestation release](https://tether.io/news/tether-generates-1-5-billion-in-q3-net-operating-profit-as-reserve-buffer-doubles-to-almost-8-billion/), tokens issued as of September 30, 2026
- [DefiLlama: Stablecoins API](https://stablecoins.llama.fi/stablecoins?includePrices=false), circulating supply by token, read November 5, 2026
- [Apex Fintech Solutions](https://apexfintechsolutions.com/), services and company figures
- [Alpaca: About Broker API](https://docs.alpaca.markets/docs/about-broker-api), broker-dealer, omnibus and RIA setups
- [DriveWealth](https://www.drivewealth.com/), products, minimums and registration
- [Fidelity: About Fidelity](https://about.fidelity.com/), associates and locations
- [Stripe: Stripe completes Bridge acquisition](https://stripe.com/newsroom/news/stripe-completes-bridge-acquisition), the February 4, 2025 completion
- [Galaxy: Intent to list on Nasdaq](https://www.galaxy.com/newsroom/galaxy-intent-to-list-on-nasdaq-may-16), the May 16, 2025 listing plan

**In practice**

- [BleepingComputer: FBI links $6.3 billion Binance crypto heist to North Korean hackers (November 1, 2026)](https://www.bleepingcomputer.com/news/security/fbi-links-63-billion-binance-crypto-heist-to-north-korean-hackers/), the amount and attribution
- [Binance: 29 October 2026 Binance security incident, initial findings and response update (November 3, 2026)](https://www.binance.com/en/blog/community/3229153443759566763), the amounts impacted and frozen and Binance's account of the FBI's attribution
