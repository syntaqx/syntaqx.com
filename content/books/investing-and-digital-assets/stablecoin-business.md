+++
title = "The Stablecoin Business"
description = "How stablecoin issuers earn on the reserve and pay distributors for it: Circle, Coinbase and Tether from filings, rate sensitivity, and why everyone wants one."
category = "Investing & Digital Assets Industry"
order = 2557
part = "Stablecoins"
tags = ["stablecoins", "circle", "tether", "reserve-income", "distribution", "business-models"]
+++

A fiat-backed stablecoin issuer runs one of the simplest business models in finance and one of the hardest to keep. A customer hands it a dollar, it hands back a token, and it invests the dollar in Treasury bills, overnight repo and bank deposits while the token circulates. It pays the holder nothing, and once the GENIUS Act takes effect a US permitted issuer may not. Its revenue is the yield on the float, so it is a bet on two numbers, the size of the float and the short-term interest rate, and the issuer controls neither. The size of the float depends on where tokens are held and used, which is decided by exchanges, wallets, payment companies and trading venues, and those distributors have learned to charge for it. The result, read from the filings, is an issuer that earns billions and keeps a minority of it.

This chapter is the economics: how reserve income is earned and measured, what Circle pays Coinbase, Binance and others and why, how Tether's numbers differ, who issues the rest of the supply, how sensitive each model is to a rate cut, and why banks, fintechs and exchanges all want a coin of their own. The mechanics of minting, the reserve and redemption are in [Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin), the law in [Stablecoin Law](/books/investing-and-digital-assets/stablecoin-law), and moving money with a stablecoin as a payment rail is the Payments volume's [Stablecoins & Crypto Rails](/books/payments/stablecoins). The foundation's overview of the same money is [Reserve Income](/books/investing-and-digital-assets/investing-business#reserve-income), and how it sits beside a broker's and an exchange's other revenue is [Reserve Income and Distribution Payments](/books/investing-and-digital-assets/revenue-models#reserve-income-and-distribution-payments).

## How the Platforms Do It

The largest dollar stablecoins and how each issuer is set up, as of November 2026. Circulation is DefiLlama's cross-issuer figure on November 5, 2026, which differs from issuers' own numbers (Tether reports about $183.5 billion issued at September 30, Circle $73.9 billion of USDC); I use DefiLlama for comparisons across issuers and each issuer's filing for its own economics.

| Token | Issuer | Circulating (DefiLlama, Nov 5, 2026) | Backing | How it reaches holders |
| --- | --- | --- | --- | --- |
| **USDT** | Tether | $177.5B | Treasury bills ($132.4B direct and indirect at September 30, 2026), repo and other assets; BDO attestation | Exchanges; direct mint and redemption for verified customers at a $100,000 minimum |
| **USDC** | Circle | $70.8B | About 88% in the Circle Reserve Fund, a BlackRock-managed government money market fund, the rest cash at large banks (December 31, 2025) | Circle Mint for institutions; Coinbase and Binance under paid distribution agreements |
| **USDS** and **DAI** | Sky (formerly MakerDAO) | $6.5B and $4.7B | Crypto collateral in vaults and other assets; DAI and USDS convert one to one | Protocol, not a company issuer; covered in [Depegs, Runs & Synthetic Dollars](/books/investing-and-digital-assets/depegs-and-synthetic-dollars) |
| **USDe** | Ethena | $4.6B | Crypto and other assets hedged with short futures (a synthetic dollar, not a reserve-backed one) | Whitelisted minters; everyone else on exchanges and pools |
| **USD1** | World Liberty Financial | $3.7B | "U.S. cash, U.S. government money market funds, and other cash equivalents"; monthly reserve reports | Through partners and protocols; minting by arrangement with World Liberty Financial; redeemable one to one for dollars |
| **USDG** | Paxos (Global Dollar Network) | $2.7B | Dollar reserves; issued by Paxos Digital Singapore (MAS) and Paxos Issuance Europe (Finland, MiCA) | Network members, offered up to 100% of the reserve returns on USDG held on their platforms |
| **PYUSD** | Paxos for PayPal | $2.7B | "Fully backed by US dollar reserves and cash equivalents" | PayPal and Venmo, which pay holders a variable reward |
| **RLUSD** | Ripple | $2.6B | Cash deposits, Treasuries and government money market funds; BNY primary reserve custodian; monthly attestations | Issued through an NYDFS limited purpose trust company; redeemable at par |

Three patterns run through the table. **Two issuers hold most of the market:** USDT and USDC together are about $248 billion of the roughly $276 billion across the nine tokens above. **The newer coins are distribution deals with an issuer behind them:** PayPal's coin is issued by Paxos, USDG is Paxos's coin shared with its network, and Tether's US token USAT, launched January 27, 2026, is issued by Anchorage Digital Bank, N.A. with Cantor Fitzgerald as reserve custodian. **The token that isn't reserve-backed is a different product:** USDe and DAI earn and fail for different reasons, and the last chapter of this part treats them separately.

## How Reserve Income Is Earned

An issuer's balance sheet is two lines that must match. On the liability side, the tokens outstanding: Circle reports them as "deposits from stablecoin holders," $74,912.6 million at December 31, 2025. On the asset side, the reserve: "cash and cash equivalents segregated for the benefit of stablecoin holders," $75,067.9 million on the same date. The small excess is the issuer's own money. Every dollar of the reserve earns the short rate, and every dollar of the liability costs nothing, so the issuer's gross revenue is the reserve's yield.

Circle measures this with a **reserve return rate**: reserve income divided by the simple daily average balance of reserves segregated for holders. For 2025 the numbers were:

| Circle, 2025 (10-K) | 2025 | 2024 |
| --- | --- | --- |
| Total revenue and reserve income | $2,746.6M | $1,676.3M |
| Reserve income | $2,636.8M | $1,661.1M |
| Other revenue | $109.8M | $15.2M |
| Average USDC in circulation | $64,870M | $33,342M |
| Reserve return rate | 4.1% | 5.0% |
| USDC minted / redeemed | $257,465M / $226,056M | $141,342M / $121,897M |
| USDC in circulation at year end | $75,266M | $43,857M |
| Stablecoin market share at year end | 28% | 24% |

Reserve income was 96.0% of Circle's revenue in 2025, 99.1% in 2024 and 98.6% in 2023. Circle's market share is its own definition: USDC's share of dollar fiat-backed stablecoins with more than $100 million in circulation, from CoinMarketCap.

Two features of the line matter for anyone building on it. **Gross flows don't earn; the float does.** Circle minted $257.5 billion of USDC in 2025 and redeemed $226.1 billion, and minting is free at Circle Mint, so those flows cost operations and earn nothing directly; only the $31.4 billion net increase, and the average balance it produced, earned yield. **The rate is not the issuer's choice.** A government money market fund and overnight repo reprice within days of a Federal Reserve move, so reserve income follows the policy rate with almost no lag. Circle attributed part of 2025's change to "a 90 basis point decline in the average yields reflecting interest rate actions undertaken by the U.S. Federal Reserve," associated with about $442.1 million less reserve income, and its 10-K says plainly that "we are unable to accurately predict the impact of changes in interest rates on our results of operations."

## Distribution Costs

The issuer doesn't keep the yield. Circle's 2025 distribution and transaction costs were $1,661.5 million against $2,636.8 million of reserve income, 63% of it, and Coinbase alone received about $1.4 billion (2024: $924.5 million). Circle's measure of what's left is **RLDC**, revenue less distribution costs: total revenue and reserve income minus distribution, transaction and other costs. It was $1,083 million in 2025 and $659 million in 2024, a 39% margin both years.

### The Coinbase Agreement

The arrangement behind the largest line is described in Circle's 10-K. Circle and Coinbase co-founded the Centre Consortium in 2018; the updated collaboration agreement of August 2023 gave Circle "sole governance of our stablecoin network," left Coinbase with a minority equity stake in Circle, and set the payments:

- **The base is net reserve income,** computed daily, after certain third-party reserve management fees and expenses.
- **Circle takes an issuer portion first.**
- **Each party then receives the income on USDC held on its own platform.** USDC in a Coinbase account earns for Coinbase; USDC in a Circle Mint account earns for Circle.
- **Coinbase receives half of the remaining income** from USDC in the broader ecosystem (every wallet, exchange and contract that is neither platform), after amounts paid to approved third parties under Circle's Stablecoin Ecosystem Agreement.
- **The term is three years, renewing automatically for three-year terms** unless a party fails its obligations; Circle may reduce certain monthly payments if the parties can't agree on renewal and Coinbase, after a cure period, fails to provide specified USDC support.

The 10-K does not disclose the size of the issuer portion. What it shows is the shape: a distributor is paid for balances it holds and, uniquely here, for a share of balances nobody holds on a platform. Coinbase reports the other side as stablecoin revenue: $306.9 million in the third quarter of 2026 and $904.5 million for the first nine months, and its 10-Q says "There is no change to the Company's arrangement with Circle Internet Financial, LLC or the revenue generated."

### Binance and the Ecosystem Agreement

Binance was the first approved participant under the Stablecoin Ecosystem Agreement. In November 2024 Circle paid it a one-time upfront fee of $60.3 million, agreed monthly incentive fees on USDC balances on Binance's platform and in its treasury, subject to minimum balance requirements, and Binance agreed to hold part of its corporate treasury in USDC for a two-year term. An expanded agreement in August 2025 pays monthly incentive fees on USDC held through Circle's Modular Smart Contract Wallet services, runs four years with a one-year tail if not extended, and supersedes the non-treasury portion of the November 2024 agreement. Circle's third-quarter 2026 release reports that Binance announced a $100 million equity investment in Circle and a renewed and expanded partnership to promote USDC, with an emphasis on emerging markets. The 10-K describes distribution as concentrated in "a few key distributors" with many smaller ones.

### The Same Idea at Paxos

Paxos's Global Dollar Network makes the revenue share the product: partners can receive "up to 100% of the returns generated by assets backing USDG held on your platform," plus incentives for minting and for accepting USDG. PayPal pays its own users a variable reward on PYUSD balances, paid monthly in PYUSD on the average daily balance. Neither pays the holder as issuer; both route the reserve's yield through the distributor, which is why the definition of who may pay a reward, covered below, is the commercial question of the GENIUS era.

### Worked Numbers: Where a Quarter's Yield Went

Circle's third quarter of 2026, from its earnings release, with my arithmetic:

| Line | Q3 2026 |
| --- | --- |
| Average USDC in circulation | $73.3B |
| Reserve return rate | 3.5% |
| Implied reserve income: $73.3B × 3.5% × ¼ | about $641M |
| Reported reserve income | $657.6M |
| Other revenue (of which ARC token presale $182M) | $207.3M |
| Total revenue and reserve income | $864.9M |
| Distribution, transaction and other costs | $411.6M |
| RLDC (reported margin 52%) | $453M |
| RLDC without the presale: $864.9M − $182M − $411.6M | about $271M, a 40% margin on $682.9M |

The reported reserve return rate is rounded, which explains most of the gap between $641 million and $657.6 million. The more important line is the last: the quarter's 52% headline margin includes a one-time token sale; on the recurring business, Circle kept about 40 cents of each revenue dollar after paying distributors, the same order as 2025's 39%. Circle's own full-year 2026 guidance for RLDC margin is 41.7% to 43.7%.

The second worked example is mine: a hypothetical issuer with $10 billion outstanding at a 3.5% reserve return, $2 billion of it held on the issuer's own platform, $3 billion on one distributor's platform, $5 billion in the wider ecosystem, a 10% issuer portion taken first, and a Coinbase-style split on the remainder.

| Step | Amount |
| --- | --- |
| Gross reserve income: $10B × 3.5% | $350.0M |
| Issuer portion: 10% | $35.0M to the issuer |
| Remaining | $315.0M, allocated by where tokens sit |
| Issuer's platform: 20% of $315.0M | $63.0M to the issuer |
| Distributor's platform: 30% of $315.0M | $94.5M to the distributor |
| Ecosystem: 50% of $315.0M, split in half | $78.75M each |
| Issuer keeps | $176.75M (50.5%) before operating costs |
| Distributor receives | $173.25M (49.5%) |

Move $1 billion of tokens from the wider ecosystem onto the distributor's platform and the distributor's take rises by $15.75 million a year at these rates. That is the incentive the agreement creates: a distributor gains by pulling balances onto its own platform, which is why Coinbase pays its own customers rewards on USDC and why "USDC on platform" is a line Circle reports (18.1% of circulation on a daily weighted average in the third quarter of 2026, against 11.1% for 2025).

## Tether's Economics

Tether runs the same model, and its releases report net operating profit without a distribution line of the kind Circle's filings break out. Its attestation as of September 30, 2026, examined by BDO, shows total assets of $191,451,091,374 against liabilities of $183,496,460,904, of which $183,469,787,261 is tokens issued, leaving $7,954,630,470 of excess reserves (up from $4.1 billion at June 30). It reported net operating profit of $1.5 billion for the quarter and $4.5 billion for the first nine months, with Treasury bills and reverse repo providing "most of this income." Treasury bill exposure, direct and indirect, was $132.4 billion.

Three things differ from Circle. **Fees on the flows.** Tether charges a $150 verification fee, 0.1% to acquire tokens, the greater of $1,000 or 0.1% to redeem, and sets a $100,000 minimum for either; Circle Mint charges nothing to mint and nothing for basic redemption. **Assets beyond the GENIUS list.** The attestation's total assets exceed the Treasury exposure by about $59 billion, which the release doesn't break down; USDT is partly backed by bitcoin and gold, which is why its fit with the GENIUS reserve list has been questioned, and the $7.95 billion excess is the cushion that absorbs those assets' price moves. **An attestation, not an audit.** Tether publishes a quarterly attestation of management's assertions at a point in time, and circulation "typically" daily; it is not an audit of financial statements, and GENIUS's audited-statements requirement above $50 billion would apply only to an issuer inside the US regime. Tether's US answer is a separate token: USAT, issued by Anchorage Digital Bank under federal supervision, while Tether says USDT is "progressing towards GENIUS Act compliance."

My arithmetic on the quarter: $1.5 billion of profit on about $183.5 billion issued is about 0.8% for the quarter, or about 3.3% a year, on liabilities that cost nothing. A Treasury bill portfolio of $132.4 billion at a 3.5% yield (my assumption, in line with Circle's reserve return rate for the same quarter) earns about $1.16 billion a quarter by itself.

## Rate Sensitivity

Because the float reprices with the policy rate, the first question an analyst asks of an issuer is what a cut costs. Worked at Circle's third-quarter scale (my arithmetic):

| Scenario | Annual reserve income on $73.3B |
| --- | --- |
| 3.50% | $2,566M |
| 25 basis point cut, to 3.25% | $2,382M (−$183M) |
| 100 basis point cut, to 2.50% | $1,833M (−$733M) |

The distributor shares the loss. Payments under the Coinbase agreement are a share of net reserve income, so a cut shrinks what Coinbase receives in proportion; with about 40% of revenue retained after distribution, Circle's own share of a 25 basis point cut is closer to $73 million than $183 million. What a cut doesn't shrink are operating costs, which Circle guided at $570 million to $585 million of adjusted operating expenses for 2026. An issuer's defenses are the ones visible in the filings: grow the float (Circle's guidance is a 40% multi-year compound growth rate in USDC circulation), earn revenue that isn't the float (Circle's other revenue, guided at $310 million to $330 million for 2026, from subscriptions, services, transactions and the ARC presale), and own more of the distribution.

The rate also cuts the other way. Circle's 10-K notes that yield-bearing alternatives, tokenized money market funds among them, had become increasingly attractive "Particularly in the current high interest rate environment"; at 5% a holder gives up more by holding a non-yielding token, which is exactly when the distributor's reward matters most ([Tokenized Treasuries & Funds](/books/investing-and-digital-assets/tokenized-funds), a later chapter of this volume, covers the alternative).

## Bank-Issued and Fintech-Branded Coins

Every company with balances wants the float. The routes on the record as of November 2026:

- **Brand a coin, rent the issuer.** PayPal's PYUSD is issued by Paxos and backed by dollar deposits and Treasuries; PayPal pays the reward and runs distribution through PayPal and Venmo. A brand gets a token without becoming a permitted issuer, and pays for that with a share of the yield.
- **Join a network.** USDG pays partners up to all of the reserve return on USDG they hold, so an exchange or fintech earns like an issuer without issuing.
- **Get a charter.** On December 12, 2025 the OCC conditionally approved de novo national trust banks for Circle (First National Digital Currency Bank) and Ripple, and conversions to national trust banks for BitGo, Fidelity Digital Assets and Paxos, subject to conditions. Circle's plan, from its 10-K, is for the national trust bank to oversee the USDC reserve and hold a first-priority perfected security interest in it as collateral trustee for holders. Charters are in the Banking & Lending volume's [Trust Banks and Novel Charters](/books/banking-and-lending/charters-and-regulators#trust-banks-and-novel-charters).
- **Issue from the bank.** The GENIUS Act lets a subsidiary of an insured depository institution become a permitted issuer, and a bank can instead issue a tokenized deposit that stays a deposit; the trade-off is in [Depegs, Runs & Synthetic Dollars](/books/investing-and-digital-assets/depegs-and-synthetic-dollars).
- **Build a chain.** Circle launched its own layer 1, Arc, on September 16, 2026, with a genesis mint of 10 billion ARC tokens and a planned move to proof of stake in 2027; the $182 million presale is in the third-quarter numbers above.

Why everyone wants one is the arithmetic above. A platform holding $3 billion of a partner's stablecoin earns the distributor's share of the yield; a platform that issues its own earns all of it, less the reserve manager's fee, and keeps the customer relationship and the data. The costs are the ones the next two chapters describe: a reserve held to the statute's list, monthly examined reports, redemption at par in two business days, capital and an operational backstop, a BSA program and freeze capability, and in the US a license from a federal or certified state regulator. Distribution is the moat, which is why a new coin's launch press release usually names its exchanges before its reserve custodian.

## Rewards and the Yield Line

The statute draws the line at the issuer: no permitted or foreign issuer "shall pay the holder of any payment stablecoin any form of interest or yield (whether in cash, tokens, or other consideration) solely in connection with the holding, use, or retention" of the coin (12 U.S.C. 5903(a)(11)). It says nothing directly about a distributor paying its own customers out of what the issuer pays the distributor, and that gap is the business model of the Coinbase agreement, the Global Dollar Network and PayPal's reward.

Where the gap stands as of November 2026 is in [Stablecoin Interest and the Rewards Debate](/books/investing-and-digital-assets/cash-and-sweeps#stablecoin-interest-and-the-rewards-debate): the OCC's final rule (91 FR 67000, effective January 18, 2027) dropped its proposed presumption that an affiliate's or related third party's payments are the issuer's yield while keeping anti-evasion authority, and the CLARITY Act's Senate compromise on activity-based rewards stalled with the bill. MiCA's answer is broader: neither an e-money token issuer nor a crypto-asset service provider may grant interest, and time-based benefits count as interest ([The EU and the UK](/books/payments/stablecoins#the-eu-and-the-uk)).

That chapter covers the reward as a customer product; this one's point is the revenue line under it. My rule for a distributor: model a reward as a cost funded by a revenue share, keep the two contracts and their accruals separate, and assume the share can be renegotiated or regulated away within one agreement term.

## How to Build It

These extend [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model). An issuer and a distributor need the same three records from opposite sides: the agreement, the daily accrual of reserve income that the agreement divides, and each payment it produces. A coin is an `instruments` row (`instrument_type = 'stablecoin'`), and the issuer is a `legal_entities` row of kind `stablecoin_issuer`; the reserve's holdings belong to the next chapter.

```sql
CREATE TABLE distribution_agreements (       -- a revenue share between issuer and distributor
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  issuer_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  instrument_id        UUID NOT NULL REFERENCES instruments (id),   -- the coin
  counterparty         TEXT NOT NULL,         -- the distributor, or the issuer if we distribute
  our_role             TEXT NOT NULL CHECK (our_role IN ('issuer', 'distributor')),
  kind                 TEXT NOT NULL CHECK (kind IN ('revenue_share', 'balance_incentive',
                         'upfront_fee', 'network_membership')),
  payment_base         TEXT NOT NULL CHECK (payment_base IN ('net_reserve_income',
                         'on_platform_balance', 'fixed')),
  terms                JSONB NOT NULL,        -- issuer portion, splits, minimum balances, rates
  version              INT NOT NULL CHECK (version > 0),
  valid_during         DATERANGE NOT NULL,
  renewal              TEXT,                  -- 'auto_3y', 'manual', ...
  document_ref         TEXT NOT NULL,         -- the signed agreement
  UNIQUE (issuer_entity_id, counterparty, instrument_id, version)
);

CREATE TABLE reserve_income_accruals (       -- one row per coin per day
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  issuer_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  instrument_id        UUID NOT NULL REFERENCES instruments (id),
  business_date        DATE NOT NULL,
  average_reserve      BIGINT NOT NULL,       -- minor units of the reserve currency
  gross_income         BIGINT NOT NULL,       -- accrued yield on the reserve that day
  manager_fees         BIGINT NOT NULL DEFAULT 0,  -- third-party reserve management fees
  net_income           BIGINT NOT NULL,       -- the payment base most agreements use
  outstanding_total    NUMERIC(78, 0) NOT NULL,     -- tokens outstanding, smallest units
  balances_by_location JSONB NOT NULL,        -- {issuer_platform, distributor:<id>, ecosystem}
  source_ref           TEXT NOT NULL,         -- the fund statement or custodian report
  journal_entry_id     UUID REFERENCES journal_entries (id),
  UNIQUE (issuer_entity_id, instrument_id, business_date),
  CHECK (net_income = gross_income - manager_fees)
);

CREATE TABLE distribution_payments (         -- what each agreement produced for a period
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  agreement_id         UUID NOT NULL REFERENCES distribution_agreements (id),
  agreement_version    INT NOT NULL,
  period               DATERANGE NOT NULL,
  base_amount          BIGINT NOT NULL,       -- sum of the accruals' payment base for the period
  computed_amount      BIGINT NOT NULL,       -- what the terms produce
  adjustments          BIGINT NOT NULL DEFAULT 0,  -- minimum-balance shortfalls, true-ups
  amount_due           BIGINT NOT NULL,
  calculation          JSONB NOT NULL,        -- every input and intermediate, for the counterparty
  status               TEXT NOT NULL CHECK (status IN ('computed', 'agreed', 'disputed', 'paid')),
  journal_entry_id     UUID REFERENCES journal_entries (id),
  paid_at              TIMESTAMPTZ,
  UNIQUE (agreement_id, period),
  CHECK (amount_due = computed_amount + adjustments)
);
```

Design notes:

- **Accrue daily, settle monthly.** The Coinbase agreement's base is computed daily, and balances move by billions in a day, so the accrual is per day and per location; a monthly payment that multiplies an average balance by an average rate will not reconcile with a counterparty doing it daily.
- **Location is a measured input, not a guess.** "On platform" means tokens in the distributor's custody, which only the distributor can attest to; an issuer computes ecosystem balances as total outstanding minus known platform balances. Store the balances snapshot used, with its source, on every accrual, because the split is what gets disputed.
- **Versioned terms.** A renegotiation is a new `distribution_agreements` version effective from a date; a payment names the version it used, as fees name their schedule version in the foundation's `fee_schedules`.
- **Book it as the filings do.** Reserve income is revenue; distribution payments are a cost, not a reduction of revenue, which is how Circle presents RLDC. On the distributor's side the receipt is revenue and any reward paid to customers is its own expense line, posted through `journal_lines` ([Accounting](/docs/money/accounting)).
- **The rate is an input with a source.** The accrual's gross income comes from the fund's or custodian's statement, not from a rate the system assumes, so a rate cut shows up the day the fund's yield changes.

## Auditing

- **Every agreement and version,** signed, with the date each took effect and the renewal terms, because a counterparty, an auditor and, under the GENIUS Act's audited statements for issuers above $50 billion, related-party disclosure all ask for them.
- **Daily accruals tied to statements:** reserve income per day matched to the reserve fund's and banks' statements, with the balances-by-location snapshot each day used.
- **Every payment's calculation,** reproducible from stored inputs, with any dispute and its resolution.
- **Reported metrics from the same records:** average circulation, reserve return rate, on-platform share and RLDC computed by queries over these tables, so the numbers in an earnings release can be re-run ([Investing & Digital Assets Metrics](/books/investing-and-digital-assets/investing-metrics) defines each).

## What This Means for the System You Build

- **Reserve income is float times rate,** both outside the issuer's control; model both as inputs from statements, daily.
- **Distribution is the largest cost,** 63% of Circle's 2025 reserve income; build the agreement, the accrual and the payment as first-class records.
- **Where tokens sit is money.** Balances by location (issuer platform, each distributor, ecosystem) drive every revenue share; measure and store them per day.
- **Separate the reward from the revenue share.** A distributor's customer reward is funded by, but legally and contractually distinct from, what the issuer pays it, and the line between them is still being regulated.
- **Stress the rate.** Every plan should show reserve income, distribution payments and net income at the current rate and at 25 and 100 basis points lower.
- **Recurring versus one-time.** Keep token sales and other one-time revenue out of the margin a business is managed on, as the third-quarter 2026 numbers show.

## References

**Law and regulation**

- [12 U.S.C. 5903: Requirements for issuing payment stablecoins](https://www.law.cornell.edu/uscode/text/12/5903), the prohibition on issuer interest or yield in (a)(11) and audited annual statements above $50 billion in (a)(10)
- [OCC: Implementing the GENIUS Act (91 FR 67000, October 23, 2026)](https://www.federalregister.gov/api/v1/documents/2026-21706.json), the final rule's citation, docket OCC-2025-0372 and January 18, 2027 effective date

**Regulators and guidance**

- [OCC: Conditional approvals for five national trust banks (December 12, 2025)](https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-125.html), First National Digital Currency Bank and Ripple National Trust Bank, and the BitGo, Fidelity Digital Assets and Paxos conversions

**Filings**

- [Circle Internet Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000062/crcl-20251231.htm), revenue, reserve income, the reserve return rate, distribution and transaction costs, Coinbase payments, RLDC, USDC flows and market share, the Coinbase and Binance agreements, reserve composition, the 90 basis point yield decline, yield-bearing alternatives and the trust charter plan
- [Circle Internet Group: Third quarter 2026 results (November 4, 2026)](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000309/finalq3epr-110326.htm), reserve income, the 3.5% reserve return rate, other revenue and the ARC presale, distribution costs, RLDC, USDC on platform, guidance, Arc and the Binance investment
- [Coinbase Global: Form 10-Q for the third quarter of 2026](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000122/coin-20260930.htm), stablecoin revenue for the quarter and nine months and the unchanged Circle arrangement

**Vendor documentation**

- [Tether: Q3 2026 attestation release (October 30, 2026)](https://tether.io/news/tether-generates-1-5-billion-in-q3-net-operating-profit-as-reserve-buffer-doubles-to-almost-8-billion/), assets, liabilities, tokens issued, excess reserves, Treasury bill exposure, net operating profit and BDO
- [Tether: Fees](https://tether.to/en/fees/), the verification fee, 0.1% acquisition fee, redemption fee and $100,000 minimum
- [Tether: Transparency](https://tether.to/en/transparency/), circulation typically published daily
- [Circle: Transparency and stability](https://www.circle.com/transparency), the Circle Reserve Fund, weekly holdings disclosure and monthly Big Four assurance
- [Global Dollar Network](https://www.globaldollar.com/), USDG's issuing entities and partner returns of up to 100% of reserve returns on platform balances
- [PayPal: PayPal USD (PYUSD)](https://www.paypal.com/us/digital-wallet/manage-money/crypto/pyusd), Paxos as issuer, backing and the variable reward paid monthly on the average daily balance
- [Ripple: RLUSD](https://ripple.com/solutions/stablecoin/), the NYDFS trust company, reserve assets, BNY as custodian and monthly attestations
- [World Liberty Financial: USD1](https://worldlibertyfinancial.com/usd1), USD1's reserve assets, monthly reserve reports, minting through World Liberty Financial and one-to-one redemption

**In practice**

- [Mayer Brown: OCC finalizes GENIUS Act rulemaking](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking), the affiliate and related-third-party yield presumption not finalized and anti-evasion authority kept
- [Baker McKenzie: The CLARITY Act's yield compromise](https://blockchain.bakermckenzie.com/2026/05/05/the-clarity-acts-yield-compromise-what-the-senate-actually-agreed-to-and-why-it-matters/), the May 1, 2026 Tillis-Alsobrooks language on deposit-equivalent rewards and activity-based rewards
- [DefiLlama: Stablecoins](https://stablecoins.llama.fi/stablecoins?includePrices=false), circulating supply by token on November 5, 2026
- [Decrypt: Tether launches USAT issued by Anchorage Digital (January 27, 2026)](https://decrypt.co/356045/tether-launches-us-regulated-stablecoin-issued-anchorage-digital), the issuer, Cantor Fitzgerald as custodian, Tether's statement on USDT and GENIUS, and the questions about USDT's partial bitcoin and gold backing
