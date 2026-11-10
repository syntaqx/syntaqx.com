+++
title = "Beyond the US"
description = "MiFID II and its PFOF ban, MiCA after the transition, the UK's 2027 crypto regime, Singapore, Hong Kong, Dubai and Japan, and serving customers across them."
category = "Investing & Digital Assets Industry"
order = 2575
part = "The Rules"
tags = ["crypto", "international", "mifid", "mica", "fca", "mas", "sfc", "vara"]
+++

The US regulates by activity and by state; most of the rest of the world regulates by jurisdiction and by license class, and the large platforms answer by building one regulated entity per region and serving each customer from the entity their residence points to. The EU is the largest single market and the most codified: MiFID II for securities brokers and MiCA for crypto since December 30, 2024, both with a passport that lets one authorization serve thirty countries. The UK left the EU before MiCA and is building its own crypto regime for October 2027. Singapore, Hong Kong, Dubai and Japan each license crypto platforms under rules that restrict what retail customers may be offered, and each publishes a register that says who made it.

For engineering, the international problem is mostly a resolution problem: which jurisdiction is this customer in, which of the platform's entities serves it, and which local rules (a product ban, an incentive ban, a cold storage share, a cooling-off period) apply to this customer on this day. This chapter surveys the regimes, from the rules that bind brokers and crypto platforms to the registers that show who is licensed, and adds `jurisdiction_rules`, `customer_jurisdictions` and `passporting_notifications` to [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model). MiCA authorization step by step is in [The EU: MiCA CASP Authorization](/books/investing-and-digital-assets/crypto-licensing#the-eu-mica-casp-authorization); stablecoin issuers under MiCA and the UK are in [Stablecoin Law](/books/investing-and-digital-assets/stablecoin-law#the-eu-mica); the EU and UK as payment rails are the Payments volume's [The EU and the UK](/books/payments/stablecoins#the-eu-and-the-uk).

## How the Platforms Do It

Where large platforms hold their non-US licenses, from the regulators' registers as of November 2026:

| Platform | EU (ESMA interim MiCA register) | Dubai (VARA) | Elsewhere |
| --- | --- | --- | --- |
| **Binance** | None | Binance FZE | Binance Japan, registered with Japan's FSA October 14, 2022 |
| **Bitpanda** | Bitpanda GmbH, Austria, April 9, 2025 | | |
| **Bitvavo** | Bitvavo B.V., Netherlands AFM, June 26, 2025 | | |
| **Bullish** | | | Licensed VATP in Hong Kong, February 18, 2025 |
| **Bybit** | Bybit EU GmbH, Austria, May 28, 2025 | Bybit Fintech FZE (exchange only) | Hong Kong applicant, not deemed licensed |
| **Coinbase** | Coinbase Luxembourg S.A., CSSF, June 20, 2025 | | Coinbase on Japan's FSA register |
| **Crypto.com** | Foris DAX MT, Malta, January 27, 2025 | Foris DAX Middle East FZE | Deemed-to-be-licensed applicant in Hong Kong, not yet SFC-licensed |
| **eToro** | eToro (Europe) Ltd, Cyprus, January 16, 2025 | | |
| **Kraken** | Payward Europe Solutions and Payward Global Solutions, Central Bank of Ireland, June 25, 2025 | Payward FZCO | |
| **OKX** | OKX Europe, Malta, January 27, 2025 | OKX Middle East Fintech FZE | OKCoin Japan on the FSA register |
| **Revolut** | Revolut Digital Assets (Europe), Cyprus, October 20, 2025 | | |
| **Robinhood** | Robinhood Europe UAB, Bank of Lithuania, May 29, 2025 | | Robinhood U.K., FCA ([One Company, Many Entities](/books/investing-and-digital-assets/regulators-and-licenses#one-company-many-entities)) |

Three patterns. **One EU home, chosen deliberately.** The homes cluster in Malta, Cyprus, Luxembourg, Ireland, Austria and Lithuania, where the large firms were authorized in 2025 ahead of the July 1, 2026 deadline. **Dubai is the offshore exchanges' regulated home.** Binance, Bybit, OKX and Crypto.com, none of which serves US retail through its main entity, all hold VARA licenses. **Hong Kong and Japan are narrow.** Few global exchanges are licensed in either, and the lists are short enough to read in full.

## The EU

### MiFID II for brokers

An investment firm authorized under MiFID II in one member state can provide its services across the EEA by notifying, the same passport model MiCA copied, which is how Robinhood Europe (Lithuania) and eToro (Cyprus) serve the Union. The rule a US broker's business model runs into is in MiFIR: Article 39a, "Prohibition of receiving payment for order flow," says investment firms acting for retail clients (and professionals who opted up) "shall not receive any fee, commission or non-monetary benefit from any third party" for routing their orders to a particular venue for execution. Venue rebates are allowed only where they are in the venue's approved public tariff, benefit only the client, and give the firm no monetary benefit. Member states where firms already received PFOF before March 28, 2024 could exempt those firms for clients domiciled in that state, but only until June 30, 2026. Since July 1, 2026 the US model of [Payment for Order Flow](/books/investing-and-digital-assets/revenue-models#payment-for-order-flow) is unavailable to EU retail brokers, which is why EU neobrokers earn from FX conversion, interest, subscriptions and venue tariffs instead.

### MiCA for crypto

MiCA's CASP authorization, passport, capital classes and transitional periods are in [The EU: MiCA CASP Authorization](/books/investing-and-digital-assets/crypto-licensing#the-eu-mica-casp-authorization). What an operator of an EU platform lives with after July 1, 2026:

- **No grandfathering left.** Every transitional period ended by July 1, 2026, and ESMA's interim register publishes a list of non-compliant entities (NCASP) alongside the authorized CASPs, updated weekly; the register page showed a last update of November 5, 2026.
- **The service letters are the license.** Each register entry lists the Article 3(1)(16) services authorized; Circle's French e-money entity, for example, which notified under Article 60 rather than applying, is listed for custody (a) and transfer (j) only, and Bitvavo for custody, a trading platform and transfer. A product that adds a service needs the authorization to add a letter first.
- **Listings follow white papers** ([The EU: admission to trading under MiCA](/books/investing-and-digital-assets/listing-assets#the-eu-admission-to-trading-under-mica)), and stablecoins only from authorized issuers ([MiCA and non-compliant stablecoins](/books/investing-and-digital-assets/listing-assets#mica-and-non-compliant-stablecoins)).
- **Travel Rule data goes with every crypto transfer,** with no threshold in the EU ([The Travel Rule](/books/payments/stablecoins#the-travel-rule)).

## The United Kingdom

The UK runs two crypto regimes in sequence. Until October 25, 2027, crypto firms register with the FCA under the Money Laundering Regulations, an AML registration rather than a conduct license, and every firm marketing crypto to UK consumers is under the FCA's financial promotion rules (PS23/6), which require risk warnings, ban incentives to invest, impose "positive frictions" for first-time investors, and require client categorisation and an appropriateness assessment.

From October 25, 2027, crypto activities become regulated activities under the Financial Services and Markets Act 2000 (Cryptoassets) Regulations 2026, passed on February 4, 2026. The FCA's final rules came in five policy statements on June 30, 2026:

| Policy statement | Covers | Handbook |
| --- | --- | --- |
| PS26/9 | Admissions and disclosures; the market abuse regime for cryptoassets | CRYPTO 3 and 4 |
| PS26/10 | Stablecoin issuance and backing asset safeguarding | CRYPTO 2, CASS 16 |
| PS26/11 | Trading platforms, dealing, arranging, custody, lending and borrowing, staking | CRYPTO 5 to 10, CASS 17 |
| PS26/12 | Prudential rules | COREPRU, CRYPTOPRU |
| PS26/13 | How the rest of the Handbook applies | |

The application window runs from September 30, 2026 to February 28, 2027. MLR registrations "will not convert automatically"; a firm that applies within the window may, under conditions, keep operating until its application is decided, and a firm that applies late cannot rely on that and may have to stop. Product rules worth building toward: staking may be automatic only with ongoing consent and an annual notice, retail lending and borrowing comes with appropriateness tests, over-collateralisation and negative balance protection, and admissions use a digital token identifier standard. The stablecoin rules are in [The UK](/books/investing-and-digital-assets/stablecoin-law#the-uk). On PFOF, the FCA told firms in a December 13, 2017 Dear CEO letter that "firms who continue to charge PFOF will breach the new standards implemented in MiFID II," which tightened the limits on third-party payments for retail and professional client orders and the conflicts of interest rules, and warned against structures built to replicate it, such as tying market makers' research fees to order flow or routing through overseas affiliates; its April 2019 multi-firm review found firms had largely stopped charging for exclusive liquidity but some routed client orders to overseas affiliates that took PFOF. That is the same end state the EU reached by statute.

## Singapore

The Monetary Authority of Singapore licenses digital payment token (DPT) services under the Payment Services Act and, since June 30, 2025, applies the digital token service provider regime under the Financial Services and Markets Act 2022 to Singapore firms that serve only customers outside Singapore: they need a license, and MAS said it "has set the bar high for licensing and will generally not issue a licence" to them. The effect was to end Singapore as a booking location for offshore-only exchanges.

For DPT service providers serving Singapore customers, MAS's consumer protection guidelines (PS-G03, issued April 2, 2024, revised September 19, 2024, in effect in stages from October 4, 2024 and June 19, 2025) are product rules:

- **Custody:** at least 90% of customer assets in cold wallets, and the people who control movement of customer assets resident in Singapore.
- **No use of retail assets:** no lending, staking or pledging of retail customers' DPTs.
- **Access:** a Risk Awareness Assessment before serving a retail customer, with no service or a reassessment for one who fails.
- **No incentives:** no sign-up, referral or "learn and earn" rewards to retail customers, and none to people who refer them.
- **No credit:** no credit or DPT loans to retail, no leveraged DPT transactions or DPT derivatives with retail, and no credit or charge card funding.
- **Structure:** a firm may not operate a market and act as broker in the same legal entity.

Accredited investors are outside most of the retail restrictions, and the test counts crypto at a discount: net personal assets over S$2 million, net financial assets over S$1 million or income over S$300,000, with DPT holdings counted after at least a 50% haircut and capped at S$200,000. Worked: a customer with S$1.1 million of other net personal assets and S$600,000 of DPTs counts min(600,000 × 50%, 200,000) = S$200,000 of crypto, for S$1.3 million, below S$2 million, so the customer is retail unless another limb is met; without the haircut and cap the same customer would have counted S$1.7 million. The eligibility computation, its inputs and its date belong in the customer's record, because it decides which product rules apply.

## Hong Kong

The Securities and Futures Commission licenses virtual asset trading platforms. Its list, updated October 16, 2026, shows thirteen licensed platforms: OSL (December 15, 2020), HashKey (November 9, 2022), HKVAX (October 3, 2024), HKbitEX, Accumulus, DFX Labs and EX.IO (December 18, 2024), PantherTrade and YAX (January 27, 2025), Bullish (February 18, 2025), BGE (June 17, 2025), VDX (February 13, 2026) and Bixin.com (May 18, 2026). Five applicants are listed, two deemed licensed while their applications are pending (Crypto.com's Foris DAX HK, and WhaleFin, which has ceased operating) and three not deemed licensed (bitV, Nebulas and Bybit's Spark Fintech); eighteen applications were returned, refused or withdrawn, and one platform, Matrixport HK, must close by January 12, 2027. For stablecoins, the Hong Kong Monetary Authority's licensing regime under the Stablecoins Ordinance began August 1, 2025; its first two licenses took effect April 10, 2026, to Anchorpoint Financial and HSBC.

## The UAE: Dubai's VARA

Dubai's Virtual Assets Regulatory Authority licenses virtual asset activities under its Virtual Assets and Related Activities Regulations 2023 (the current version effective June 19, 2025), in categories that read like a license map of their own: exchange (including exchange-traded derivatives), broker-dealer, management and investment, custody, Category 1 virtual asset issuance, lending and borrowing, transfer and settlement, and advisory. Its public register lists 60 licensed virtual asset service providers, the latest Bybit Fintech FZE on October 20, 2026, including Binance FZE, OKX Middle East Fintech FZE, Bybit Fintech FZE, Foris DAX Middle East FZE (Crypto.com), Payward FZCO, Deribit, HashKey MENA, Hex Trust, Standard Chartered and Zand Bank. Each license is by activity, so an entity licensed only for exchange services can't offer custody or lending to its customers without adding the activity.

## Japan

Japan registers crypto-asset exchange service providers and publishes the list. As of September 30, 2026 it held 27 firms, 25 under the Kanto Local Finance Bureau and 2 under Kinki, among them bitFlyer, bitbank, GMO Coin, SBI VC Trade, Coincheck, Rakuten Wallet, OKCoin Japan, Coinbase (listed with no assets) and Binance Japan, with Laser Digital Japan the newest (August 21, 2026). Japanese law requires at least 95% of users' crypto to be held offline, as FTX's bankruptcy report recorded ([Coincheck and the Japanese rules](/books/investing-and-digital-assets/exchange-security#coincheck-and-the-japanese-rules)), the strictest cold storage share of any regime here and stricter than Singapore's 90%.

## Canada and Others

Canada regulates crypto trading platforms through its provincial securities regulators, acting together as the CSA. A platform that keeps operating while it seeks registration (as a restricted dealer or investment dealer, the two categories CSA Staff Notice 21-332 names for registered platforms) must give a pre-registration undertaking, which the February 22, 2023 notice tightened after the Voyager, Celsius, FTX, BlockFi and Genesis failures: custody and segregation of Canadian clients' crypto, no pledging or rehypothecating it, no margin or leverage for any client, co-signed commitments from global affiliates and controlling minds, crypto (including the platform's own tokens) excluded from excess working capital, regular financial filings, a qualified chief compliance officer, and no buying or depositing of value-referenced crypto assets (stablecoins) or trading of proprietary tokens without the CSA's prior written consent. For consent to a stablecoin, the CSA expects it to be fiat-backed, with a reserve at least equal to the units outstanding at the end of each day, held in cash or cash equivalents by a qualified custodian, segregated, and attested monthly and audited annually; it does not expect to consent to algorithmic ones. A platform that won't give the enhanced undertaking is expected to off-board its Canadian users. <!-- source-gap: ida-canada-ctp | missing | the CSA's retail investment limits for crypto trading platforms and the current list of registered platforms (the pre-registration undertaking and stablecoin terms are sourced to CSA Staff Notice 21-332) | closes with: the CSA or OSC crypto trading platform pages, opened (the CSA page redirected and the OSC returned 403 on 2026-11-05) | checked: 2026-11-10 --> I couldn't open the regulators' platform pages, so I don't state retail investment limits or the list of registered platforms. Australia, Brazil, Korea and others have regimes of their own; the operating model below is the same for each.

## Operating Across Them

Five rules, drawn from the regimes above and from the US cases where they were broken:

1. **Residence decides the regime,** and residence is resolved from evidence, not a session. KYC address, identity document, tax residence, funding account country, phone and IP each point somewhere; geofencing on IP alone is what the Binance and BitMEX resolutions found leaking ([Enforcement](/books/investing-and-digital-assets/crypto-aml-and-travel-rule#enforcement)).
2. **One customer, one serving entity per product.** A German resident's crypto is served by the EU CASP and their stocks by the EU investment firm; the US entity doesn't serve them, and moving their account between entities is a migration with customer notice, not a database update.
3. **Local rules are product rules.** Singapore's incentive ban turns off referral rewards for Singapore retail; the UK's promotion rules gate the first purchase; the EU's PFOF ban changes the routing table. They live as data keyed by jurisdiction and customer classification.
4. **Passports have dates.** A MiCA passport lets a CASP serve a host state from the home authority's confirmation or the 15th calendar day after notifying; the product gate reads that date, not the day someone flipped a flag.
5. **Moves are re-resolutions.** A customer who moves from Germany to Singapore is a new resolution, with the old entity's offboarding rules and the new entity's onboarding (and possibly no service at all).

Worked: a customer's KYC address and identity document are German, their funding account is French, and their last three sessions came from Spain on holiday. Residence resolves to Germany (address and document agree; funding and IP are consistent with EU travel), the serving entity is the platform's EU CASP, and the German market is reachable either because Germany is the home state or because a passport notification for Germany is confirmed. If the same person's document were a US passport, residence would still be Germany, but US person status would be a separate attribute that drives US tax reporting and sanctions jurisdiction, so the resolution stores both.

## How to Build It

`legal_entities` and `accounts` in [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model), `entity_registrations` in [Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses#how-to-build-it) and `jurisdiction_permissions` in [Licensing a Crypto Business](/books/investing-and-digital-assets/crypto-licensing#how-to-build-it) say what each entity may do where. Serving customers abroad adds where each customer is, which local rules apply to them, and the passports that extend an entity's reach:

```sql
CREATE TABLE customer_jurisdictions (      -- where a party is, resolved from evidence, over time
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id             UUID NOT NULL REFERENCES parties (id),
  residence            TEXT NOT NULL,         -- 'DE', 'SG', 'US-NY', ...
  us_person            BOOLEAN NOT NULL,
  tax_residences       TEXT[] NOT NULL,
  classification       TEXT NOT NULL CHECK (classification IN ('retail', 'professional',
                         'accredited', 'institutional', 'eligible_counterparty')),
  classification_basis JSONB,                 -- e.g. {"dpt_counted_sgd": 200000, "test": "net_personal_assets"}
  signals              JSONB NOT NULL,        -- address, document, funding, phone, ip: country each
  resolved_by          TEXT NOT NULL,         -- 'rule:v12' or 'reviewer:<id>'
  valid_during         TSTZRANGE NOT NULL,
  EXCLUDE USING gist (party_id WITH =, valid_during WITH &&)
);

CREATE TABLE jurisdiction_rules (          -- local product rules, as data
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction         TEXT NOT NULL,
  applies_to           TEXT NOT NULL,         -- a classification, or 'all'
  rule_key             TEXT NOT NULL,         -- 'pfof_prohibited', 'retail_incentives_banned',
                                              -- 'card_funding_banned', 'cold_storage_min_pct',
                                              -- 'retail_staking_banned', 'risk_assessment_required'
  value                JSONB NOT NULL,        -- true, or {"min_pct": 90}
  authority            TEXT NOT NULL,         -- 'MiFIR Art. 39a', 'MAS PS-G03 para 4.3.2'
  valid_during         TSTZRANGE NOT NULL,
  UNIQUE (jurisdiction, applies_to, rule_key, valid_during)
);

CREATE TABLE passporting_notifications (   -- an entity's reach into a host state
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  regime               TEXT NOT NULL CHECK (regime IN ('mica', 'mifid')),
  home_state           TEXT NOT NULL,
  host_state           TEXT NOT NULL,
  services             TEXT[] NOT NULL,       -- MiCA letters, or MiFID services
  submitted_at         TIMESTAMPTZ NOT NULL,
  confirmed_at         TIMESTAMPTZ,           -- the home authority's confirmation
  may_start_at         TIMESTAMPTZ NOT NULL,  -- MiCA: confirmation, or the 15th calendar day
  status               TEXT NOT NULL CHECK (status IN ('submitted', 'effective',
                         'withdrawn')),
  CHECK (host_state <> home_state)
);
```

`may_start_at` for a MiCA passport is computed on submission as the 15th calendar day after it and moved earlier if the confirmation arrives first; the permission rebuild described in Licensing a Crypto Business turns each effective notification into `jurisdiction_permissions` rows with `basis = 'passport'`. Every product decision then joins three things: the customer's current `customer_jurisdictions` row, the serving entity's permission for that jurisdiction and activity, and the `jurisdiction_rules` for that jurisdiction and classification. A Singapore retail customer opening the referral screen finds `retail_incentives_banned` and sees no offer; an EU retail order finds `pfof_prohibited` and routes on a table with no PFOF venues.

Design notes:

- **Resolution is a decision with a record.** Store the signals, the rule version and the result; a regulator asking why a customer was served from a given entity gets the record ([The Decision Record](/docs/building-blocks/risk-scoring#the-decision-record)).
- **Rules carry authority and dates,** so the end of the EU PFOF opt-out on June 30, 2026 and the UK regime's start on October 25, 2027 are rows, not releases ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Data residency follows the entity.** Records of an EU CASP's customers are that entity's records, under its retention and privacy regime ([GDPR](/docs/compliance/gdpr)); a shared global ledger still tags every row with the entity that owns it.

## Auditing

- **For every customer,** the jurisdiction resolution history, the signals behind each, and the entity that served each product on each date.
- **Every local rule applied,** with its authority, and every product decision that a rule changed (an offer not shown, a funding method refused, an order routed differently).
- **Passports:** notifications, confirmations and the first date each host state was served, which must not precede `may_start_at`.
- **Moves:** customers whose residence changed, and how each account was migrated or closed.

## What This Means for the System You Build

- **Resolve residence from evidence,** store it with a history, and never let an IP alone decide which regime applies.
- **Serve each customer from one entity per product,** chosen by residence and permissions, with migrations as projects.
- **Model local rules as data** keyed by jurisdiction and classification, with authorities and dates.
- **Expect the EU's PFOF ban, MiCA's register and the UK's 2027 regime** to shape revenue and products, not just compliance.
- **Read the registers:** VARA, the SFC's list, Japan's FSA list and ESMA's register say who is licensed today, and their dates are product launch dates.

## References

**Law and regulation**

- [ESMA Interactive Single Rulebook: MiFIR Article 39a](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mifir/article-39a-prohibition-receiving-payment), the PFOF prohibition, the venue rebate exception and the opt-out to June 30, 2026
- [MAS: Guidelines on Consumer Protection Measures by Digital Payment Token Service Providers (PS-G03)](https://www.mas.gov.sg/-/media/mas-media-library/regulation/guidelines/pso/ps-g03-guidelines-on-consumer-protection-measures-by-digital-payment-token-service-providers/guidelines-on-provision-of-consumer-protection-safeguards-by-digital-payment-token-service-providers.pdf), effective dates, the 90% cold wallet share, resident controllers, no use of retail assets, the Risk Awareness Assessment, the incentive and credit bans, the market and broker separation and the accredited investor haircut
- [VARA: Virtual Assets and Related Activities Regulations 2023](https://rulebooks.vara.ae/rulebook/virtual-assets-and-related-activities-regulations-2023), the regulations and the current version's effective date
- [VARA: Schedule 1, VA Activities](https://rulebooks.vara.ae/rulebook/schedule-1-va-activities), the eight licensed activity categories

**Regulators and guidance**

- [CSA Staff Notice 21-332: Crypto Asset Trading Platforms: Pre-Registration Undertakings (February 22, 2023), via the BCSC](https://www.bcsc.bc.ca/-/media/PWS/New-Resources/Securities-Law/Instruments-and-Policies/Policy-2/21332-CSA-Staff-Notice-February-22-2023.pdf), the enhanced undertaking's commitments, the restricted and investment dealer categories, and the conditions for consenting to fiat-backed value-referenced crypto assets
- [FCA: Dear CEO letter, Payment for Order Flow (December 13, 2017)](https://www.fca.org.uk/publication/correspondence/dear-ceo-letter-payment-for-order-flow.pdf), PFOF as a breach of the MiFID II standards and the anti-avoidance examples
- [FCA: Payment for order flow multi-firm review findings (April 23, 2019)](https://www.fca.org.uk/publications/multi-firm-reviews/payment-for-order-flow-multi-firm-review-findings), firms largely stopped charging for exclusive liquidity; some routed orders to overseas affiliates that charged PFOF
- [ESMA: Markets in Crypto-Assets Regulation](https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica), the interim register, the non-compliant entities file and its update date
- [ESMA: Interim MiCA register of CASPs](https://www.esma.europa.eu/sites/default/files/2024-12/CASPS.csv), the EU entities, dates and service letters in How the Platforms Do It
- [FCA: Cryptoasset regime policy statements (June 30, 2026)](https://www.fca.org.uk/publications/policy-statements/cryptoasset-regime), PS26/9 to PS26/13, the regulated activities, the application window, go-live, MLR registrations and product rules
- [FCA: PS23/6 Financial promotion rules for cryptoassets](https://www.fca.org.uk/publications/policy-statements/ps23-6-financial-promotion-rules-cryptoassets), risk warnings, the incentive ban, positive frictions, categorisation and appropriateness
- [MAS: Clarification of regulatory regime for digital token service providers (June 6, 2025)](https://www.mas.gov.sg/news/media-releases/2025/mas-clarifies-regulatory-regime-for-digital-token-service-providers), the June 30, 2025 regime for overseas-only firms
- [SFC: Lists of virtual asset trading platforms (updated October 16, 2026)](https://www.sfc.hk/en/Welcome-to-the-Fintech-Contact-Point/Virtual-assets/Virtual-asset-trading-platforms-operators/Lists-of-virtual-asset-trading-platforms), the licensed platforms and dates, applicants and closures
- [HKMA: Stablecoin issuers](https://www.hkma.gov.hk/eng/key-functions/international-financial-centre/stablecoin-issuers/), the Stablecoins Ordinance regime from August 1, 2025
- [HKMA: Register of licensed stablecoin issuers](https://www.hkma.gov.hk/eng/regulatory-resources/registers/register-of-licensed-stablecoin-issuers/), the two licensees
- [HKMA: Press release (April 10, 2026)](https://www.hkma.gov.hk/eng/news-and-media/press-releases/2026/04/20260410-4/), the first licenses' effective date
- [VARA: Public register](https://www.vara.ae/en/licenses-and-register/public-register/), the 60 licensed firms, their activities and the latest license date
- [Japan FSA: Registered crypto-asset exchange service providers (as of September 30, 2026)](https://www.fsa.go.jp/en/regulated/licensed/en_kasoutuka.pdf), the 27 registrants, bureaus and registration dates
