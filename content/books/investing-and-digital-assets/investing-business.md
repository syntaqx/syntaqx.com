+++
title = "The Investing & Digital Assets Business"
nav_title = "The Investing Business"
description = "How brokers, crypto exchanges, custodians and stablecoin issuers work: the parties, the money, the life of a trade and a stablecoin dollar, and the data model."
category = "Investing & Digital Assets Industry"
order = 2501
part = "The Business"
tags = ["investing", "brokerage", "crypto", "stablecoins", "business-models", "data-model"]
+++

Investing is a promise about ownership. A customer hands a broker dollars and is promised that the shares the app shows are really theirs, bought at a fair price, held apart from the firm's own assets and deliverable to another firm on request. A crypto exchange makes the same promise about bitcoin it holds in its own wallets on the customer's behalf, and a stablecoin issuer makes a narrower one: a token on a public chain for every dollar it holds in reserve, redeemable at par. The firm in the middle earns on the trades it routes or matches, on the cash and collateral it holds, on the assets it manages or safeguards and, for an issuer, on the reserve itself. A retail broker on a clearing firm, a self-clearing broker with its own NSCC and DTC memberships, a robo-adviser, an offshore perpetuals venue, a qualified custodian with an OCC trust charter and a DeFi protocol with no company behind its pools are all doing some part of that, and each is regulated, or argued to be unregulated, for the part it does.

The software is hard because the same asset is recorded in several places that must agree to the smallest unit. A share of stock exists in the broker's ledger, its clearing firm's books, NSCC's netted obligations, DTC's book-entry position for the clearing firm, and the broker's stock record, which must say where every share it owes a customer is actually held. A bitcoin exists in the exchange's internal ledger as a customer balance, in an omnibus wallet the exchange controls, and on a chain that knows nothing about customers and occasionally rewrites its last few blocks. A stablecoin exists as a balance in a token contract on a dozen chains, as a liability on the issuer's books and as Treasury bills and cash at custodians. When a firm let those records drift apart, as Celsius and FTX did, customers learned in bankruptcy court which record was the real one. This chapter is the map the rest of the volume uses: how to read it, the parties, how the money is made, the life of a stock trade, a crypto trade and a stablecoin dollar, and the data model every later chapter extends. Terms are collected in the volume's [Glossary](/books/investing-and-digital-assets/glossary).

## How to Read This Volume

The volume follows an asset from the account that holds it to the market that prices it, the house that settles it, the chain that records it and the law that governs it, in thirteen parts plus a reference:

- **The Business.** This chapter; [The Investing & Crypto Landscape](/books/investing-and-digital-assets/investing-landscape) (brokers by accounts and assets from filings, wholesalers and exchanges by share, crypto exchanges by volume, custodians, stablecoin supply by issuer, brokerage APIs, the consolidation and the 2025-26 IPOs); [How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models) (payment for order flow and rebates, net interest, sweeps, securities lending, subscriptions, crypto spreads and fee tiers, staking commissions, custody fees, reserve income and distribution payments, rate sensitivity read from 10-Ks); [Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses) (the SEC, FINRA, the CFTC, state regulators, the OCC, NYDFS, FinCEN, the IRS and SIPC, which registration each activity needs, and one company as many entities); and [Crises & the Rules They Wrote](/books/investing-and-digital-assets/crises-and-the-rules) (a dated timeline from 1929 to the GENIUS Act linking each crisis to its rule and chapter).
- **Accounts and Positions.** [Opening Accounts](/books/investing-and-digital-assets/opening-accounts) (account types and titling, broker and crypto CIP, the investment profile, approvals for options, margin, crypto, futures and event contracts, trusted contacts, tax certifications, custodial accounts, privacy notices); [Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions) (double entry across cash and assets, trade date and settlement date positions, the stock record, omnibus and segregated, buying power and withdrawable cash, crypto units); [Funding & Account Transfers](/books/investing-and-digital-assets/funding-and-transfers) (ACH and instant deposits as credit risk, wires, returns, ACATS, crypto transfers at account level, transfer fraud); [Cash, Sweeps & Yield](/books/investing-and-digital-assets/cash-and-sweeps) (free credit balances, bank and money market sweeps, the sweep-rate suits, interest on cash, crypto yield programs and the stablecoin interest ban); [Corporate Actions & Asset Events](/books/investing-and-digital-assets/corporate-actions) (dividends, splits, mergers, spinoffs, tender offers, proxy voting, and forks, airdrops, migrations and delistings on chains); [Fractional Shares & Recurring Investing](/books/investing-and-digital-assets/fractional-and-recurring) (how fractions are created, dollar-based orders, rounding, recurring buys and DRIP); [Cost Basis, Tax Lots & Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots) (relief methods, covered and noncovered securities, wash sales across accounts, per-wallet crypto basis, the lot engine); and [Confirms, Statements & Tax Forms](/books/investing-and-digital-assets/statements-and-tax-forms) (Rule 10b-10 confirms, statements, the 1099 composite, 1099-DA, 1042-S, corrections).
- **Trading and Markets.** [Orders & Order Types](/books/investing-and-digital-assets/orders-and-order-types) (order types, time in force, extended hours, notional orders, the OMS state machine, FIX, cancel/replace races); [US Equity Market Structure](/books/investing-and-digital-assets/equity-market-structure) (exchanges, ATSs, wholesalers, the NBBO, SIPs and direct feeds, Reg NMS, access fees and tick sizes, auctions); [Order Routing, PFOF & Best Execution](/books/investing-and-digital-assets/routing-and-best-execution) (FINRA 5310, Rule 606 and 605 reports read line by line, price improvement, smart order routers, crypto best execution); [Order Books & Matching Engines](/books/investing-and-digital-assets/order-books-and-matching) (priority rules, data structures, determinism and sequencers, replay, self-trade prevention, latency); [Market Data](/books/investing-and-digital-assets/market-data) (L1 to L3, SIP and direct feed fees, crypto WebSocket feeds, candles, fan-out, entitlements and licensing); [Options](/books/investing-and-digital-assets/options-trading) (OCC symbology, approval levels, the ODD, exercise, assignment and expiration, 0DTE, multi-leg orders); [Margin & Short Selling](/books/investing-and-digital-assets/margin-and-short-selling) (Reg T, FINRA 4210, margin calls, portfolio margin, the end of the pattern day trader rule, Reg SHO, securities lending, crypto margin); [Pre-Trade Risk, Halts & Volatility](/books/investing-and-digital-assets/pre-trade-risk-and-halts) (the market access rule, kill switches, LULD and circuit breakers, the January 2021 buying restrictions, crypto venue breakers); [Extended Hours & 24-Hour Trading](/books/investing-and-digital-assets/extended-and-overnight-trading) (overnight ATSs, the 23-hour exchange sessions, what clearing and the SIPs had to change); [Futures & FCMs](/books/investing-and-digital-assets/futures-and-fcms) (DCMs, FCMs, segregation, daily settlement, retail and crypto futures); and [Event Contracts & Prediction Markets](/books/investing-and-digital-assets/prediction-markets) (CFTC event contract rules, the election and sports contract cases, how a contract is listed, priced and resolved).
- **Clearing and Settlement.** [Clearing & Settlement](/books/investing-and-digital-assets/clearing-and-settlement) (NSCC, CNS netting, DTC, T+1 and affirmation, the clearing fund, self-clearing and introducing brokers, fails and buy-ins, options at OCC, crypto prefunding as contrast); [Customer Protection, Net Capital & SIPC](/books/investing-and-digital-assets/customer-protection) (Rule 15c3-3 possession or control and the reserve formula, Rule 15c3-1, SIPC coverage and liquidations, crypto customer protection by contrast); [Books, Records & the Audit Trail](/books/investing-and-digital-assets/books-records-and-cat) (Rules 17a-3 and 17a-4, off-channel communications, the Consolidated Audit Trail, Reg S-P, crypto recordkeeping); [Market Surveillance & Manipulation](/books/investing-and-digital-assets/market-surveillance) (spoofing, wash trading, insider trading, pump and dump, surveillance systems and supervision, crypto venue surveillance); and [Brokerage as a Service](/books/investing-and-digital-assets/brokerage-as-a-service) (fully disclosed clearing, omnibus and disclosed accounts, who owns which obligation, crypto as a service).
- **Wealth and Advice.** [Advice, Reg BI & Conduct](/books/investing-and-digital-assets/advice-and-conduct) (broker versus adviser, Reg BI, Form CRS, fiduciary duty, the marketing rule, communications, finfluencers); [Robo-Advisors & Model Portfolios](/books/investing-and-digital-assets/robo-advisors) (questionnaires to allocations, rebalancing and drift, cash drag, fees); [Tax-Loss Harvesting & Direct Indexing](/books/investing-and-digital-assets/tax-loss-harvesting-and-direct-indexing) (harvesting logic, wash sale avoidance, substitutes, tracking error); [IRAs & Retirement Accounts](/books/investing-and-digital-assets/retirement-accounts) (contributions, rollovers, the custodian role, RMDs, 5498 and 1099-R, crypto in IRAs); [Portfolio Accounting & Performance](/books/investing-and-digital-assets/portfolio-accounting) (time-weighted and money-weighted returns, GIPS, benchmarks, 24/7 marks); and [RIA Custodians & Advisor Platforms](/books/investing-and-digital-assets/advisor-platforms) (the custody rule, block trading and allocation, advisory fee billing, model marketplaces).
- **Chains and Wallets.** [Blockchains for Platform Engineers](/books/investing-and-digital-assets/blockchains-for-engineers) (UTXO and account models, fee markets, finality per chain, reorgs, mempools); [Tokens & Token Standards](/books/investing-and-digital-assets/tokens-and-standards) (ERC-20 and its exceptions, NFTs, SPL tokens, fee-on-transfer and rebasing tokens, admin keys, freeze functions, spoofed tokens); [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing) (HD wallets, HSMs, multisig, MPC and threshold signatures, ceremonies, policy engines); [Wallets](/books/investing-and-digital-assets/wallets) (custodial and self-custody, smart accounts, passkey and embedded wallets, drainers and address poisoning); [Chain Data & Indexing](/books/investing-and-digital-assets/chain-data-and-indexing) (nodes and RPC, reorg-safe ingestion, indexers, balances at a block, oracles for marks); and [Layer 2s, Bridges & Cross-Chain](/books/investing-and-digital-assets/layer-2s-and-bridges) (rollups, withdrawal delays, bridge designs and the bridge hacks).
- **Crypto Exchanges.** [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture) (the components, the internal ledger versus the chain, omnibus custody, brokerage and order-book sides, US and offshore structures); [Deposits & Withdrawals](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals) (address generation, memo chains, confirmation policies, reorg handling, sweeping, withdrawal pipelines, stuck transactions, wrong-network deposits); [Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets) (tiers and limits, rebalancing, cold storage ceremonies, treasury reconciliation); [Listing & Delisting Assets](/books/investing-and-digital-assets/listing-assets) (diligence, integration checklists, insider risk, delistings, migrations and forks); [Crypto Trading Products](/books/investing-and-digital-assets/crypto-trading-products) (simple buy and convert, order-book trading, maker/taker tiers, RFQ and OTC, liquidity sourcing); [Perpetuals & Crypto Derivatives](/books/investing-and-digital-assets/perpetuals-and-crypto-derivatives) (funding rates, mark and index prices, liquidation engines, insurance funds, auto-deleveraging, the October 10, 2025 cascade, on-chain perps); [Staking as a Product](/books/investing-and-digital-assets/staking) (custodial staking, commissions, unbonding, slashing pass-through, liquid staking, the SEC's statements); [Proof of Reserves & Liabilities](/books/investing-and-digital-assets/proof-of-reserves) (Merkle-sum trees, zk proofs, attestation versus audit, what PoR can't show); [Exchange Security & Hacks](/books/investing-and-digital-assets/exchange-security) (the hack record, signing controls, anomaly detection, insider threat, reimbursement); and [FTX, Celsius & the 2022 Collapse](/books/investing-and-digital-assets/exchange-collapses) (the 2022 failures told as engineering failures, from the court record).
- **Institutional Crypto.** [Qualified Custody](/books/investing-and-digital-assets/qualified-custody) (the custody rule and crypto, state and national trust companies, bank custody after SAB 121, bankruptcy remoteness, insurance); [Custody Platforms & Policy Engines](/books/investing-and-digital-assets/custody-platforms) (segregated and omnibus custody, governance and quorums, off-exchange settlement, sub-custody); [Crypto ETPs](/books/investing-and-digital-assets/crypto-etps) (spot bitcoin and ether ETPs, generic listing standards, creation and redemption, custodians, staking inside ETPs); [Prime Brokerage, OTC & Crypto Lending](/books/investing-and-digital-assets/crypto-prime-and-lending) (institutional credit, collateral, OTC desks, the Genesis and Three Arrows lessons); and [Accounting for Crypto & Treasury Companies](/books/investing-and-digital-assets/crypto-accounting) (fair value, SAB 122, custody disclosures, digital asset treasury companies).
- **Stablecoins.** [The Stablecoin Business](/books/investing-and-digital-assets/stablecoin-business) (reserve income, distribution costs, Tether's economics, supply by issuer, bank and fintech coins); [Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin) (mint and burn, the reserve, attestations, multichain supply, CCTP, redemption operations); [Stablecoin Law](/books/investing-and-digital-assets/stablecoin-law) (the GENIUS Act and its rules, state regimes, MiCA, the UK); [Freezes, Blacklists & Seizures](/books/investing-and-digital-assets/freezes-and-onchain-compliance) (freeze functions, OFAC-driven freezes, law enforcement requests, what issuer and exchange each do); and [Depegs, Runs & Synthetic Dollars](/books/investing-and-digital-assets/depegs-and-synthetic-dollars) (USDC at SVB, Terra, crypto-collateralized and synthetic designs, tokenized deposits).
- **Decentralized Finance.** [DEXs & AMMs](/books/investing-and-digital-assets/dexs-and-amms) (constant product math, slippage, concentrated liquidity, hooks, impermanent loss, aggregators, on-chain order books); [DeFi Lending & Liquidations](/books/investing-and-digital-assets/defi-lending) (collateral factors, health factors, rate curves, liquidations, bad debt); [Oracles & MEV](/books/investing-and-digital-assets/oracles-and-mev) (price oracles and their manipulation, sandwiches, proposer-builder separation, private order flow); [Smart Contract Risk & Exploits](/books/investing-and-digital-assets/smart-contract-risk) (audits, verification, upgradeability, governance attacks, post-mortems by class); and [DeFi from a Regulated Platform](/books/investing-and-digital-assets/defi-from-a-regulated-platform) (self-custody wallets and DEX trading inside a regulated app, contract screening, the DeFi broker rule's repeal).
- **Tokenization.** [Tokenized Treasuries & Funds](/books/investing-and-digital-assets/tokenized-funds) (BUIDL, BENJI, Ondo and others, on-chain transfer agents, NAV and dividends on chain, use as collateral); [Tokenized Stocks & 24/7 Securities](/books/investing-and-digital-assets/tokenized-stocks) (stock tokens, wrappers versus native issuance, DTC and exchange tokenization, the SEC's posture); and [Transfer Agents & Permissioned Tokens](/books/investing-and-digital-assets/transfer-agents-and-permissioned-tokens) (transfer agent rules, the official record on chain, allowlisted transfers, forced transfers and recovery).
- **The Rules.** [Securities, Commodities & Crypto Market Structure](/books/investing-and-digital-assets/securities-or-commodities) (Howey and the cases, the 2025 dismissals, the SEC's 2026 taxonomy and proposed Regulation Crypto Assets, the CLARITY Act, CFTC spot authority); [Licensing a Crypto Business](/books/investing-and-digital-assets/crypto-licensing) (MSB registration, state money transmission, the BitLicense, California's DFAL, trust charters, MiCA CASP authorization); [AML & the Travel Rule for Crypto](/books/investing-and-digital-assets/crypto-aml-and-travel-rule) (FATF and FinCEN's rule, Travel Rule protocols, unhosted wallets, enforcement, Tornado Cash and Samourai); [On-Chain Analytics & Investigations](/books/investing-and-digital-assets/blockchain-analytics) (clustering, attribution, risk scoring, KYT, tracing hacks); [Crypto Tax](/books/investing-and-digital-assets/crypto-tax) (property treatment, 1099-DA, per-wallet basis, staking income, airdrops, wash sale status, CARF); and [Beyond the US](/books/investing-and-digital-assets/beyond-the-us) (MiFID II, MiCA, the UK, Singapore, Hong Kong, the UAE, Canada).
- **Running the Platform.** [Trading Platform Architecture](/books/investing-and-digital-assets/trading-platform-architecture) (OMS, ledger, risk, market data, wallets and chain watchers as services, event sourcing, 24/7 operations, multi-entity design); [Peak Days, Outages & Resilience](/books/investing-and-digital-assets/peak-days-and-outages) (the broker outages and crypto volatility days, load shedding, Reg SCI, business continuity, compensation); [Account Security & Fraud](/books/investing-and-digital-assets/account-security) (takeover and SIM swaps, withdrawal holds, device binding, support social engineering, elder exploitation); [AI in Investing](/books/investing-and-digital-assets/ai-in-investing) (assistants, AI advice, AI-washing enforcement, agents with wallets); [Investing & Digital Assets Metrics](/books/investing-and-digital-assets/investing-metrics) (funded accounts, assets, net deposits, DARTs, take rate, stablecoin supply, as filings define each); and [Conversions, Shutdowns & Distributions](/books/investing-and-digital-assets/conversions-and-shutdowns) (brokerage conversions, changing clearing firms, exchange exits, bankruptcy distributions, unclaimed property).
- **Reference.** A [Glossary](/books/investing-and-digital-assets/glossary) of every term the volume defines, grouped by part.

The volume covers what investing and digital assets add. The general engineering lives in the playbook, and chapters link to it rather than repeat it: [Money & Amounts](/docs/money/amounts), [Payment States & Ledgers](/docs/money/payment-states), [Multi-Currency](/docs/money/multi-currency), [Idempotency](/docs/requests/idempotency), [Accounting](/docs/money/accounting), [Temporal Data](/docs/database/temporal-data), [Rules as Data](/docs/building-blocks/rules-as-data), [Events & Async Messaging](/docs/architecture/events), [Reservations & Holds](/docs/building-blocks/reservations-and-holds), [Multi-Tenancy](/docs/architecture/multi-tenancy) and [Audit Trails](/docs/building-blocks/audit-trails). Other volumes own topics this one leans on. [Payments](/books/payments/stablecoins) owns stablecoins as a payment rail (pay-ins, payouts, ramps and a provider's GENIUS duties), [crypto-linked cards](/books/payments/card-issuing#crypto-and-stablecoin-linked-cards), [crypto purchases as a high-risk vertical](/books/payments/payments-by-vertical#crypto-purchases), [money transmission licensing](/books/payments/becoming-a-payment-provider) and [ACH](/books/payments/ach). [Banking & Lending](/books/banking-and-lending/charters-and-regulators#trust-banks-and-novel-charters) owns bank and trust charters, [deposit insurance](/books/banking-and-lending/deposit-insurance), [BSA/AML programs](/books/banking-and-lending/bsa-aml), [sanctions screening](/books/banking-and-lending/sanctions-screening), [KYC](/books/banking-and-lending/kyc-and-account-opening) and [program ledgers and the Synapse lesson](/books/banking-and-lending/program-ledgers). [Hosting & Cloud](/books/hosting-and-cloud/blockchain-nodes-and-validators) owns running nodes and validators, [User-Generated Platforms](/books/user-generated-platforms/crypto-investment-scams) owns crypto investment scams on social platforms, [Workplace & Collaboration](/books/workplace-and-collaboration/retention-and-legal-hold) owns communications retention tooling, and [Gaming](/books/gaming/economies-and-entitlements) owns in-game tokens. This volume owns the asset behind each of them: who holds it, how it trades and settles, how the ledger proves whose it is, and what the firm discloses, reports and is examined on.

The volume is US-centric, with the EU and UK where their rules bind or teach. No single company is the model: the vocabulary and tables are the industry's, benchmarked across retail brokers (Robinhood, Charles Schwab, Fidelity, Interactive Brokers, Webull, Public and others), wholesalers and venues, brokerage APIs, crypto exchanges (Coinbase, Kraken, Gemini, Bullish, Binance, OKX and others), custodians (Anchorage Digital, BitGo, Fireblocks, Copper and others), stablecoin issuers (Circle, Tether, Paxos and others) and protocols, and a company's own product name appears only where the chapter is describing that company.

## Who's Who

| Party | Who they are | What they need from the system |
| --- | --- | --- |
| **Investors** | Retail customers, advised clients, institutions, funds and trading firms, from a teenager's custodial account to a market maker on a co-located connection | Their holdings shown correctly, their orders filled at a fair price, their assets deliverable on request, and the tax forms right |
| **Brokers** | Broker-dealers registered with the SEC and members of FINRA, carrying customer accounts and taking orders; introducing brokers send their customers' trades to a clearing firm, self-clearing brokers carry and settle them themselves | A ledger and stock record that agree every day, best execution they can prove, and every record the rules require |
| **Clearing firms and custodians** | Broker-dealers that clear and carry accounts for introducing brokers; banks and trust companies that safekeep securities and crypto, including qualified custodians for advisers and ETPs | Positions reconciled to the depository or the chain, customer assets kept apart from the firm's, and control of every key and every share |
| **Exchanges, ATSs and wholesalers** | Registered national securities exchanges, alternative trading systems, and wholesale market makers that buy retail order flow and fill it off-exchange | Orders in a format they accept, risk checks before they reach the book, and payment terms for the flow |
| **Clearing houses and depositories** | NSCC (equities, with CNS netting), DTC (the depository and settlement by book entry), OCC (listed options), and the futures clearing houses | Trades compared and affirmed on time, margin paid when called, and deliveries made on settlement date |
| **Crypto exchanges** | Platforms that hold customer cash and crypto in omnibus wallets, run an order book or a simple buy flow, and move assets on and off chains; licensed as money transmitters, BitLicensees, trust companies or MiCA CASPs, or offshore | An internal ledger that agrees with the chain at a block height, deposits credited only when final, and withdrawals that can't be forged or replayed |
| **Stablecoin issuers** | Companies that mint tokens against dollars and redeem them at par, holding a reserve of cash, Treasury bills and money market funds | Mints and burns matched to wires, supply on every chain matched to the reserve, and monthly reports an accountant can examine |
| **Chains, validators and protocols** | Public networks and the validators that order their blocks; smart contract protocols for swaps, lending and staking with no customer relationship at all | Transactions that pay the fee and follow the contract's rules; nothing else |
| **Advisers** | Registered investment advisers and robo-advisers that owe clients a fiduciary duty and manage portfolios at a custodian | Model portfolios, rebalancing and billing on the custodian's data, and custody that satisfies the custody rule |
| **Regulators** | The SEC, FINRA, the CFTC and NFA, state securities and money transmission regulators, the OCC, NYDFS, FinCEN, OFAC, the IRS, SIPC as the liquidation backstop, and the EU and UK authorities | Customers protected, markets fair, crime reported, taxes reported, and every record on request |

Three splits shape the data model. **Entity versus account.** One brand is usually several regulated companies: a broker-dealer for securities, a money transmitter or trust company for crypto, an FCM for futures and event contracts, an adviser for managed portfolios, an EU entity for European customers. Every account, every wallet and every journal entry belongs to exactly one of them, because each entity has its own capital, its own customer protection rules and its own bankruptcy. **Customer versus firm versus omnibus.** A customer's position is a claim recorded in the firm's ledger; the asset sits in a DTC position, a custodian's account or a wallet that holds many customers' assets together. The ledger says whose it is; the omnibus location says where it is; the two must agree, and the firm's own assets must never sit in either. **Security versus crypto asset versus stablecoin.** A share of stock is a security, settled through the clearing system and protected by SIPC if the broker fails; most crypto assets are not, settle on a chain and carry no SIPC coverage; a payment stablecoin is a claim on an issuer's reserve under its own statute. The same order screen can sell all three, and every rule downstream depends on which one it was.

## How the Money Works

A broker, exchange, custodian or issuer earns money four ways, and much of this volume regulates one of them. The figures below are from filings, rule-required reports and issuer releases, dated; the worked examples are illustrations, labeled as mine. [How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models) covers each line in depth, and [The Stablecoin Business](/books/investing-and-digital-assets/stablecoin-business) covers the issuer.

### Trading Revenue and Payment for Order Flow

A retail broker that charges no commission still earns on the trade. It routes the order to a wholesaler, which fills it inside the national best bid and offer and pays the broker for the flow. Robinhood Securities' Rule 606 report for the second quarter of 2026 states the formula: payment on equity orders is a fixed percentage of the spread between the national best bid and offer at execution, 12.35% of the spread in regular hours and 9% in extended hours, the same for every non-exchange market center it routes to. A worked example of my own: a 100-share buy when the NBBO is $50.00 by $50.02 has a spread of $0.02 a share; 12.35% of it is $0.00247 a share, so the broker receives about 24.7 cents for the order. Options flow pays per contract: the same report lists $0.30 to $1.20 a contract for single-leg orders of up to 100 contracts, depending on the symbol's average spread, so a 10-contract options order pays at least $3.00, about twelve times the stock order above (my arithmetic).

Robinhood's preliminary 2025 results show the shape: $4,473 million of total net revenues, of which $2,628 million was transaction-based (about 59%, my arithmetic), $1,514 million net interest (about 34%) and $331 million other, against $2,951 million of revenue in 2024. A crypto exchange earns on the trade directly: Kraken Pro's spot schedule starts at 0.40% maker and 0.80% taker at $0 of 30-day volume and falls to 0% maker and 0.05% taker at $500 million or more, so a $1,000 market buy pays $8.00 at the first tier and $0.50 at the top (my arithmetic). Coinbase's transaction revenue was $590.2 million of $1,160.5 million of net revenue in the third quarter of 2026, about half its business and the cyclical half ([Order Routing, PFOF & Best Execution](/books/investing-and-digital-assets/routing-and-best-execution) and [Crypto Trading Products](/books/investing-and-digital-assets/crypto-trading-products) cover both).

### Interest on Cash and Margin

Customers leave cash uninvested and borrow against their positions, and the firm earns the spread on both. At Charles Schwab, net interest revenue was $11,750 million of $23,921 million of 2025 net revenues, 49%, with asset management and administration fees at 27% and trading revenue at 17%. A broker earns on cash three ways: lending it to margin customers, sweeping it to banks that pay the broker a fee or a rate, or holding it as free credit balances under the customer protection rule's reserve. Each of those is a disclosure and a reconciliation, and the sweep programs that paid customers little while the firm earned more became the subject of enforcement and class actions ([Cash, Sweeps & Yield](/books/investing-and-digital-assets/cash-and-sweeps) covers them).

### Assets, Custody and Staking

Advisers charge a percentage of assets under management; custodians charge for safekeeping; crypto platforms take a commission on the staking rewards they pass through. Coinbase reported $85.7 million of blockchain rewards and $570.2 million of total subscription and services revenue in the third quarter of 2026. Asset-based revenue rises and falls with prices rather than with trading, which is why every large platform wants more of it.

### Reserve Income

A stablecoin issuer earns the yield on its reserve and pays none to holders. Circle's total revenue and reserve income for 2025 was $2,746.6 million, of which reserve income was $2,636.8 million, on an average of $64,870 million of USDC in circulation at a reserve return rate of 4.1%. A check of my own: $64.87 billion at 4.1% is about $2.66 billion, close to the reported reserve income. The issuer doesn't keep most of it: distribution and transaction costs were $1,661.5 million, about 60% of total revenue and reserve income and 63% of reserve income ([Distribution Costs](/books/investing-and-digital-assets/stablecoin-business#distribution-costs)), and about $1.4 billion of that went to Coinbase under their collaboration agreement. In the third quarter of 2026 Circle's reserve return rate was 3.5% and USDC in circulation ended at $73.9 billion, so a 25 basis point cut is worth about $185 million a year of reserve income at that size (my arithmetic). Tether reported $1.5 billion of net operating profit for the third quarter of 2026, with about $183.5 billion of USDT issued and $132.4 billion of direct and indirect Treasury bill exposure. On the other side of the agreement, Coinbase booked $306.9 million of stablecoin revenue in the same quarter.

### One Rule for All of Them

Most of the law in this volume regulates one of these lines: what the broker received for the order and whether the customer got a fair price, what the firm earned on customer cash and what it disclosed, what was charged and under which schedule, what an issuer may do with the reserve and whether it may share the income. My rule: every amount the firm earns, pays or holds is a journal entry in the unit of the asset concerned, and every customer-visible event (a fill, a deposit, a fee, a reward) points at its entry, so the statement, the stock record, the regulator's sample and the proof of reserves all read from the same rows.

## The Life of a Stock Trade

**Order.** A customer with a cash account taps buy on 10 shares of a listed stock at market on Monday, November 2, 2026. The broker's order management system checks the account's capabilities and buying power, assigns an order ID tied to the client's idempotency key, and records the order as `new`, then `accepted` ([Idempotency](/docs/requests/idempotency)). [Orders & Order Types](/books/investing-and-digital-assets/orders-and-order-types) covers the state machine.

**Route.** The router picks a destination: a wholesaler that pays for the flow, an exchange, or an ATS. The decision and the venue are recorded because the broker must later show the routing in its public Rule 606 reports and defend it in its regular review of execution quality. The order becomes `routed`.

**Execution.** The wholesaler fills all 10 shares at $189.99 against an NBBO of $189.98 by $190.00, one cent of price improvement per share (my example). The fill comes back as an execution with the venue, price, quantity, liquidity flag and time; the order becomes `filled`. The broker owes the customer a written confirmation at or before completion of the transaction under Rule 10b-10, stating the date and time, the security, the price and quantity, whether the broker acted as agent or principal, whether it receives payment for order flow on such orders, and, if it is not a SIPC member, that it isn't ([Confirms, Statements & Tax Forms](/books/investing-and-digital-assets/statements-and-tax-forms) covers the confirm).

**Trade date posting.** On trade date the broker's ledger posts the trade with settlement pending: the customer's position rises by 10 shares and the customer's cash falls by $1,899.90, both marked as unsettled until settlement date, against the broker's settlement accounts. Buying power drops immediately ([Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions) covers what a customer may do with an unsettled position).

**Clearing.** Since May 28, 2024, the standard settlement cycle for most broker-dealer transactions has been T+1, one business day after trade date, so this trade settles Tuesday, November 3. Institutional trades must be allocated, confirmed and affirmed as soon as technologically practicable and no later than the end of trade date. The clearing firm (the broker itself if it self-clears) submits the trade to NSCC, whose Continuous Net Settlement system nets each member's eligible trades in a security to one position per day and becomes the legal counterparty to every accepted trade, guaranteeing settlement if a member defaults. DTCC reported a 98.6% CNS netting rate and $5.55 trillion of value processed in one day for the third quarter of 2026: most of the market's buys and sells cancel out before anything moves. NSCC also collects margin from members to cover the risk of the open positions, and when that margin spikes, a broker may have to restrict what its customers can buy ([Clearing & Settlement](/books/investing-and-digital-assets/clearing-and-settlement) covers the margin, and [Pre-Trade Risk, Halts & Volatility](/books/investing-and-digital-assets/pre-trade-risk-and-halts) covers the January 2021 restrictions).

**Settlement.** On settlement date, NSCC issues final instructions and DTC moves the securities and the cash by book entry between participants' accounts; nothing physical moves and no share is registered to the customer. Positions that fail to settle stay open in CNS, are marked to market daily and are re-netted with new activity. The broker's ledger moves the customer's 10 shares and $1,899.90 from unsettled to settled.

**The stock record.** Every broker-dealer keeps a securities record, the stock record, showing for each security every long and short position as of clearance dates and where each long position is held: at DTC, in a bank control location, at another broker. The customer's 10 shares are a line in that record: owed to the customer, held in the clearing firm's DTC account in aggregate with everyone else's. The firm must keep fully paid customer securities in its possession or control and must never use them as its own; [Customer Protection, Net Capital & SIPC](/books/investing-and-digital-assets/customer-protection) covers Rule 15c3-3. If the firm fails, SIPC protects up to $500,000 per customer, including up to $250,000 of cash, for missing assets; it does not protect declines in value or any digital asset that isn't a security, and SIPA's definition of a security excludes stablecoins.

Across the life, one stock trade is an order with its events, a routing decision, an execution, two pending ledger movements (shares and cash), a settlement obligation at the clearing house, a book-entry movement at the depository, a line in the stock record, a confirm, and later a tax lot that the 1099-B reports when the shares are sold ([Cost Basis, Tax Lots & Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots) covers the lot engine).

## The Life of a Crypto Trade

**Deposit.** A customer wants to sell 0.5 BTC they hold in their own wallet. The exchange assigns their account a deposit address (on a chain like Bitcoin, one address per customer; on a memo chain, a shared address plus a destination tag), and the customer sends the coins. The exchange's chain watcher sees the transaction in the mempool, then in a block, and counts confirmations. Kraken, for example, credits bitcoin deposits after three confirmations, which its help page estimates at about 45 minutes. On Ethereum the watcher waits for finality rather than a count: slots are 12 seconds, epochs are 32 slots, and a checkpoint is finalized once a later checkpoint is justified by votes of at least two-thirds of staked ETH, after which reverting it would cost an attacker at least one-third of all staked ETH. Until the deposit is final the exchange may show it as pending but must not let it be withdrawn, because a reorganized block can make it disappear. [Deposits & Withdrawals](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals) covers per-chain policies and reorgs.

**Credit.** When the deposit is final, the exchange posts a journal entry: the customer's BTC balance rises by 50,000,000 satoshis, against the omnibus wallet's BTC account. The units matter: the ledger stores bitcoin in satoshis (100,000,000 to the bitcoin) and ether in wei (10^18 to the ether), integer amounts in the asset's smallest unit, never floating point ([Money & Amounts](/docs/money/amounts#integer-minor-units)). Sometime later the exchange sweeps the coins from the deposit address to its hot or cold wallets; that sweep is an on-chain transaction that changes where the asset is, not whose it is, so it posts between the exchange's own wallet accounts and leaves the customer's balance untouched.

**Trade.** The customer sells 0.1 BTC on the order book at an illustrative price of $100,000. The matching engine pairs the order with a buyer's, and the exchange posts both sides in its internal ledger: the seller's BTC down 10,000,000 satoshis and USD up $10,000.00 less the fee; the buyer's the reverse. Nothing happens on the chain: both customers' coins were already in the exchange's omnibus wallets, and the trade only changes the ledger's answer to "whose." That is why a centralized exchange can match in microseconds and why its ledger is the whole truth about ownership ([How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture) and [Order Books & Matching Engines](/books/investing-and-digital-assets/order-books-and-matching) cover the engine).

**Ledger versus chain.** The chain shows a set of addresses the exchange controls and their balances; it knows nothing about the customers. The exchange's ledger shows each customer's claim. The two must agree, asset by asset, at a block height: the sum of customer balances in BTC must be covered by BTC in the exchange's wallets. NYDFS's custody guidance, updated September 30, 2025, requires its licensees to segregate customer virtual currency from corporate assets both on-chain and in internal ledgers, allows omnibus wallets only in the custodian's name as agent or trustee with records that keep each customer's interest evident and up to date, forbids using customer assets for the custodian's own purposes, and expects the custodian to demonstrate reconciliation between its books and on-chain activity when asked. What the customer agreed to decides what the ledger means in bankruptcy: when Celsius failed, about 600,000 Earn accounts held about $4.2 billion of crypto, and the bankruptcy court held on January 4, 2023 that its Terms of Use had transferred "all right and title" to Celsius, so Earn holders were unsecured creditors of the estate rather than owners. [Proof of Reserves & Liabilities](/books/investing-and-digital-assets/proof-of-reserves) and [FTX, Celsius & the 2022 Collapse](/books/investing-and-digital-assets/exchange-collapses) cover what the reconciliation must prove and what happens when it can't.

**Withdrawal.** The customer withdraws 0.4 BTC to an external address. The exchange holds the amount in the ledger, screens the destination, applies its risk checks (new device, new address, unusual size), and passes an instruction to the signing service, which applies its policy and quorum before the hot wallet signs. The signed transaction is broadcast with a network fee the exchange pays from its own wallet and usually charges back as a withdrawal fee; the ledger posts the withdrawal on broadcast and the fee as a firm expense. If the transaction sits unconfirmed, the exchange bumps its fee rather than signing a second payment, which is why every outbound instruction carries one idempotency key and one signed transaction ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)). [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing) and [Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets) cover the signing side; [Account Security & Fraud](/books/investing-and-digital-assets/account-security) covers the account takeover that withdrawal controls are guarding against.

Across the life, one crypto trade is an address assignment, an on-chain deposit tracked to finality, a credit, a sweep, two ledger-only trade postings, a withdrawal request, a signed and broadcast on-chain transaction, and a daily reconciliation of every customer's balance against every wallet. A broker selling crypto through a partner sees the same life from one step removed: its customer's claim is on the partner's ledger, and [Brokerage as a Service](/books/investing-and-digital-assets/brokerage-as-a-service) covers who owns which obligation.

## The Life of a Stablecoin Dollar

**Onboarding.** A business wants $10 million of a fiat-backed stablecoin. It onboards with the issuer's institutional platform, which for Circle Mint means identity verification, KYC, sanctions screening and suitability review; retail customers buy the token from an exchange instead and never meet the issuer.

**Wire in.** The business wires $10,000,000 to the issuer's settlement bank. The issuer's ledger records the cash received against a pending mint; nothing is minted until the dollars have arrived.

**Mint.** The issuer mints 10,000,000 tokens to the business's address on the chain it asked for. On the contract, minting is a privileged role: in Circle's FiatToken design, a master minter configures minters and sets each one's allowance, every mint reduces the minter's allowance, and burning does not restore it, so a compromised minter key can create no more than its remaining allowance. Circle Mint charges nothing to mint. The issuer's books now show a liability to token holders of $10 million and $10 million of cash heading into the reserve.

**Circulate.** The business pays a supplier, who sells some on an exchange, which credits its own customers in its internal ledger; the tokens may move between chains by burning on one and minting on another, as Circle's CCTP does (its Fast Transfer takes about 8 to 20 seconds, Standard about 15 to 19 minutes on Ethereum and L2s). None of this touches the reserve: the issuer's liability is the total supply across chains, and circulation changes only who holds it. The contract can still intervene: a blacklisted address in FiatToken can't send, receive, mint or burn, and pausing halts transfers, mints and burns while blacklisting and upgrades keep working. The GENIUS Act requires a permitted issuer to have the technical capability, policies and procedures to block, freeze and reject transactions that violate law, and to issue only if it can comply with lawful orders ([Freezes, Blacklists & Seizures](/books/investing-and-digital-assets/freezes-and-onchain-compliance#what-the-issuer-and-the-exchange-each-do) covers both sides of a freeze; [Stablecoins](/books/payments/stablecoins) covers paying and being paid with the token).

**Redeem and burn.** A holder onboarded with the issuer sends tokens back and asks for dollars. Circle Mint's basic redemption is initiated within two business days at no charge, and its standard redemption is initiated nearly instantly for a nominal fee. The OCC's final GENIUS rule keeps two business days as the standard for timely redemption by issuers it supervises and requires notice to the OCC within 24 hours if redemption requests exceed 10% of outstanding issuance in a 24-hour period. The issuer burns the tokens, wires the dollars, and its liability and reserve both fall by the same amount. Gross flows dwarf the net: Circle reported $104 billion minted and $104 billion redeemed in the third quarter of 2026, and $257.5 billion minted against $226.1 billion redeemed in 2025.

**The reserve.** Behind every token sits the reserve. Under the GENIUS Act (Pub. L. 119-27), a permitted issuer must hold identifiable reserves at least one to one in a short list of assets: US currency and Federal Reserve balances, demand deposits at insured institutions, Treasuries with 93 days or less remaining to maturity, overnight repo and reverse repo backed by them, government money market funds holding only those, and tokenized forms of the same. It must publish its outstanding supply and reserve composition monthly, have a registered public accounting firm examine each report, and have its CEO and CFO certify it; it may not pledge or reuse the reserve except for margin, standard custody or liquidity for redemptions; and it may not pay holders interest or yield for holding the token. The OCC's final rule adds that at least 5% of reserves sit in on-demand deposits or Federal Reserve balances. Circle held about 88% of USDC reserves at December 31, 2025 in the Circle Reserve Fund, a government money market fund managed by BlackRock, available only to Circle, with BNY as custodian. The Act takes effect on the earlier of January 18, 2027 (18 months after enactment) or 120 days after the primary federal regulators issue final regulations, and the OCC's final rule, published October 23, 2026 at 91 FR 67000, takes effect January 18, 2027. [Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin#the-reserve) and [Stablecoin Law](/books/investing-and-digital-assets/stablecoin-law#the-rules-for-issuers) cover the reserve and the rules.

Across the life, one stablecoin dollar is an onboarded customer, an incoming wire, a mint instruction with an allowance, an on-chain mint, a liability, a reserve asset, many transfers on several chains, possibly a freeze, a redemption request, a burn, an outgoing wire, and a monthly report tying supply on every chain to the reserve. The issuer's version of the reconciliation is total supply against total reserve; an exchange's version is its customers' token balances against the tokens in its wallets.

## The Core Data Model

Every company in this volume converges on the same concepts under different names: a broker's customer, an exchange's user and a custodian's client are all parties; a brokerage account, an exchange's trading account and an IRA are all accounts; a ticker, a CUSIP, an option series, a token contract on Base and a tokenized fund share are all instruments; a broker's journal, an exchange's balance ledger and an issuer's supply ledger are all journal entries. The volume uses one set of names, and every later chapter's How to Build It extends it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **legal entity** | `legal_entities` | One of the platform's own regulated companies (broker-dealer, RIA, FCM, trust company, MSB, stablecoin issuer, EU CASP), with its registrations and jurisdictions |
| **party** | `parties` | A person or an entity, as in Banking & Lending |
| **party identity** | `party_identities` | A verified identifier with its method and KYC result |
| **account** | `accounts` | One customer account, at one legal entity, with its type, capabilities and status |
| **account party** | `account_parties` | A party's role on an account: owner, joint owner, custodian, trustee, beneficiary, trusted contact, authorized trader |
| **instrument** | `instruments` | Anything that can be held or traded, cash included, with its identifiers and unit precision |
| **chain** | `chains` | A blockchain network with its chain ID and finality rule |
| **asset network** | `asset_networks` | An instrument on one chain: native or a contract address, token standard, on-chain decimals, deposits and withdrawals enabled |
| **venue** | `venues` | An exchange, ATS, wholesaler, crypto venue, DEX, OTC desk or clearing house |
| **order and order event** | `orders`, `order_events` | An instruction to trade, and every state change it went through |
| **execution** | `executions` | A fill: venue, price, quantity, liquidity flag, fees, time |
| **journal entry and line** | `journal_entries`, `journal_lines` | Double entry in any unit: every line names its instrument and ledger account, and each instrument's lines sum to zero |
| **position** | `positions` | Settled and unsettled quantity per account and instrument, derived from the ledger |
| **tax lot and lot closing** | `tax_lots`, `lot_closings` | Each acquisition with its basis and holding period, and each disposal matched to lots |
| **settlement** | `settlements` | An obligation to deliver or receive by a date, with its counterparty or CCP and status |
| **transfer** | `transfers` | Money or assets into or out of an account: ACH, wire, card, ACATS, on-chain, internal, journal |
| **wallet and address** | `wallets`, `addresses` | A custody wallet with its purpose and key scheme, and the addresses or tags assigned within it |
| **on-chain transaction** | `onchain_transactions` | A transaction on a chain, tracked from pending to finalized, reorged or failed |
| **asset event and election** | `asset_events`, `asset_event_elections` | A corporate action or chain event, and a holder's choice where there is one |
| **fee schedule and fee** | `fee_schedules`, `fees` | A versioned schedule, and each fee it produced |
| **disclosure** | `disclosures` | What was shown or sent, which version, when, and how |
| **reconciliation and break** | `reconciliations`, `recon_breaks` | A comparison of the ledger with DTC, a clearing firm, a custodian, a bank or a chain, and each difference |
| **case** | `cases` | A complaint, surveillance alert, AML alert, dispute or regulatory inquiry, with its clock and outcome |

Seven splits matter in every chapter:

- **Legal entity on every row that holds or moves an asset.** Accounts, wallets and journal entries carry `legal_entity_id`, because the broker-dealer, the crypto entity and the FCM each have their own capital, protection rules and bankruptcy estate, and a regulator or trustee must be able to produce one entity's books alone. A brand is a presentation; the entity is the record.
- **Instrument versus asset network.** USDC is one instrument and an asset network per chain it lives on; a customer's balance is in the instrument, and the network matters only when the asset moves on or off a chain. Merging the two gives a customer ten USDC balances and makes every cross-chain move look like a trade.
- **The ledger is the truth; positions are a view.** `positions` is rebuilt from `journal_lines`, never written directly, so a correction is always a new entry and an as-of position is always a query.
- **Smallest unit, per instrument.** Every quantity is an integer count of the instrument's smallest unit (cents, satoshis, wei, millionths of a share), with the exponent in `instruments.decimals` ([Exponents Come From a Table](/docs/money/amounts#exponents-come-from-a-table)). Prices are ratios between two instruments and carry their own precision.
- **Trade date versus settlement date.** A securities trade posts on trade date with the date it settles; settled and unsettled quantities come from the same lines, so buying power, withdrawable cash and the stock record can each read the one they need.
- **Ledger versus location.** A journal line says whose an asset is (`ledger_account` customer, firm, omnibus, settlement, fees, suspense); a wallet, a DTC account or a custodian account says where it is. Reconciliation compares the two every day.
- **Order versus execution versus settlement.** An order is an instruction, an execution is a fill, a settlement is the obligation the fill created. One order can have many fills and one settlement can net many fills, and each has its own clock.

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions), with quantities in integer smallest units; columns each chapter owns are added there:

```sql
CREATE TABLE legal_entities (              -- the platform's own regulated companies
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_name          TEXT NOT NULL UNIQUE,
  kind                TEXT NOT NULL CHECK (kind IN ('broker_dealer', 'ria', 'fcm', 'dcm',
                        'trust_company', 'national_trust_bank', 'msb', 'stablecoin_issuer',
                        'casp', 'emi', 'holding', 'other')),
  jurisdiction        TEXT NOT NULL,         -- 'US', 'US-NY', 'LT', 'GB', ...
  registrations       JSONB NOT NULL DEFAULT '[]',  -- regulator, kind, number, since
  parent_id           UUID REFERENCES legal_entities (id),
  status              TEXT NOT NULL CHECK (status IN ('active', 'pending', 'winding_down',
                        'closed'))
);

CREATE TABLE parties (                     -- a person or an entity (as in Banking & Lending)
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                TEXT NOT NULL CHECK (kind IN ('person', 'entity')),
  legal_name          TEXT NOT NULL,
  date_of_birth       DATE,                  -- persons only
  entity_type         TEXT,                  -- 'llc', 'corporation', 'trust', 'fund', ...
  status              TEXT NOT NULL CHECK (status IN ('prospect', 'active', 'restricted',
                        'deceased', 'dissolved', 'closed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (kind = 'person' OR date_of_birth IS NULL)
);

CREATE TABLE party_identities (            -- verified identifiers and KYC results
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  kind                TEXT NOT NULL CHECK (kind IN ('ssn', 'itin', 'ein', 'foreign_tin',
                        'passport', 'drivers_license', 'lei', 'phone', 'email', 'address')),
  value_token         TEXT NOT NULL,         -- vaulted; the playbook's sensitive-data rules
  value_last4         TEXT,
  method              TEXT NOT NULL,         -- 'documentary', 'non_documentary', ...
  vendor_ref          TEXT,
  result              TEXT NOT NULL CHECK (result IN ('verified', 'failed', 'review',
                        'expired')),
  verified_at         TIMESTAMPTZ NOT NULL,
  UNIQUE (party_id, kind, value_token)
);

CREATE TABLE accounts (                    -- one customer account at one legal entity
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  number              TEXT NOT NULL,
  account_type        TEXT NOT NULL CHECK (account_type IN ('individual', 'joint',
                        'ira_traditional', 'ira_roth', 'custodial', 'trust', 'entity',
                        'institutional')),
  capabilities        TEXT[] NOT NULL DEFAULT '{}' CHECK (capabilities <@ ARRAY['margin',
                        'options', 'crypto', 'staking', 'futures', 'event_contracts']),
  options_level       SMALLINT,              -- the firm's own level; null without options
  base_instrument_id  UUID NOT NULL,         -- the cash instrument, usually USD (instruments)
  status              TEXT NOT NULL CHECK (status IN ('pending', 'active', 'restricted',
                        'closing_only', 'frozen', 'closed')),
  opened_at           TIMESTAMPTZ,
  closed_at           TIMESTAMPTZ,
  UNIQUE (legal_entity_id, number),
  CHECK ((options_level IS NOT NULL) = ('options' = ANY (capabilities)))
);

CREATE TABLE account_parties (             -- who is on the account, and as what
  account_id          UUID NOT NULL REFERENCES accounts (id),
  party_id            UUID NOT NULL REFERENCES parties (id),
  role                TEXT NOT NULL CHECK (role IN ('owner', 'joint_owner', 'custodian',
                        'trustee', 'beneficiary', 'trusted_contact', 'authorized_trader')),
  share               NUMERIC(7, 4),         -- a beneficiary's share, if stated
  valid_during        TSTZRANGE NOT NULL,
  PRIMARY KEY (account_id, party_id, role, valid_during)
);

CREATE TABLE instruments (                 -- anything held or traded, cash included
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_type     TEXT NOT NULL CHECK (instrument_type IN ('cash', 'equity', 'etf',
                        'mutual_fund', 'option', 'future', 'bond', 'crypto_asset',
                        'stablecoin', 'tokenized_security', 'event_contract')),
  symbol              TEXT NOT NULL,         -- ticker, OCC symbol or asset symbol as displayed
  name                TEXT NOT NULL,
  cusip               CHAR(9),
  isin                CHAR(12),
  figi                CHAR(12),
  decimals            SMALLINT NOT NULL CHECK (decimals BETWEEN 0 AND 18),  -- book precision
  issuer              TEXT,                  -- the company, fund, issuer or protocol
  status              TEXT NOT NULL CHECK (status IN ('active', 'halted', 'close_only',
                        'delisted')),
  UNIQUE (instrument_type, symbol)
);

ALTER TABLE accounts ADD FOREIGN KEY (base_instrument_id) REFERENCES instruments (id);

CREATE TABLE chains (                      -- a blockchain network
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  code                TEXT NOT NULL UNIQUE,  -- 'bitcoin', 'ethereum', 'solana', 'base', ...
  evm_chain_id        BIGINT UNIQUE,         -- the EIP-155 chain ID, for EVM chains
  native_instrument_id UUID NOT NULL REFERENCES instruments (id),  -- pays the fees
  finality_rule       TEXT NOT NULL CHECK (finality_rule IN ('confirmations',
                        'finalized_tag', 'commitment_finalized', 'l1_settled')),
  confirmations_required INT,                -- for 'confirmations'
  status              TEXT NOT NULL CHECK (status IN ('active', 'deposits_paused',
                        'withdrawals_paused', 'retired'))
);

CREATE TABLE asset_networks (              -- an instrument on one chain
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  chain_id            UUID NOT NULL REFERENCES chains (id),
  contract_address    TEXT,                  -- null for the chain's native asset
  token_standard      TEXT,                  -- 'erc20', 'spl', 'native', ...
  decimals_on_chain   SMALLINT NOT NULL,     -- can differ from instruments.decimals
  memo_required       BOOLEAN NOT NULL DEFAULT FALSE,
  deposits_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
  withdrawals_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (chain_id, contract_address),
  UNIQUE (instrument_id, chain_id)
);

CREATE TABLE venues (                      -- where orders are filled or trades settle
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                TEXT NOT NULL CHECK (kind IN ('exchange', 'ats', 'wholesaler',
                        'crypto_exchange', 'dex', 'otc_desk', 'clearing_house', 'internal')),
  name                TEXT NOT NULL,
  mic                 CHAR(4),               -- ISO 10383 market identifier, where assigned
  chain_id            UUID REFERENCES chains (id),  -- a DEX's chain
  UNIQUE (kind, name)
);

CREATE TABLE orders (                      -- an instruction to trade
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  quote_instrument_id UUID NOT NULL REFERENCES instruments (id),  -- what it's priced in
  side                TEXT NOT NULL CHECK (side IN ('buy', 'sell', 'sell_short')),
  order_type          TEXT NOT NULL CHECK (order_type IN ('market', 'limit', 'stop',
                        'stop_limit', 'trailing_stop')),
  quantity            NUMERIC(78, 0),        -- smallest units of the instrument
  notional            NUMERIC(78, 0),        -- smallest units of the quote instrument
  limit_price         NUMERIC(38, 18),
  stop_price          NUMERIC(38, 18),
  time_in_force       TEXT NOT NULL CHECK (time_in_force IN ('day', 'gtc', 'ioc', 'fok',
                        'gtd', 'opg', 'cls')),
  client_order_id     TEXT NOT NULL,         -- the idempotency key from the client
  status              TEXT NOT NULL CHECK (status IN ('new', 'accepted', 'routed',
                        'partially_filled', 'filled', 'canceled', 'replaced', 'rejected',
                        'expired')),
  placed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_id, client_order_id),
  CHECK ((quantity IS NULL) <> (notional IS NULL))
);

CREATE TABLE order_events (                -- every state change, append-only
  order_id            UUID NOT NULL REFERENCES orders (id),
  seq                 INT NOT NULL,
  event               TEXT NOT NULL,         -- 'accepted', 'routed', 'fill', 'cancel_requested', ...
  to_status           TEXT NOT NULL,
  venue_id            UUID REFERENCES venues (id),
  detail              JSONB NOT NULL DEFAULT '{}',
  occurred_at         TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (order_id, seq)
);

CREATE TABLE journal_entries (             -- one balanced movement, in any instruments
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  kind                TEXT NOT NULL,         -- 'trade', 'deposit', 'withdrawal', 'fee', 'sweep', ...
  effective_date      DATE NOT NULL,         -- trade date or business date
  posted_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reverses_id         UUID REFERENCES journal_entries (id),
  source_ref          TEXT,                  -- the execution, transfer or chain event
  idempotency_key     TEXT NOT NULL,
  UNIQUE (legal_entity_id, idempotency_key)
);

CREATE TABLE executions (                  -- fills
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  order_id            UUID NOT NULL REFERENCES orders (id),
  venue_id            UUID NOT NULL REFERENCES venues (id),
  venue_exec_ref      TEXT NOT NULL,         -- the venue's execution ID
  price               NUMERIC(38, 18) NOT NULL,  -- quote instrument per whole unit
  quantity            NUMERIC(78, 0) NOT NULL CHECK (quantity > 0),
  liquidity           TEXT NOT NULL CHECK (liquidity IN ('maker', 'taker', 'auction',
                        'principal', 'unknown')),
  capacity            TEXT NOT NULL CHECK (capacity IN ('agent', 'principal',
                        'riskless_principal')),
  executed_at         TIMESTAMPTZ NOT NULL,
  journal_entry_id    UUID REFERENCES journal_entries (id),
  UNIQUE (venue_id, venue_exec_ref)
);

CREATE TABLE journal_lines (               -- per entry, each instrument's lines sum to zero
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  journal_entry_id    UUID NOT NULL REFERENCES journal_entries (id),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  ledger_account      TEXT NOT NULL CHECK (ledger_account IN ('customer', 'firm', 'omnibus',
                        'settlement', 'fees', 'suspense')),
  account_id          UUID REFERENCES accounts (id),   -- set for customer lines
  wallet_id           UUID,                  -- set for omnibus lines on a chain (wallets)
  amount              NUMERIC(78, 0) NOT NULL CHECK (amount <> 0),  -- smallest units, signed
  settles_on          DATE,                  -- null: settled when posted
  CHECK ((ledger_account = 'customer') = (account_id IS NOT NULL))
);

CREATE TABLE positions (                   -- rebuilt from journal_lines; never written by hand
  account_id          UUID NOT NULL REFERENCES accounts (id),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  settled_quantity    NUMERIC(78, 0) NOT NULL,
  unsettled_quantity  NUMERIC(78, 0) NOT NULL,
  as_of               TIMESTAMPTZ NOT NULL,
  through_entry_id    UUID NOT NULL REFERENCES journal_entries (id),  -- the high-water mark
  PRIMARY KEY (account_id, instrument_id)
);

CREATE TABLE tax_lots (                    -- each acquisition
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  acquired_at         TIMESTAMPTZ NOT NULL,
  quantity            NUMERIC(78, 0) NOT NULL CHECK (quantity > 0),
  remaining_quantity  NUMERIC(78, 0) NOT NULL,
  cost_basis          BIGINT NOT NULL,       -- minor units of the account's base currency
  wash_sale_adjustment BIGINT NOT NULL DEFAULT 0,
  holding_period_start DATE NOT NULL,        -- moves with a wash sale
  covered             BOOLEAN NOT NULL,      -- broker must report basis
  source_ref          TEXT NOT NULL          -- the execution, transfer or asset event
);

CREATE TABLE lot_closings (                -- a disposal matched to lots
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tax_lot_id          UUID NOT NULL REFERENCES tax_lots (id),
  execution_id        UUID REFERENCES executions (id),
  quantity            NUMERIC(78, 0) NOT NULL CHECK (quantity > 0),
  proceeds            BIGINT NOT NULL,
  realized_gain       BIGINT NOT NULL,
  method              TEXT NOT NULL CHECK (method IN ('fifo', 'specific_id', 'highest_cost',
                        'lifo', 'average')),
  closed_at           TIMESTAMPTZ NOT NULL
);

CREATE TABLE settlements (                 -- what a fill obliges someone to deliver
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  counterparty_venue_id UUID REFERENCES venues (id),  -- the CCP or counterparty
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  trade_date          DATE NOT NULL,
  settlement_date     DATE NOT NULL,
  deliver_quantity    NUMERIC(78, 0) NOT NULL,       -- signed: positive receive, negative deliver
  cash_amount         BIGINT NOT NULL,               -- signed, minor units
  status              TEXT NOT NULL CHECK (status IN ('pending', 'affirmed', 'settled',
                        'failed', 'bought_in', 'canceled')),
  failed_since        DATE
);

CREATE TABLE wallets (                     -- custody wallets the firm controls or uses
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_legal_entity_id UUID NOT NULL REFERENCES legal_entities (id),
  chain_id            UUID NOT NULL REFERENCES chains (id),
  purpose             TEXT NOT NULL CHECK (purpose IN ('hot', 'warm', 'cold', 'deposit',
                        'omnibus', 'staking', 'gas')),
  key_scheme          TEXT NOT NULL CHECK (key_scheme IN ('mpc', 'multisig', 'hsm')),
  custodian           TEXT,                  -- null: self-custodied; else the sub-custodian
  segregated_account_id UUID REFERENCES accounts (id),  -- null: omnibus
  status              TEXT NOT NULL CHECK (status IN ('active', 'receive_only', 'retired'))
);

ALTER TABLE journal_lines ADD FOREIGN KEY (wallet_id) REFERENCES wallets (id);

CREATE TABLE addresses (                   -- deposit addresses or tags, assigned to accounts
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  wallet_id           UUID NOT NULL REFERENCES wallets (id),
  address             TEXT NOT NULL,         -- as the chain writes it
  memo_tag            TEXT,                  -- destination tag or memo on shared-address chains
  account_id          UUID REFERENCES accounts (id),  -- null: a firm address
  derivation_path     TEXT,                  -- for HD wallets
  status              TEXT NOT NULL CHECK (status IN ('active', 'retired')),
  UNIQUE (wallet_id, address, memo_tag)
);

CREATE TABLE onchain_transactions (        -- tracked from mempool to finality
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  chain_id            UUID NOT NULL REFERENCES chains (id),
  tx_hash             TEXT NOT NULL,
  block_number        BIGINT,
  block_hash          TEXT,                  -- changes, or vanishes, on a reorg
  confirmations       INT NOT NULL DEFAULT 0,
  status              TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'finalized',
                        'reorged', 'failed')),
  fee_paid            NUMERIC(78, 0),        -- in the chain's native asset; the firm pays it if outbound
  first_seen_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finalized_at        TIMESTAMPTZ,
  UNIQUE (chain_id, tx_hash)
);

CREATE TABLE transfers (                   -- money and assets in and out of an account
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  method              TEXT NOT NULL CHECK (method IN ('ach', 'wire', 'card', 'acats',
                        'onchain', 'internal', 'journal')),
  direction           TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  quantity            NUMERIC(78, 0) NOT NULL CHECK (quantity > 0),
  asset_network_id    UUID REFERENCES asset_networks (id),          -- on-chain only
  onchain_transaction_id UUID REFERENCES onchain_transactions (id),
  log_index           INT,                   -- which transfer inside the transaction
  address_id          UUID REFERENCES addresses (id),               -- the firm's side
  counterparty        JSONB,                 -- bank, contra broker or external address
  available_at        TIMESTAMPTZ,           -- when the funds may be withdrawn
  status              TEXT NOT NULL CHECK (status IN ('requested', 'pending', 'held',
                        'completed', 'returned', 'rejected', 'canceled')),
  journal_entry_id    UUID REFERENCES journal_entries (id),
  idempotency_key     TEXT NOT NULL UNIQUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((method = 'onchain') = (asset_network_id IS NOT NULL))
);

CREATE TABLE asset_events (                -- corporate actions and chain events
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  kind                TEXT NOT NULL CHECK (kind IN ('dividend', 'split', 'reverse_split',
                        'merger', 'spinoff', 'tender_offer', 'fork', 'airdrop',
                        'token_migration', 'redenomination', 'delisting')),
  terms               JSONB NOT NULL,        -- ratio, rate, new instrument, snapshot block
  record_date         DATE,
  ex_date             DATE,
  pay_date            DATE,
  snapshot_block      BIGINT,                -- chain events
  election_deadline   TIMESTAMPTZ,           -- voluntary events
  status              TEXT NOT NULL CHECK (status IN ('announced', 'confirmed', 'processed',
                        'canceled'))
);

CREATE TABLE asset_event_elections (
  asset_event_id      UUID NOT NULL REFERENCES asset_events (id),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  election            TEXT NOT NULL,         -- 'cash', 'stock', 'tender', 'default', ...
  quantity            NUMERIC(78, 0) NOT NULL,
  elected_at          TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (asset_event_id, account_id)
);

CREATE TABLE fee_schedules (               -- versioned; a fee names the version it used
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  code                TEXT NOT NULL,         -- 'spot_maker_taker', 'withdrawal', 'advisory', ...
  version             INT NOT NULL CHECK (version > 0),
  terms               JSONB NOT NULL,        -- tiers, rates, minimums
  valid_during        TSTZRANGE NOT NULL,
  UNIQUE (legal_entity_id, code, version)
);

CREATE TABLE fees (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  fee_schedule_id     UUID NOT NULL REFERENCES fee_schedules (id),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),  -- what it was charged in
  amount              NUMERIC(78, 0) NOT NULL CHECK (amount > 0),
  execution_id        UUID REFERENCES executions (id),
  transfer_id         UUID REFERENCES transfers (id),
  status              TEXT NOT NULL CHECK (status IN ('charged', 'waived', 'refunded')),
  journal_entry_id    UUID REFERENCES journal_entries (id)
);

CREATE TABLE disclosures (                 -- what was shown or sent, version, when, how
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                TEXT NOT NULL,         -- 'form_crs', 'options_disclosure_document',
                                             -- 'margin_disclosure', 'crypto_risk', 'terms', ...
  template_version    TEXT NOT NULL,
  party_id            UUID NOT NULL REFERENCES parties (id),
  account_id          UUID REFERENCES accounts (id),
  channel             TEXT NOT NULL CHECK (channel IN ('screen', 'email', 'mail', 'in_app')),
  document_ref        TEXT NOT NULL,         -- the rendered document, as delivered
  delivered_at        TIMESTAMPTZ NOT NULL,
  acknowledged_at     TIMESTAMPTZ
);

CREATE TABLE reconciliations (             -- the ledger against an outside record
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  source              TEXT NOT NULL CHECK (source IN ('dtc', 'clearing_firm', 'custodian',
                        'bank', 'chain', 'issuer')),
  instrument_id       UUID REFERENCES instruments (id),  -- null: all instruments
  wallet_id           UUID REFERENCES wallets (id),
  as_of               TIMESTAMPTZ NOT NULL,
  as_of_block         BIGINT,                -- chain reconciliations
  ledger_total        NUMERIC(78, 0) NOT NULL,
  external_total      NUMERIC(78, 0) NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('matched', 'breaks', 'running'))
);

CREATE TABLE recon_breaks (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  reconciliation_id   UUID NOT NULL REFERENCES reconciliations (id),
  account_id          UUID REFERENCES accounts (id),
  difference          NUMERIC(78, 0) NOT NULL,
  cause               TEXT,                  -- 'timing', 'unbooked_deposit', 'fee', 'unknown', ...
  resolution_entry_id UUID REFERENCES journal_entries (id),
  opened_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at         TIMESTAMPTZ
);

CREATE TABLE cases (                       -- every clock the firm answers to
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                TEXT NOT NULL CHECK (kind IN ('complaint', 'surveillance_alert',
                        'aml_alert', 'dispute', 'regulatory_inquiry', 'account_takeover')),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  party_id            UUID REFERENCES parties (id),
  account_id          UUID REFERENCES accounts (id),
  opened_at           TIMESTAMPTZ NOT NULL,  -- when notice arrived: the clock starts here
  rule_ref            TEXT NOT NULL,         -- the rule whose deadlines apply
  due_at              TIMESTAMPTZ,
  status              TEXT NOT NULL CHECK (status IN ('open', 'escalated', 'resolved',
                        'closed')),
  outcome             TEXT,
  closed_at           TIMESTAMPTZ
);
```

Design notes:

- **Balanced per instrument.** A trade entry has share lines and cash lines; each set sums to zero on its own. The check is one query, run before commit: `SELECT instrument_id FROM journal_lines WHERE journal_entry_id = $1 GROUP BY instrument_id HAVING SUM(amount) <> 0` returns no rows ([Double-Entry Ledger](/docs/money/payment-states#double-entry-ledger)). A conversion between instruments, such as a trade or a stablecoin mint, is always two balanced sets in one entry, never one line that changes units.
- **Settled and unsettled from the same lines.** `settles_on` is the date a pending line becomes settled; a position's settled quantity is the sum of its lines with `settles_on` null or on or before the as-of date, and its unsettled quantity the rest. A failed settlement is a new entry that moves the date, so the history of what the customer was shown survives.
- **Wide integers everywhere an asset moves.** `NUMERIC(78, 0)` holds any 256-bit token amount, so the ledger never truncates wei; cost basis and proceeds are in the account's base currency, in minor units, because tax forms report them in dollars.
- **On-chain status is not ledger status.** An `onchain_transactions` row moves through `pending`, `confirmed` and `finalized` (or `reorged`) as the chain watcher sees it; a deposit's `transfers` row and its journal entry wait for the chain's finality rule. A reorg before finality posts nothing, because nothing posted.
- **The omnibus line names a wallet.** Customer lines name an account; omnibus lines name the wallet that holds the asset. The sum of customer lines for an instrument, minus firm lines, must equal the omnibus lines for it, and a chain reconciliation compares those omnibus lines with the wallets' on-chain balances at one block.
- **Reuse the Payments model at the edges.** The Payments volume's `assets` table (one row per token per chain) is this volume's `instruments` plus `asset_networks`; its `wallet_addresses` map to `wallets` and `addresses`; its `onchain_transfers` row is an `onchain_transactions` row plus a `transfers.log_index`; and `address_screenings`, `travel_rule_records` and `ramp_orders` stay where [Stablecoins](/books/payments/stablecoins#how-to-build-it) defines them. Banking & Lending's `parties`, `party_identities`, `disclosures` and `cases` are the same concepts with the same columns, so a firm with both a bank and a broker keeps one party per person.
- **Emit life-cycle events.** `order.accepted`, `order.filled`, `execution.booked`, `transfer.completed`, `onchain_transaction.finalized`, `settlement.failed`, `asset_event.processed`, `reconciliation.break_opened` and `case.opened` are what notifications, risk, surveillance and reporting subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

### Extended By

Each later chapter extends a defined part of this spine. The chapters, the core tables each one builds on or alters (with the columns it adds), and the tables it adds, as its How to Build It defines them, are below; a table is defined once, by the chapter named here, and later chapters reference it:

| Chapter | Extends |
| --- | --- |
| [The Investing & Crypto Landscape](/books/investing-and-digital-assets/investing-landscape) | `venues`; adds `market_participants`, `participant_metrics`, `corporate_transactions` |
| [How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models) | `legal_entities`, `venues`, `executions`, `journal_entries`; adds `order_flow_agreements`, `order_flow_payments`, `revenue_share_agreements`, `interest_programs` |
| [Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses) | `legal_entities`; adds `entity_registrations`, `activity_license_map`, `entity_relationships` |
| [Crises & the Rules They Wrote](/books/investing-and-digital-assets/crises-and-the-rules) | none; a dated timeline that points at the chapters holding each rule |
| [Opening Accounts](/books/investing-and-digital-assets/opening-accounts) | `parties`, `legal_entities`, `accounts`, `cases`; adds `account_applications`, `cip_reliance_agreements`, `reliance_certifications`, `investment_profiles`, `capability_approvals`, `tax_certifications`, `senior_investor_holds` |
| [Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions) | `journal_lines` (`location_id`), `legal_entities`, `accounts`, `instruments`, `transfers`, `journal_entries`; adds `custody_locations`, `ledger_account_rules`, `balance_holds`, `position_snapshots`, `buying_power_snapshots` |
| [Funding & Account Transfers](/books/investing-and-digital-assets/funding-and-transfers) | `transfers`, `journal_entries`, `accounts`, `cases`, `instruments`; adds `transfer_events`, `instant_deposit_credits`, `funding_limits`, `acats_transfers`, `acats_assets` |
| [Cash, Sweeps & Yield](/books/investing-and-digital-assets/cash-and-sweeps) | `legal_entities`, `instruments`, `accounts`, `disclosures`, `journal_entries`; reuses Banking & Lending's `sweep_programs` and `sweep_program_banks`; adds `cash_vehicles`, `sweep_elections`, `sweep_consents`, `sweep_change_notices`, `cash_rate_tiers`, `sweep_balances`, `cash_interest_accruals`, `crypto_reward_programs` |
| [Corporate Actions & Asset Events](/books/investing-and-digital-assets/corporate-actions) | `asset_events` (`new_instrument_id`, `revision`, `source`, `source_ref`, `entitlement_basis`), `instruments`, `accounts`, `journal_entries`; adds `asset_event_entitlements`, `proxy_votes`, `chain_event_decisions` |
| [Fractional Shares & Recurring Investing](/books/investing-and-digital-assets/fractional-and-recurring) | `instruments` (`fractional_enabled`, `min_notional`), `accounts`, `transfers`, `orders`, `legal_entities`, `executions`; adds `recurring_plans`, `plan_runs`, `order_batches`, `fractional_allocations` |
| [Cost Basis, Tax Lots & Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots) | `tax_lots` (`origin`, `basis_status`, `parent_lot_id`, `asset_event_id`), `lot_closings` (`term`, `wash_window_open`, `disallowed_loss`, `lot_relief_election_id`, `restated_by`), `asset_events`, `accounts`, `instruments`, `orders`, `transfers`; adds `lot_relief_elections`, `wash_sale_adjustments`, `basis_transfers` |
| [Confirms, Statements & Tax Forms](/books/investing-and-digital-assets/statements-and-tax-forms) | `accounts`, `legal_entities`, `executions`, `disclosures`, `journal_entries`; adds `trade_confirmations`, `account_statements`, `tax_documents`, `tax_document_corrections`, `tax_correction_elections` |
| [Orders & Order Types](/books/investing-and-digital-assets/orders-and-order-types) | `orders` (`session_eligibility`, `not_held`, `order_class`, `parent_order_id`, `trail_amount`, `trail_unit`, `high_water_mark`, `expires_at`, `nbb_at_receipt`, `nbo_at_receipt`, `marketable_at_receipt`, `cum_quantity`), `instruments`, `venues`; adds `order_legs`, `order_replacements`, `fix_sessions` |
| [US Equity Market Structure](/books/investing-and-digital-assets/equity-market-structure) | `venues` (`registration`, `displays_protected`, `form_ats_n_ref`, `speed_bump_micros`), `instruments`; adds `venue_sessions`, `tick_regimes`, `auction_events` |
| [Order Routing, PFOF & Best Execution](/books/investing-and-digital-assets/routing-and-best-execution) | `legal_entities`, `orders`, `venues`, `executions`, `accounts`; adds `routing_rules`, `routing_decisions`, `execution_quality_samples`, `best_execution_reviews`, `routing_reports` |
| [Order Books & Matching Engines](/books/investing-and-digital-assets/order-books-and-matching) | `orders` (`stp_mode`, `post_only`, `engine_seq`), `executions` (`engine_seq`, `maker_order_id`, `taker_order_id`), `accounts`; builds on [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture)' `trading_pairs`; adds `matching_inputs`, `book_snapshots`, `self_trade_events` |
| [Market Data](/books/investing-and-digital-assets/market-data) | `parties`, `instruments`, `venues`, `legal_entities`; adds `market_data_entitlements`, `quotes`, `candles`, `data_usage_reports` |
| [Options](/books/investing-and-digital-assets/options-trading) | `instruments`, `asset_events`, `accounts`, `journal_entries`, `orders`; adds `option_series`, `option_strategies`, `exercise_notices`, `assignments`, `expiration_runs` |
| [Margin & Short Selling](/books/investing-and-digital-assets/margin-and-short-selling) | `legal_entities`, `instruments`, `accounts`, `cases`, `orders`; adds `margin_requirements`, `margin_calls`, `liquidation_orders`, `intraday_margin_deficits`, `locates`, `stock_loans` |
| [Pre-Trade Risk, Halts & Volatility](/books/investing-and-digital-assets/pre-trade-risk-and-halts) | `legal_entities`, `orders`, `instruments`, `venues`, `cases`; adds `risk_limits`, `pretrade_checks`, `trading_halts`, `instrument_restrictions`, `kill_switch_events` |
| [Extended Hours & 24-Hour Trading](/books/investing-and-digital-assets/extended-and-overnight-trading) | `executions` (`trade_date`), `venues`, `instruments`; alters [US Equity Market Structure](/books/investing-and-digital-assets/equity-market-structure)'s `venue_sessions` (`trading_session_id`); adds `trading_sessions`, `session_calendars`, `overnight_eligibility` |
| [Futures & FCMs](/books/investing-and-digital-assets/futures-and-fcms) | `instruments`, `venues`, `accounts`, `journal_entries`, `legal_entities`, `parties`, `transfers`; adds `futures_contracts`, `settlement_prices`, `variation_settlements`, `segregation_computations`, `residual_withdrawals` |
| [Event Contracts & Prediction Markets](/books/investing-and-digital-assets/prediction-markets) | `venues`, `instruments`, `legal_entities`; adds `resolution_sources`, `event_markets`, `event_outcomes`, `market_availability` |
| [Clearing & Settlement](/books/investing-and-digital-assets/clearing-and-settlement) | `legal_entities`, `executions`, `venues`, `settlements`, `instruments`; adds `clearing_submissions`, `cns_positions`, `clearing_fund_requirements`, `settlement_fails`, `buy_ins` |
| [Customer Protection, Net Capital & SIPC](/books/investing-and-digital-assets/customer-protection) | `legal_entities`, `instruments`, `journal_entries`; reads [Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions)'s `custody_locations` and a `customer_segregation_snapshot` derived at the close; adds `control_locations`, `possession_deficits`, `reserve_computations`, `net_capital_computations` |
| [Books, Records & the Audit Trail](/books/investing-and-digital-assets/books-records-and-cat) | `legal_entities`, `orders`, `cases`; adds `record_classes`, `cat_submissions`, `cat_feedback`, `clock_sync_samples`, `privacy_incidents` |
| [Market Surveillance & Manipulation](/books/investing-and-digital-assets/market-surveillance) | `legal_entities`, `accounts`, `parties`, `instruments`, `cases`, `orders`, `executions`; adds `surveillance_models`, `surveillance_alerts`, `alert_orders` |
| [Brokerage as a Service](/books/investing-and-digital-assets/brokerage-as-a-service) | `legal_entities`, `accounts`; loads `provider_statements`, the provider's daily position file as received; adds `partner_programs`, `obligation_allocations`, `omnibus_subaccounts` |
| [Advice, Reg BI & Conduct](/books/investing-and-digital-assets/advice-and-conduct) | `legal_entities`, `parties`, `accounts`, `orders`, `cases`; adds `recommendations`, `best_interest_reviews`, `conflicts`, `communications`, `communication_versions`, `promoters` |
| [Robo-Advisors & Model Portfolios](/books/investing-and-digital-assets/robo-advisors) | `legal_entities`, `instruments`, `accounts`, `journal_entries`; adds `model_portfolios`, `model_allocations`, `account_models`, `rebalance_runs`, `drift_checks` |
| [Tax-Loss Harvesting & Direct Indexing](/books/investing-and-digital-assets/tax-loss-harvesting-and-direct-indexing) | `parties`, `accounts`, `instruments`, `tax_lots`, `orders`, `lot_closings`; adds `tax_households`, `household_accounts`, `substitute_securities`, `harvest_runs`, `harvest_candidates`, `purchase_blocks`, `index_targets` |
| [IRAs & Retirement Accounts](/books/investing-and-digital-assets/retirement-accounts) | `accounts`, `transfers`, `journal_entries`; adds `ira_contributions`, `ira_distributions`, `rollovers`, `rmd_calculations`, `ira_matches` |
| [Portfolio Accounting & Performance](/books/investing-and-digital-assets/portfolio-accounting) | `accounts`, `journal_entries`, `transfers`, `fees`, `legal_entities`; adds `valuations`, `external_flows`, `benchmarks`, `performance_periods`, `composites`, `composite_members` |
| [RIA Custodians & Advisor Platforms](/books/investing-and-digital-assets/advisor-platforms) | `accounts`, `orders`, `journal_entries`, `fee_schedules`, `fees`; adds `advisor_firms`, `advisor_accounts`, `block_orders`, `block_allocations`, `advisory_fee_schedules`, `advisory_fee_runs`, `advisory_fee_lines` |
| [Blockchains for Platform Engineers](/books/investing-and-digital-assets/blockchains-for-engineers) | `chains` (`ledger_model`), `onchain_transactions` (`from_address`, `sender_nonce`, `max_fee_per_unit`, `max_priority_per_unit`, `fee_rate_sat_vb`, `effective_price`, `units_used`, `fee_burned`, `replaces_id`, `finality_rule_id`, `finalized_at_block`), `addresses`; adds `blocks`, `chain_heads`, `reorg_events`, `chain_finality_rules`, `utxos` |
| [Tokens & Token Standards](/books/investing-and-digital-assets/tokens-and-standards) | `asset_networks` (`decimals_verified_against`), `onchain_transactions`, `cases`; adds `token_contracts`, `token_behaviors`, `token_admin_changes` |
| [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing) | `wallets` (wider `key_scheme`), `parties`, `onchain_transactions`, `transfers`; adds `keys`, `key_shares`, `key_ceremonies`, `signing_policies`, `signing_requests`, `signing_approvals` |
| [Wallets](/books/investing-and-digital-assets/wallets) | `parties`, `chains`, `disclosures`, `asset_networks`; adds `self_custody_wallets`, `wallet_connections`, `signature_prompts`, `token_approvals` |
| [Chain Data & Indexing](/books/investing-and-digital-assets/chain-data-and-indexing) | `chains`, `asset_networks`, `addresses`, `reconciliations`, `instruments`; adds `ingest_cursors`, `observed_transfers`, `balance_checkpoints`, `price_sources`, `price_marks` |
| [Layer 2s, Bridges & Cross-Chain](/books/investing-and-digital-assets/layer-2s-and-bridges) | `asset_networks` (`provenance`, `bridge_route_id`), `chains`, `onchain_transactions`, `journal_entries`; adds `chain_relationships`, `bridge_routes`, `l2_withdrawals`, `bridge_transfers` |
| [How a Crypto Exchange Works](/books/investing-and-digital-assets/crypto-exchange-architecture) | `wallets` (`holds`), `accounts` (`residence_jurisdiction`), `legal_entities`, `venues`, `instruments`, `cases`, `asset_networks`, `reconciliations`; adds `product_offerings`, `trading_pairs`, `market_modes`, `ledger_wallet_proofs` |
| [Deposits & Withdrawals](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals) | `addresses` (`address_kind`, `deployed`), `asset_networks`, `transfers`, `accounts`, `wallets`, `onchain_transactions`, `cases`; adds `confirmation_policies`, `deposit_credits`, `address_allowlists`, `withdrawal_requests`, `withdrawal_checks`, `withdrawal_transactions`, `nonce_reservations`, `sweeps`, `misdirected_deposits` |
| [Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets) | `wallets` (`quorum_required`, `quorum_of`, `policy_version`, `xpub`, `created_by_ceremony_id`), `asset_networks`, `onchain_transactions`, `reconciliations`, `instruments`, `chains`; adds `wallet_limits`, `key_holdings`, `rebalance_transfers`, `ceremonies`, `ceremony_participants`, `treasury_snapshots` |
| [Listing & Delisting Assets](/books/investing-and-digital-assets/listing-assets) | `instruments`, `legal_entities`, `asset_networks`, `disclosures`, `asset_events`; adds `listing_reviews`, `listing_assessments`, `listing_decisions`, `listing_checklist_items`, `listing_insiders`, `instrument_stages`, `listing_announcements`, `delisting_plans` |
| [Crypto Trading Products](/books/investing-and-digital-assets/crypto-trading-products) | `fees` (`fee_tier_id`, `fee_rate`), `fee_schedules`, `accounts`, `instruments`, `disclosures`, `orders`, `settlements`, `venues`, `transfers`; alters [Fractional Shares & Recurring Investing](/books/investing-and-digital-assets/fractional-and-recurring)'s `recurring_plans` (`next_run_at`, `on_insufficient`); adds `fee_tiers`, `account_fee_tiers`, `convert_quotes`, `rfq_quotes`, `hedges`, `recurring_runs`, `liquidity_providers` |
| [Perpetuals & Crypto Derivatives](/books/investing-and-digital-assets/perpetuals-and-crypto-derivatives) | `positions` (`margin_mode`, `avg_entry_price`, `isolated_margin`), `instruments`, `venues`, `accounts`, `journal_entries`, `executions`; adds `perp_contracts`, `mark_prices`, `funding_rates`, `funding_payments`, `liquidations`, `insurance_fund_entries`, `adl_events` |
| [Staking as a Product](/books/investing-and-digital-assets/staking) | `accounts`, `instruments`, `disclosures`, `fee_schedules`, `wallets`, `chains`, `addresses`, `fees`, `journal_entries`, `cases`; adds `staking_positions`, `validator_assignments`, `reward_accruals`, `unbonding_requests`, `slashing_events` |
| [Proof of Reserves & Liabilities](/books/investing-and-digital-assets/proof-of-reserves) | `legal_entities`, `instruments`, `journal_entries`, `reconciliations`, `accounts`, `addresses`; reads an as-of position query (`positions_as_of`) over `journal_lines` at the ledger cut; adds `por_snapshots`, `liability_leaves`, `address_ownership_proofs` |
| [Exchange Security & Hacks](/books/investing-and-digital-assets/exchange-security) | `legal_entities`, `cases`, `wallets`, `onchain_transactions`, `transfers`, `accounts`, `instruments`, `journal_entries`; adds `security_incidents`, `withdrawal_anomalies`, `customer_reimbursements` |
| [FTX, Celsius & the 2022 Collapse](/books/investing-and-digital-assets/exchange-collapses) | none; its How to Build It gives the invariants the collapses motivate as queries over the core tables (and `risk_limits`), which [Trading Platform Architecture](/books/investing-and-digital-assets/trading-platform-architecture#invariants-checked-continuously) runs as `invariant_checks` |
| [Qualified Custody](/books/investing-and-digital-assets/qualified-custody) | `wallets` (`custody_arrangement_id`), `accounts`, `legal_entities`, `parties`; adds `custody_arrangements`, `custody_attestations`, `insurance_policies` |
| [Custody Platforms & Policy Engines](/books/investing-and-digital-assets/custody-platforms) | `wallets` (`sub_custodian_id`, `custody_client_id`), `parties`, `legal_entities`, `fee_schedules`, `venues`, `journal_entries`; adds `custody_clients`, `approval_quorums`, `off_exchange_settlements`, `sub_custodians` |
| [Crypto ETPs](/books/investing-and-digital-assets/crypto-etps) | `instruments`, `legal_entities`, `parties`, `transfers`; adds `etp_funds`, `nav_strikes`, `etp_creations`, `etp_redemptions` |
| [Prime Brokerage, OTC & Crypto Lending](/books/investing-and-digital-assets/crypto-prime-and-lending) | `accounts`, `legal_entities`, `parties`, `instruments`, `wallets`; alters [Margin & Short Selling](/books/investing-and-digital-assets/margin-and-short-selling)'s `margin_calls` (`crypto_loan_id`); adds `prime_credit_limits`, `collateral_pledges`, `crypto_loans`, `crypto_loan_collateral` |
| [Accounting for Crypto & Treasury Companies](/books/investing-and-digital-assets/crypto-accounting) | `journal_lines` (`gaap_treatment`), `legal_entities`, `instruments`, `parties`; adds `fair_value_measurements`, `safeguarding_assessments` |
| [The Stablecoin Business](/books/investing-and-digital-assets/stablecoin-business) | `legal_entities`, `instruments`, `journal_entries`; adds `distribution_agreements`, `reserve_income_accruals`, `distribution_payments` |
| [Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin) | `accounts`, `asset_networks`, `transfers`, `onchain_transactions`, `legal_entities`, `instruments`, `reconciliations`; adds `issuance_requests`, `redemption_requests`, `minter_allowances`, `reserve_holdings`, `supply_by_network` |
| [Stablecoin Law](/books/investing-and-digital-assets/stablecoin-law) | `legal_entities`, `instruments`; alters [Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin)'s `redemption_requests`; adds `issuer_regimes`, `redemption_policies`, `reserve_reports` |
| [Freezes, Blacklists & Seizures](/books/investing-and-digital-assets/freezes-and-onchain-compliance) | `cases`, `legal_entities`, `asset_networks`, `accounts`, `onchain_transactions`, `journal_entries`; reuses Payments' `address_screenings`; adds `freeze_orders`, `address_freezes`, `reissuances` |
| [Depegs, Runs & Synthetic Dollars](/books/investing-and-digital-assets/depegs-and-synthetic-dollars) | `instruments`, `venues`, `legal_entities`; adds `peg_observations`, `liquidity_stress_tests` |
| [DEXs & AMMs](/books/investing-and-digital-assets/dexs-and-amms) | `venues`, `chains`, `asset_networks`, `orders`, `disclosures`; adds `liquidity_pools`, `pool_states`, `swap_quotes`, `lp_positions` |
| [DeFi Lending & Liquidations](/books/investing-and-digital-assets/defi-lending) | `venues`, `chains`, `instruments`, `asset_networks`, `wallets`, `onchain_transactions`; adds `lending_markets`, `market_parameters`, `borrow_positions`, `health_checks`, `liquidation_events` |
| [Oracles & MEV](/books/investing-and-digital-assets/oracles-and-mev) | `chains`, `instruments`, `onchain_transactions`; adds `oracle_feeds`, `oracle_readings`, `private_submissions` |
| [Smart Contract Risk & Exploits](/books/investing-and-digital-assets/smart-contract-risk) | `chains`, `cases`; adds `contract_audits`, `contract_risk_reviews`, `exploit_incidents` |
| [DeFi from a Regulated Platform](/books/investing-and-digital-assets/defi-from-a-regulated-platform) | `chains`, `asset_networks`; adds `dex_routes`, `contract_screenings` |
| [Tokenized Treasuries & Funds](/books/investing-and-digital-assets/tokenized-funds) | `instruments`, `asset_networks`, `addresses`, `accounts`, `onchain_transactions`, `asset_events`; adds `tokenized_funds`, `holder_allowlists`, `onchain_nav_postings` |
| [Tokenized Stocks & 24/7 Securities](/books/investing-and-digital-assets/tokenized-stocks) | `instruments`, `asset_events`, `accounts`, `journal_entries`; adds `token_wrappers`, `underlying_holdings`, `token_entitlements` |
| [Transfer Agents & Permissioned Tokens](/books/investing-and-digital-assets/transfer-agents-and-permissioned-tokens) | `instruments`, `parties`, `addresses`, `asset_networks`; adds `holder_registry`, `transfer_restrictions`, `forced_transfers` |
| [Securities, Commodities & Crypto Market Structure](/books/investing-and-digital-assets/securities-or-commodities) | `instruments`; adds `asset_classifications`, `classification_reviews` |
| [Licensing a Crypto Business](/books/investing-and-digital-assets/crypto-licensing) | `legal_entities`; adds `license_applications`, `license_conditions`, `jurisdiction_permissions` |
| [AML & the Travel Rule for Crypto](/books/investing-and-digital-assets/crypto-aml-and-travel-rule) | `accounts`, `chains`; alters Payments' `travel_rule_records` (`vasp_counterparty_id`, `attestation_id`); adds `vasp_counterparties`, `unhosted_wallet_attestations` |
| [On-Chain Analytics & Investigations](/books/investing-and-digital-assets/blockchain-analytics) | `chains`, `transfers`, `onchain_transactions`, `cases`; reuses Payments' `address_screenings`; adds `attribution_labels`, `kyt_screenings`, `exposure_scores` |
| [Crypto Tax](/books/investing-and-digital-assets/crypto-tax) | `accounts`, `instruments`, `journal_entries`, `tax_lots`, `asset_events`; adds `wallet_basis_allocations`, `income_events`, `form_1099_da_records` |
| [Beyond the US](/books/investing-and-digital-assets/beyond-the-us) | `parties`, `legal_entities`; adds `customer_jurisdictions`, `jurisdiction_rules`, `passporting_notifications` |
| [Trading Platform Architecture](/books/investing-and-digital-assets/trading-platform-architecture) | `accounts`, `journal_entries`, `legal_entities`, `recon_breaks`; the playbook's `outbox_events`; a unique index on [Deposits & Withdrawals](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals)' `withdrawal_transactions`; adds `sequencer_inputs`, `invariant_checks`, `entity_partitions`, `account_shards` |
| [Peak Days, Outages & Resilience](/books/investing-and-digital-assets/peak-days-and-outages) | `cases`, `accounts`, `instruments`, `journal_entries`; adds `service_incidents`, `degradation_modes`, `outage_compensations` |
| [Account Security & Fraud](/books/investing-and-digital-assets/account-security) | `parties`, `transfers`, `cases`, `accounts`, `instruments`, `journal_entries`; alters [Exchange Security & Hacks](/books/investing-and-digital-assets/exchange-security)'s `security_incidents` (`affected_accounts`); widens Banking & Lending's `account_security_events` kinds; adds `device_bindings`, `withdrawal_holds`, `restitution_payments` |
| [AI in Investing](/books/investing-and-digital-assets/ai-in-investing) | `legal_entities`, `accounts`, `parties`, `disclosures`, `orders`, `transfers`; adds `ai_use_cases`, `agent_accounts`, `agent_actions` |
| [Investing & Digital Assets Metrics](/books/investing-and-digital-assets/investing-metrics) | `legal_entities`; adds `metric_definitions`, `metric_values` |
| [Conversions, Shutdowns & Distributions](/books/investing-and-digital-assets/conversions-and-shutdowns) | `accounts` (`last_owner_activity_at`), `legal_entities`, `parties`, `instruments`, `transfers`; adds `conversion_batches`, `conversion_accounts`, `distribution_claims`, `unclaimed_property_items` |

Three decisions keep the map one model rather than several:

- **One ledger for every asset.** Cash, shares, options, bitcoin, stablecoins and tokenized funds are all `instruments`, and every movement of any of them is a `journal_lines` row. A firm that keeps securities in one ledger and crypto in another cannot answer what a customer owns, or what one legal entity owes, in a single query.
- **One transfer table for every way in and out.** ACH, wires, ACATS, on-chain deposits and internal journals differ in their rails, not their shape: an instruction, a status, a hold, a settlement, a journal entry. Each chapter adds a detail table keyed by `transfers.id` instead of a parallel pipeline.
- **One reconciliation table for every outside record.** DTC positions, a clearing firm's statement, a custodian's report, a bank balance, a chain's balances at a block and an issuer's supply are all `reconciliations` rows, so "does the ledger agree with the world today" is one query.

## Auditing

The records in this chapter are the ones examiners, auditors, trustees, attestation accountants and courts ask about later:

- **Whose asset is where.** Every account with its legal entity and parties over time, every customer line in the ledger, every omnibus location, and the daily reconciliation of the two, so a regulator, a liquidation trustee or a proof of reserves can be run from the records alone.
- **Every movement, balanced.** Every journal entry balanced per instrument, with its source, its reversal and its settlement date; positions rebuilt from it match the positions customers were shown ([Payment States & Ledgers](/docs/money/payment-states#double-entry-ledger)).
- **Every order's history.** Every order with its events, routing decisions and executions, in sequence and timestamped, because best execution reviews, surveillance and the audit trail sample them years later.
- **Every chain event to finality.** Every on-chain transaction the firm sent or credited, with the block, confirmations and finality status at which it acted, and every reorg it saw.
- **What the customer was told.** Every disclosure as delivered and every fee with the schedule version that produced it.
- **Every clock and how it ended.** Every case with when notice arrived, the deadline the rule set and the outcome.

The mechanics (typed actors, append-only history, tamper evidence) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Put a legal entity on every account, wallet and journal entry,** and treat the brand as presentation over several regulated companies.
- **Make every instrument, cash included, a row with its smallest unit,** and store every quantity as an integer count of it in a column wide enough for any token.
- **Keep instruments and their chain deployments apart,** so one asset on many chains is one balance.
- **Make the ledger the only source of positions,** balanced per instrument, with settled and unsettled from the same lines.
- **Credit chain deposits only at the chain's finality rule,** and record the block and status you acted on.
- **Reconcile the ledger to every outside record daily,** DTC, clearing firm, custodian, bank, chain and issuer, and work every break to a resolution entry.
- **Give every order, transfer and withdrawal one idempotency key** that survives retries, so nothing trades, pays or signs twice.
- **Record every disclosure as delivered** and every fee with its schedule version.
- **Reuse the Payments and Banking & Lending models** for screening, the Travel Rule, ramps, parties and cases instead of rebuilding them.

## References

**Law and regulation**

- [17 CFR 240.10b-10](https://www.law.cornell.edu/cfr/text/17/240.10b-10), the confirmation at or before completion of a transaction and its contents, including capacity, payment for order flow and SIPC membership
- [17 CFR 240.17a-3](https://www.law.cornell.edu/cfr/text/17/240.17a-3), the securities record (stock record) of long and short positions and their locations, and customer ledger accounts
- [12 USC 5903](https://www.law.cornell.edu/uscode/text/12/5903), GENIUS Act reserves, monthly disclosure and examination, CEO and CFO certification, rehypothecation limits, the yield prohibition and freeze capability
- [12 USC 5906](https://www.law.cornell.edu/uscode/text/12/5906), the GENIUS Act's effective date provision
- [OCC: Implementing the GENIUS Act for the issuance of stablecoins (91 FR 67000, October 23, 2026)](https://www.federalregister.gov/api/v1/documents/2026-21706.json), the final rule's citation, docket, CFR parts and January 18, 2027 effective date; in its text, timely redemption within two business days (§ 15.12), notice to the OCC within 24 hours of redemption requests above 10% of outstanding issuance in a 24-hour period (§ 15.12(d)(1)) and the 5% same-day liquidity minimum (§ 15.11(c)(2))

**Regulators and guidance**

- [SEC: Press Release 2023-29](https://www.sec.gov/newsroom/press-releases/2023-29), adoption of T+1 on February 15, 2023, the May 28, 2024 compliance date, and same-day allocation, confirmation and affirmation
- [SIPC: What SIPC Protects](https://www.sipc.org/for-investors/what-sipc-protects), the $500,000 limit including $250,000 for cash, and the exclusion of unregistered digital asset investment contracts and of stablecoins from SIPA's definition of a security
- [NYDFS: Updated Guidance on Custodial Structures for Customer Protection in the Event of Insolvency (September 30, 2025)](https://www.dfs.ny.gov/industry-guidance/industry-letters/il20250930-updated-guidance-custodial-structures), segregation on-chain and in internal ledgers, omnibus wallets with per-customer records, no use of customer assets, sub-custody and reconciliation

**Filings and reports**

- [Robinhood Markets: Fourth quarter and full year 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000013/q42025robinhoodexhibit991.htm), 2025 total net revenues, transaction-based revenues, net interest and other revenues, and 2024 revenues
- [Robinhood Securities: Rule 606 report, second quarter 2026](https://cdn.finra.org/606/2026/287900_606_NMS_2026_Q2_V1.pdf), equity payment for order flow at 12.35% of the NBBO spread in regular hours and 9% in extended hours
- [Charles Schwab: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/316709/000031670926000009/schw-20251231.htm), 2025 net revenues by source
- [Coinbase Global: Form 10-Q for the third quarter of 2026](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000122/coin-20260930.htm), transaction, stablecoin, blockchain rewards and subscription and services revenue
- [Circle Internet Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000062/crcl-20251231.htm), reserve income, distribution costs and payments to Coinbase, USDC minted and redeemed, average circulation, reserve return rate, the Circle Reserve Fund and Circle Mint terms
- [Circle Internet Group: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000309/finalq3epr-110326.htm), the reserve return rate, USDC in circulation and quarterly mints and redemptions
- [Tether: Q3 2026 attestation release](https://tether.io/news/tether-generates-1-5-billion-in-q3-net-operating-profit-as-reserve-buffer-doubles-to-almost-8-billion/), net operating profit, USDT issued and Treasury bill exposure as of September 30, 2026

**Courts**

- [*In re Celsius Network LLC*, No. 22-10964 (MG) (Bankr. S.D.N.Y. Jan. 4, 2023), memorandum opinion on ownership of Earn account assets](https://www.nysb.uscourts.gov/sites/default/files/opinions/312902_1822_opinion.pdf), about 600,000 Earn accounts holding about $4.2 billion, and the Terms of Use transferring title to Celsius

**Standards and protocols**

- [DTCC: Continuous Net Settlement](https://www.dtcc.com/clearing-services/equities-clearing-services/cns), netting to one position per security per member, novation, settlement by book entry at DTC, fails, and the third quarter 2026 figures
- [Ethereum.org: Proof-of-stake](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/), slots, epochs, justification and finalization, and the cost of reverting a finalized block
- [Ethereum.org: Intro to ether](https://ethereum.org/en/developers/docs/intro-to-ether/), wei as the smallest denomination, 10^18 to the ether
- [Bitcoin developer glossary: Denominations](https://developer.bitcoin.org/glossary.html), 100,000,000 satoshis to the bitcoin
- [Circle: FiatToken design (stablecoin-evm)](https://raw.githubusercontent.com/circlefin/stablecoin-evm/master/doc/tokendesign.md), the minter roles and allowances, burning, blacklisting and pausing

**Vendor documentation**

- [Kraken: Fee schedule](https://www.kraken.com/features/fee-schedule), Kraken Pro spot maker and taker fees by 30-day volume tier
- [Kraken: Cryptocurrency deposit processing times](https://support.kraken.com/hc/en-us/articles/203325283-Cryptocurrency-deposit-processing-times), three confirmations for bitcoin deposits and the time estimate
- [Circle: Cross-Chain Transfer Protocol](https://developers.circle.com/cctp), burn-and-mint transfers and Fast and Standard Transfer times
