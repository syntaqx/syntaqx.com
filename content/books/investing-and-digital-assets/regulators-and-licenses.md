+++
title = "Regulators & Licenses"
description = "The SEC, FINRA, CFTC, NFA, states, OCC, NYDFS, FinCEN, IRS and SIPC; which registration each activity needs; and one brand as many regulated entities."
category = "Investing & Digital Assets Industry"
order = 2504
part = "The Business"
tags = ["investing", "regulators", "licensing", "broker-dealer", "crypto", "entities"]
+++

In investing, the license follows the activity, not the company. Holding a customer's stock is broker-dealer business regulated by the SEC and FINRA; holding the same customer's bitcoin is money transmission regulated state by state, or trust business under a charter; letting the customer bet on an election is a futures commission merchant's business under the CFTC; managing their portfolio for a fee is investment advice; issuing the dollar token they buy with is, from 2027, a permitted payment stablecoin issuer's. A single app that does all five is five or more regulated companies, each with its own capital, examiners, customer protection rules and bankruptcy estate, and the brand on the screen is not one of them.

For an engineer the consequence is that "which entity" is a column on almost every row. An order, a wallet, a fee and a journal entry each belong to exactly one legal entity, the entity's registrations decide what it may do and in which jurisdictions, and adding a product or a state is a licensing project before it is a feature. This chapter maps the regulators, then which registration each activity needs, then how two public companies divide themselves, and adds `entity_registrations`, `activity_license_map` and `entity_relationships` to [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model). Crypto licensing in depth (MSB, state money transmission and the MTMA, the BitLicense, California's DFAL, MiCA) is in [Licensing a Crypto Business](/books/investing-and-digital-assets/crypto-licensing); the general rules for bank and trust charters are Banking & Lending's [Charters & Regulators](/books/banking-and-lending/charters-and-regulators).

## The Regulators

| Regulator | What it covers in this volume | Basis |
| --- | --- | --- |
| **SEC** | Broker-dealers, exchanges, ATSs, clearing agencies, transfer agents, investment advisers with $100 million or more of assets under management, securities offerings including tokens that are securities, crypto ETPs | Securities Act of 1933, Securities Exchange Act of 1934, Investment Advisers Act of 1940 |
| **FINRA** | The self-regulatory organization every broker-dealer dealing with the public must join; rules on conduct, communications, options and margin, and the examinations and fines that enforce them | Exchange Act §15(b)(8) and §15A |
| **CFTC** | Futures, options on futures, swaps and event contracts; FCMs, designated contract markets (DCMs) and clearing organizations; fraud and manipulation in commodity markets | Commodity Exchange Act |
| **NFA** | The futures industry's self-regulatory organization, of which FCMs are members | Commodity Exchange Act |
| **State securities regulators** | Advisers below the SEC threshold, broker-dealer and agent registration in each state, and state securities fraud | State securities acts (coordinated through NASAA) |
| **State money transmission regulators** | Licenses for holding and transmitting customers' money and, in most states, virtual currency; 31 states had enacted the Money Transmission Modernization Act in full or in part as of September 2026 | State money transmission laws |
| **NYDFS** | The BitLicense for virtual currency business with New York or New Yorkers, New York limited purpose trust companies, and its custody and stablecoin guidance | 23 NYCRR Part 200; New York Banking Law |
| **OCC** | National banks and national trust banks, including the crypto custodians conditionally approved in December 2025; federal qualified stablecoin issuers it supervises under its GENIUS rule | National Bank Act; GENIUS Act |
| **FinCEN** | Bank Secrecy Act duties of broker-dealers, FCMs and money services businesses, including crypto exchanges; MSB registration | Bank Secrecy Act; 31 CFR Chapter X |
| **IRS** | Broker information reporting: Form 1099-B for securities and Form 1099-DA for digital assets, with gross proceeds for digital asset sales from January 1, 2025 and basis on certain transactions from January 1, 2026 | Internal Revenue Code and the broker reporting regulations |
| **SIPC** | Not a regulator: the nonprofit membership corporation that oversees the liquidation of failed member broker-dealers and protects each customer up to $500,000, including $250,000 of cash | Securities Investor Protection Act of 1970 |

Three relationships run through the table:

- **Registration plus membership.** A broker-dealer registers with the SEC (Exchange Act §15(a)(1) makes it unlawful to act as one without registering) and must also be a member of a registered securities association, which in practice is FINRA (§15(b)(8)), and is a member of SIPC by being registered (SIPA §3(a)(2)(A) makes "all persons registered as brokers or dealers" members, with exclusions for firms doing business mainly outside the US and for a few narrow lines). Each relationship brings a rulebook, an examination program and a fee: SIPC's assessment stays at 0.15% of net operating revenues for 2027, the board decided on September 17, 2026.
- **Federal and state, not either.** A securities broker answers to the SEC, FINRA and states; a crypto exchange serving US customers registers with FinCEN as an MSB and is licensed by each state that requires it, by NYDFS for New York, and, since July 1, 2026, by California's DFPI under its Digital Financial Assets Law. A national trust charter changes which state laws apply and which don't ([Preemption](/books/banking-and-lending/charters-and-regulators#preemption)).
- **Securities or commodities decides the first regulator.** A token that is a security is SEC territory from offering to trading; a token that is a commodity is CFTC territory for its derivatives and for fraud, and state money transmission territory for its custody. [Securities, Commodities & Crypto Market Structure](/books/investing-and-digital-assets/securities-or-commodities) covers how that line moved in 2025 and 2026.

## Which Registration Each Activity Needs

The activity map, US federal unless stated, as of November 2026:

| Activity | Registration | Regulator | Notes |
| --- | --- | --- | --- |
| Taking securities orders from the public | Broker-dealer (Form BD), FINRA membership, state registration | SEC, FINRA, states | SIPC membership follows; Rule 15c3-1 capital and, if it holds customer assets, Rule 15c3-3 |
| Clearing and carrying customer accounts | Broker-dealer, plus clearing agency memberships (NSCC, DTC, OCC for options) | SEC, FINRA, the clearing agencies | Self-clearing brokers hold these; introducing brokers contract for them ([Clearing & Settlement](/books/investing-and-digital-assets/clearing-and-settlement)) |
| Running a securities trading venue | National securities exchange (Exchange Act §6), or an ATS that registers as a broker-dealer and files Form ATS, or Form ATS-N for NMS stocks | SEC | An ATS trading 5% or more of an NMS stock's volume in 4 of 6 months owes fair access (Rule 301(b)(5)) |
| Keeping the official record of security holders | Transfer agent (Form TA-1) | SEC, or a bank regulator for bank transfer agents | Exchange Act §17A(c); the tokenized version is [Transfer Agents & Permissioned Tokens](/books/investing-and-digital-assets/transfer-agents-and-permissioned-tokens) |
| Managing portfolios or advising for a fee | Investment adviser (Form ADV) | SEC at $100 million or more of assets under management, or the home state below | An adviser between $100 million and $110 million may but need not register with the SEC, and needn't withdraw until below $90 million (Rule 203A-1) |
| Brokering futures, options on futures and event contracts | Futures commission merchant, NFA membership | CFTC, NFA | 7 USC 6d makes acting as an unregistered FCM unlawful and requires customer funds to be separately accounted for and not commingled |
| Listing futures or event contracts | Designated contract market | CFTC | Clearing them needs a derivatives clearing organization; [Event Contracts & Prediction Markets](/books/investing-and-digital-assets/prediction-markets#the-rules) |
| Holding, exchanging or transmitting crypto for US customers | MSB registration with FinCEN, plus state money transmitter licenses | FinCEN, states | FinCEN's 2019 guidance treats hosted wallet providers as account-based money transmitters; MSBs register within 180 days of establishment and renew every two years (31 CFR 1022.380) |
| The same, with or for New Yorkers | BitLicense, or a New York limited purpose trust charter | NYDFS | Covers receiving for transmission, safekeeping, buying and selling as a business, exchange services, and controlling, administering or issuing a virtual currency |
| The same, with or for Californians | DFAL license | California DFPI | Required from July 1, 2026, applications through NMLS; exemptions include some banks and firms expecting under $50,000 a year from covered activity |
| Custody as a fiduciary for advisers, funds and ETPs | National trust bank (OCC) or state trust company | OCC, state banking regulator | [Trust Charters for Custody](#trust-charters-for-custody) |
| Issuing a payment stablecoin in the US | Permitted payment stablecoin issuer: a subsidiary of an insured depository institution approved to issue, a federal qualified issuer, or a state qualified issuer | OCC, the other primary federal payment stablecoin regulators, or a certified state regulator | GENIUS Act; effective the earlier of January 18, 2027 or 120 days after final regulations; [Stablecoin Law](/books/investing-and-digital-assets/stablecoin-law) |
| Offering crypto in the EU | Crypto-asset service provider authorization under MiCA, passported across the EEA | The home member state's authority | Coinbase holds its MiCA license in Luxembourg and Robinhood Europe in Lithuania; [Beyond the US](/books/investing-and-digital-assets/beyond-the-us) |

Two rules are worth stating before any product plan. **An activity can need several rows at once:** a crypto app that also offers stock trading, staking and prediction markets needs the broker-dealer row, the crypto rows for every state it serves and the FCM row, each in a different entity. **Some permissions have dates in the future:** from three years after July 18, 2025 (July 18, 2028), the GENIUS Act bars a digital asset service provider from offering or selling a payment stablecoin to a US person unless a permitted issuer issued it, which turns an exchange's stablecoin listings into a compliance list with a deadline.

## One Company, Many Entities

Two US platforms that offer both securities and crypto divide themselves along the activity map. From their 2025 annual reports:

| Activity | Robinhood | Coinbase |
| --- | --- | --- |
| Securities brokerage | Robinhood Financial (introducing) and Robinhood Securities (clearing and carrying), and TradePMR (RIA custody) | Coinbase Capital Markets Corporation, an SEC-registered broker-dealer and FINRA member |
| Futures and event contracts | Robinhood Derivatives, an FCM and NFA member, also registered for cleared swaps | Coinbase Financial Markets (FCM); Coinbase Derivatives Exchange, a DCM |
| Crypto for US customers | Robinhood Crypto, registered with FinCEN and regulated by states as a money transmitter | Coinbase, Inc., licensed as a money transmitter or equivalent where required, plus the District of Columbia and Puerto Rico; a NYDFS BitLicense; registered with FinCEN as an MSB |
| Crypto custody as a fiduciary | (third-party custodians for Bitstamp) | Coinbase Custody Trust Company, a New York limited purpose trust company supervised by NYDFS |
| Investment advice | Robinhood Asset Management and Robinhood Ventures, SEC-registered advisers | |
| Banking and cards | Robinhood Money (a money transmitter; banking provided by Coastal Bank) and Robinhood Credit (the Gold Card, issued under a program with Coastal Bank) | |
| Europe | Robinhood Europe, regulated by the Bank of Lithuania as a financial brokerage firm and crypto-asset service provider with a MiCA license; Bitstamp Europe, a MiCA CASP; Bitstamp Financial Services, licensed under MiFID | Coinbase Luxembourg, holding a MiCA license; Coinbase Financial Services Europe, a MiFID derivatives broker supervised by Cyprus |
| United Kingdom and elsewhere | Robinhood U.K., authorized by the FCA | Electronic money services authorized by the FCA and the Central Bank of Ireland; a Bermuda Class F license; Deribit's conditional VARA license in Dubai; registrations in Singapore, Australia, India, Canada and Argentina |

What the split means in the systems:

- **Revenue lands in one entity and is shared with another.** Robinhood Securities receives the payment for order flow and passes 80% of it to Robinhood Financial under an allocation agreement ([How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models#payment-for-order-flow)); each entity's books, capital computation and regulator see their own share.
- **Capital is entity by entity.** A broker-dealer's net capital is computed for the broker-dealer alone (at least $250,000 for one that carries customer accounts), and Rule 15c3-1(e) requires notice two business days before withdrawals, advances or loans to the parent or affiliates that exceed 30% of excess net capital in 30 days, and prohibits them if net capital would fall below 120% of the minimum, so cash in one subsidiary isn't cash for the group.
- **Customer protection doesn't cross entities.** A stock in the broker-dealer is SIPC-protected; the same customer's bitcoin in the crypto entity is not; a futures margin balance in the FCM is protected by CFTC segregation, not SIPC. The app shows one balance; the ledger keeps three.
- **Each entity has its own examiners and enforcement history.** The SEC's 2020 order against Robinhood named Robinhood Financial; NYDFS's 2022 action, a $30 million penalty, was against Robinhood Crypto ([Enforcement Defines the Map](#enforcement-defines-the-map)).

## Trust Charters for Custody

A trust charter lets a firm hold assets as a fiduciary rather than as a money transmitter, and for crypto custodians it is what qualifies them to hold assets for advisers, funds and ETPs ([Qualified Custody](/books/investing-and-digital-assets/qualified-custody) covers the custody rule). Two routes are in use:

- **State trust companies.** NYDFS lets a limited purpose trust company chartered under the New York Banking Law conduct virtual currency business without a separate BitLicense, with the Superintendent's approval; unlike a BitLicensee it can exercise fiduciary powers and transmit money in New York without a separate money transmitter license. Coinbase Custody Trust Company is one.
- **National trust banks.** On December 12, 2025, the OCC conditionally approved de novo national trust banks for Circle (First National Digital Currency Bank) and Ripple, and conversions of BitGo, Fidelity Digital Assets and Paxos from state trust companies; BitGo's 10-K reports the conversion to BitGo Bank & Trust, National Association. A national trust bank holds no insured deposits and answers to the OCC (Banking & Lending's [Trust Banks and Novel Charters](/books/banking-and-lending/charters-and-regulators#trust-banks-and-novel-charters) covers the charter's limits).

A charter is also a stablecoin route: an OCC-chartered entity is one of the federal paths to becoming a permitted issuer under the GENIUS Act.

## Enforcement Defines the Map

Where an activity's license was unclear, enforcement drew the line, and the cases are the clearest statement of what each regulator expects:

- **Binance, November 21, 2023.** FinCEN imposed a $3.4 billion civil penalty, then the largest in its history, with a five-year monitorship, and OFAC settled for $968 million over more than 1.67 million trades between August 2017 and October 2022 between US persons and users in sanctioned jurisdictions or blocked persons; FinCEN found Binance never filed a suspicious activity report and failed to report well over 100,000 suspicious transactions. The CFTC ordered $1.35 billion of disgorgement and a $1.35 billion penalty against Binance, and $150 million against its founder, for failing to register in the capacities its business required (FCM, foreign board of trade, DCM, SEF). Across the four actions that day, Binance agreed to pay over $4.3 billion. An offshore exchange with US customers was a US-regulated business whether or not it registered.
- **Robinhood Financial, December 17, 2020.** A $65 million SEC penalty for not disclosing payment for order flow as its largest revenue source and for best execution failures ([How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models#payment-for-order-flow)).
- **Kraken, February 9, 2023.** Two Kraken entities paid $30 million and agreed to stop offering securities through staking services, which the SEC said had advertised annual returns of as much as 21 percent. On May 29, 2025 the staff of the Division of Corporation Finance said that protocol staking, including custodial staking where the custodian does not decide whether, when or how much to stake, does not involve the offer and sale of securities, in a statement that does not address liquid staking or restaking and does not bind the Commission ([Staking as a Product](/books/investing-and-digital-assets/staking) covers both).

The general BSA program rules behind these cases are in Banking & Lending's [Enforcement Engineers Should Read](/books/banking-and-lending/bsa-aml#enforcement-engineers-should-read), and the crypto-specific cases in [AML & the Travel Rule for Crypto](/books/investing-and-digital-assets/crypto-aml-and-travel-rule).

## How to Build It

`legal_entities` in [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) keeps a JSON list of registrations; a platform that adds products and jurisdictions needs them as rows with dates, a map from activity to required registration, and the ownership and service relationships between entities:

```sql
CREATE TABLE entity_registrations (        -- one license, registration or membership
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  regulator           TEXT NOT NULL,         -- 'sec', 'finra', 'cftc', 'nfa', 'fincen', 'occ',
                                             -- 'nydfs', 'ca_dfpi', 'us_tx_dob', 'bank_of_lithuania'
  kind                TEXT NOT NULL,         -- 'broker_dealer', 'finra_member', 'sipc_member',
                                             -- 'fcm', 'dcm', 'ria', 'msb', 'mtl', 'bitlicense',
                                             -- 'trust_charter', 'ppsi', 'casp', 'emi', 'ats'
  jurisdiction        TEXT NOT NULL,         -- 'US', 'US-NY', 'US-CA', 'LT', 'EEA', ...
  identifier          TEXT,                  -- CRD, NFA ID, NMLS ID, MSB registration number
  status              TEXT NOT NULL CHECK (status IN ('applied', 'conditional', 'active',
                        'suspended', 'surrendered', 'revoked')),
  conditions          TEXT,                  -- conditional approvals, consent order terms
  valid_during        DATERANGE NOT NULL,    -- from grant to expiry or surrender
  renews_on           DATE,                  -- MSB registrations renew every two years
  source_ref          TEXT NOT NULL          -- the approval letter, register entry or filing
);

CREATE TABLE activity_license_map (        -- what an activity needs, where, from when
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  activity            TEXT NOT NULL,         -- 'securities_brokerage', 'crypto_custody',
                                             -- 'crypto_exchange', 'event_contracts', 'staking',
                                             -- 'advisory', 'stablecoin_distribution', ...
  jurisdiction        TEXT NOT NULL,
  required_kinds      TEXT[] NOT NULL,       -- any one of these registrations satisfies it
  authority           TEXT NOT NULL,         -- '15 USC 78o(a)', '23 NYCRR 200', 'Cal. Fin. Code 3201'
  valid_during        DATERANGE NOT NULL,    -- e.g. DFAL from 2026-07-01
  reviewed_at         DATE NOT NULL,
  UNIQUE (activity, jurisdiction, valid_during)
);

CREATE TABLE entity_relationships (        -- ownership and intercompany service
  parent_id           UUID NOT NULL REFERENCES legal_entities (id),
  child_id            UUID NOT NULL REFERENCES legal_entities (id),
  kind                TEXT NOT NULL CHECK (kind IN ('owns', 'introduces_to', 'clears_for',
                        'custodies_for', 'services', 'revenue_share')),
  ownership_pct       NUMERIC(5, 2),
  agreement_ref       TEXT,
  valid_during        DATERANGE NOT NULL,
  PRIMARY KEY (parent_id, child_id, kind, valid_during),
  CHECK (parent_id <> child_id)
);
```

Before an account is opened, a product enabled or an order accepted, the check is one query: for the activity and the customer's jurisdiction on that date, does the entity that would carry it hold an active registration of a required kind? A sketch:

```sql
SELECT m.activity
FROM activity_license_map m
WHERE m.activity = $1 AND m.jurisdiction = $2 AND m.valid_during @> $3::date
  AND NOT EXISTS (
    SELECT 1 FROM entity_registrations r
    WHERE r.legal_entity_id = $4
      AND r.kind = ANY (m.required_kinds)
      AND r.jurisdiction IN (m.jurisdiction, 'US')
      AND r.status = 'active'
      AND r.valid_during @> $3::date);
-- a row back means the entity may not do this activity here on this date
```

Design notes:

- **Permissions are data, not code.** A new state license, a surrender or a conditional approval changes `entity_registrations`; the product gates read it, so turning on a state is an insert reviewed by compliance rather than a deploy ([Rules as Data](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Every record names its entity.** Accounts, wallets, fees and journal entries carry `legal_entity_id`; a customer who uses three products has three accounts at three entities under one login, and statements, tax forms and capital computations are produced per entity.
- **Intercompany is explicit.** Introducing-to-clearing, custody and revenue-share relationships are rows with agreements and dates, because the entity that receives revenue and the entity that earned it are often different ([How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models#how-to-build-it)).
- **Conditions are part of the registration.** Conditional charter approvals and consent orders impose limits (capital, products, monitorships); store them with the registration so a product gate can read them.

## Auditing

- **Which entity did what, under which registration, on what date,** for every account opened, product enabled and order accepted.
- **Every registration's history** with its approval, conditions, renewals and any surrender or revocation, and the source document.
- **The activity map's versions** and who reviewed them, so a launch in a new state can be traced to the legal position it relied on.
- **Intercompany agreements and allocations** behind every revenue or cost moved between entities.

## What This Means for the System You Build

- **Map activities to registrations before building features;** a product in a new state or country is a license first.
- **Put the legal entity on every row** that holds or moves an asset, and produce books per entity.
- **Gate products on registrations as data,** with dates and conditions, not on flags in code.
- **Keep protections separate per entity:** SIPC for the broker-dealer, segregation for the FCM, the license's custody rules for the crypto entity.
- **Watch the dated permissions:** DFAL from July 1, 2026, the GENIUS Act from January 2027, and the 2028 limit on offering stablecoins from non-permitted issuers.

## References

**Law and regulation**

- [15 USC 78o](https://www.law.cornell.edu/uscode/text/15/78o), broker-dealer registration and the securities association membership requirement
- [15 USC 78q-1](https://www.law.cornell.edu/uscode/text/15/78q-1), transfer agent registration
- [15 USC 78ccc](https://www.law.cornell.edu/uscode/text/15/78ccc), SIPC membership and its exclusions
- [17 CFR 242.301](https://www.law.cornell.edu/cfr/text/17/242.301), ATS broker-dealer registration, Forms ATS and ATS-N, and fair access at 5% of volume
- [17 CFR 240.15c3-1](https://www.law.cornell.edu/cfr/text/17/240.15c3-1), the $250,000 minimum for carrying firms, the 15:1 aggregate indebtedness standard and the notice and prohibition rules for capital withdrawals
- [17 CFR 275.203A-1](https://www.law.cornell.edu/cfr/text/17/275.203A-1), the $100 million, $110 million and $90 million adviser registration thresholds
- [7 USC 6d](https://www.law.cornell.edu/uscode/text/7/6d), FCM registration and segregation of customer funds
- [7 USC 7](https://www.law.cornell.edu/uscode/text/7/7), designation of contract markets
- [31 CFR 1022.380](https://www.law.cornell.edu/cfr/text/31/1022.380), MSB registration, the 180-day deadline, two-year renewals and agent lists
- [12 USC 5901](https://www.law.cornell.edu/uscode/text/12/5901), GENIUS Act definitions of payment stablecoin, permitted issuer and digital asset service provider
- [12 USC 5902](https://www.law.cornell.edu/uscode/text/12/5902), the issuance prohibition and the three-year limit on digital asset service providers
- [12 USC 5904](https://www.law.cornell.edu/uscode/text/12/5904), issuer approval by the primary federal payment stablecoin regulator
- [12 USC 5906](https://www.law.cornell.edu/uscode/text/12/5906), the GENIUS Act's effective date

**Regulators and guidance**

- [FinCEN: Application of FinCEN's Regulations to Certain Business Models Involving Convertible Virtual Currencies (FIN-2019-G001, May 9, 2019)](https://www.fincen.gov/sites/default/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf), hosted wallet providers as account-based money transmitters
- [NYDFS: Virtual Currency Businesses](https://www.dfs.ny.gov/apps_and_licensing/virtual_currency_businesses), virtual currency business activity, the June 24, 2015 effective date and the limited purpose trust company alternative
- [California DFPI: Digital Financial Assets Law FAQ](https://dfpi.ca.gov/regulated-industries/digital-financial-assets/digital-financial-assets-law-frequently-asked-questions/), the July 1, 2026 licensing date, NMLS and exemptions
- [CSBS: Money Transmission Modernization Act](https://www.csbs.org/csbs-money-transmission-modernization-act-mtma), 31 states enacting in full or in part as of September 2026
- [IRS: Final regulations and related guidance for reporting by brokers on sales and exchanges of digital assets](https://www.irs.gov/newsroom/final-regulations-and-related-IRS-guidance-for-reporting-by-brokers-on-sales-and-exchanges-of-digital-assets), Form 1099-DA gross proceeds from 2025 and basis from 2026
- [SIPC: Mission](https://www.sipc.org/about-sipc/sipc-mission), SIPC's role and the $500,000 and $250,000 limits
- [SIPC: Assessment rate](https://www.sipc.org/for-members/assessment-rate), 0.15% of net operating revenues effective January 1, 2027
- [OCC: Conditional approvals of national trust bank charters (NR 2025-125, December 12, 2025)](https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-125.html), the five approvals
- [Treasury: Binance settlement (November 21, 2023)](https://home.treasury.gov/news/press-releases/jy1925), the FinCEN penalty, OFAC settlement, monitorship and findings
- [CFTC: Binance and Zhao to pay $2.85 billion (Release 8825-23, November 21, 2023)](https://www.cftc.gov/PressRoom/PressReleases/8825-23), the registration failures, the amounts and the total across agencies
- [SEC: Press Release 2020-321 (December 17, 2020)](https://www.sec.gov/news/press-release/2020-321), the Robinhood Financial penalty
- [SEC: Kraken to discontinue unregistered offer and sale of crypto asset staking-as-a-service program (Press Release 2023-25, February 9, 2023)](https://www.sec.gov/newsroom/press-releases/2023-25), the $30 million payment and advertised returns
- [SEC Division of Corporation Finance: Statement on Certain Protocol Staking Activities (May 29, 2025)](https://www.sec.gov/newsroom/speeches-statements/statement-certain-protocol-staking-activities-052925), custodial staking conditions and the statement's limits

**Filings**

- [Robinhood Markets: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000023/hood-20251231.htm), subsidiaries, registrations, the FCM and cleared swaps registration, money transmitters, advisers, EU and UK licenses, the dividend approval threshold and the NYDFS penalty
- [Robinhood Securities: Rule 606 report, second quarter 2026](https://cdn.finra.org/606/2026/287900_606_NMS_2026_Q2_V1.pdf), the 80% revenue allocation to Robinhood Financial
- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), money transmitter licenses, the BitLicense, MSB registration, Coinbase Custody Trust Company, the broker-dealer, FCM and DCM, MiCA and MiFID entities, and other jurisdictions
- [BitGo Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1740604/000174060426000020/btgo-form10xk.htm), the conversion to a national trust bank
