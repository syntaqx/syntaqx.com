+++
title = "Depegs, Runs & Synthetic Dollars"
nav_title = "Depegs & Runs"
description = "Why stablecoins break: USDC at SVB, Terra's UST, crypto-backed DAI and USDS, Ethena's USDe, tokenized deposits, run dynamics and what the rules prevent."
category = "Investing & Digital Assets Industry"
order = 2561
part = "Stablecoins"
tags = ["stablecoins", "depegs", "runs", "dai", "ethena", "tokenized-deposits"]
+++

A stablecoin is worth a dollar for as long as enough people believe they can turn it into one. For a fiat-backed coin that belief rests on the reserve and the redemption window; for a crypto-collateralized coin, on collateral worth more than the debt and liquidations that work in a crash; for a synthetic dollar, on a hedge that holds and funding that stays positive; for an algorithmic coin, on nothing but a market for its sister token. When the belief slips, the price on exchanges falls below a dollar, holders who can redeem do so first, and those who can't sell to them at a discount. That is a run, and stablecoins have had all three kinds: a reserve run on USDC in March 2023 that ended in two days because the reserve was whole, a design run on Terra's UST in May 2022 that ended in zero because it never had one, and a venue dislocation in October 2025 when Ethena's USDe traded at about 65 cents on one exchange while holding its value everywhere else.

This chapter is how each design holds its peg, how each has broken, what a run looks like in the numbers, how tokenized deposits differ from stablecoins, and which rules in the GENIUS Act and the OCC's rule answer which failure. The reserve and redemption machinery is in [Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin), the rules themselves in [Stablecoin Law](/books/investing-and-digital-assets/stablecoin-law), and bank runs in general, including Silicon Valley Bank's, in the Banking & Lending volume's [When Banks Fail](/books/banking-and-lending/bank-failures).

## How the Platforms Do It

The ways a token holds a dollar, with the main examples as of November 2026 (circulation from DefiLlama on November 5, 2026):

| Design | Example | What backs a token | What restores the peg | How it breaks |
| --- | --- | --- | --- | --- |
| **Fiat-backed** | USDC ($70.8B), USDT ($177.5B), PYUSD, RLUSD | Cash, Treasury bills, repo, government money market funds at custodians | Onboarded institutions redeem at par and arbitrage the exchange price | A reserve asset becomes unavailable or worth less than par; redemption stops |
| **Crypto-collateralized** | DAI ($4.7B) and USDS ($6.5B), Sky | Over-collateralized vaults of crypto and other assets; a peg stability module holding other stablecoins | Liquidations of under-collateralized vaults; one-to-one swaps with USDC in the stability module | Collateral falls faster than liquidations can clear; the backing stablecoin itself depegs |
| **Synthetic (delta-neutral)** | USDe ($4.6B), Ethena | Crypto and other assets paired with short perpetual futures of the same size, plus stablecoins and tokenized bills | Whitelisted minters redeem with Ethena; a reserve fund covers negative revenue | Funding turns negative for long; an exchange holding the hedge fails; a venue misprices it |
| **Algorithmic** | UST (Terra), collapsed May 2022 | A promise to swap for $1 of a sister token (LUNA) the protocol mints | Arbitrage burns the coin and mints the sister token | The sister token's value falls with the coin's, in a loop |
| **Tokenized deposit** | JPM Coin (JPMD), JPMorgan Kinexys | A deposit at the bank, on the bank's balance sheet | It is a deposit: redeemed like one, insured like one | The bank fails, as any bank can |

Fiat-backed coins are what the GENIUS Act regulates as payment stablecoins. The others are either outside it (DAI, USDS and USDe have no issuer of the kind the statute licenses) or not stablecoins in law at all (a tokenized deposit is a deposit).

## Run Dynamics

Federal Reserve Governor Michael Barr put the mechanism plainly in October 2025: "Stablecoins will only be stable if they can be reliably and promptly redeemed at par in a range of conditions," and a promise of "redemption on demand, at par, and backed by noncash assets" makes them "susceptible to runs similar to fragile banks or money market funds." A New York Fed staff study of stablecoin runs in 2022 and 2023 (Anadu and others, Staff Report 1073) found that "Like MMFs, stablecoins suffer from 'flight-to-safety' dynamics" and estimated a "break-the-buck" threshold at $1: below it, redemptions accelerate.

Three features make a stablecoin run faster than a bank run:

- **The price is public and continuous.** A bank deposit has no market price; a stablecoin trades on dozens of exchanges every second, so a doubt shows up as a number on every screen at once.
- **Redemption is wholesale.** Only onboarded institutions can redeem with the issuer, and they do it on banking days. Everyone else can only sell, and when redemption pauses (a weekend, a bank failure), the selling has no floor.
- **No lender of last resort.** A bank in a run can borrow from the Federal Reserve against its assets; an issuer has only its reserve. The reserve's quality and liquidity are the whole defense, which is why the statute specifies it to the asset.

### Worked Numbers: A Run Against a Reserve

My illustration, the $10 billion issuer from the reserve ladder in [Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin#worked-numbers-a-reserve-ladder-under-the-occ-rule), with $500 million in deposits, $1.5 billion of overnight repo, $4 billion in a government money market fund and $4.01 billion of bills. Two cases.

**Reserve whole, run on rumor.** Requests of $1 billion on day 1, $2 billion on day 2 and $1.5 billion on day 3, 45% of supply in three days. Day 1 is paid from deposits and repo; day 2 from the rest of the repo and $1 billion of fund redemptions; day 3 from $1.5 billion more of the fund. Every request is met within two business days without selling a bill, and the 10% notice goes to the OCC on day 1. On exchanges the token trades slightly under a dollar while arbitrageurs buy cheap and redeem at par, and the discount closes as each redemption pays. The run ends when it becomes clear redemptions are being paid.

**Reserve impaired.** Suppose instead the issuer had kept $800 million of its cash at one bank that fails on a Friday, 8% of the reserve, and redemption pauses because that cash is unavailable. On exchanges, the question becomes what the remaining reserve is worth per token: $9.21 billion against $10 billion outstanding is 92.1 cents if the bank deposits are lost entirely, more if they're recovered in part. The token trades toward the market's estimate of recovery, and the first holders to redeem when the window reopens are paid in full at the expense of the last. That is the case the OCC's 40% single-counterparty cap and 5% floor spread across banks address, and it is what happened to USDC.

## USDC at Silicon Valley Bank

On Friday, March 10, 2023, Silicon Valley Bank was closed and the FDIC appointed receiver. Circle held $3.3 billion of USDC's reserve as a deposit there, about 8% of the total, and its 10-K later noted that more than $3 billion of transfers from SVB had failed to settle before the receivership. With redemptions dependent on banks that weren't open until Monday and part of the reserve now a claim on a failed bank, USDC traded as low as 87 cents on Kraken at 07:16 UTC on Saturday, March 11, according to CoinDesk's report that day, which also noted that MakerDAO's DAI depegged.

On Sunday, March 12, the Treasury, the Federal Reserve and the FDIC invoked the systemic risk exception to protect all of SVB's depositors ([The Least-Cost Test and the Systemic Risk Exception](/books/banking-and-lending/bank-failures#the-least-cost-test-and-the-systemic-risk-exception)). Circle announced that "The $3.3B USDC reserve deposit held at Silicon Valley Bank, about 8% of the USDC total reserve, will be fully available when U.S. banks open tomorrow morning," that "No USDC cash reserves were held at Signature Bank," and that as of March 11 the reserve was "collateralized 77% ($32.4B) with short-dated U.S. Treasury Bills" with "The cash portion of the USDC reserve, 23% ($9.7B), is now held primarily at BNY Mellon." The peg returned with the bank deposits.

What the weekend showed, in engineering terms:

- **The weak asset was the cash, not the bills.** Uninsured bank deposits are an unsecured claim on one bank; Treasuries held in custody are not. Circle's subsequent move to a government money market fund custodied at BNY and cash at a handful of the largest banks, and the OCC's 40% counterparty cap and stress testing, are answers to this exact exposure.
- **Weekends are when it breaks.** The chain trades 24/7; banks wire on banking days. A reserve problem discovered on Friday night has two days of public price discovery before any redemption can pay.
- **Contagion travels through collateral.** DAI depegged alongside USDC; a coin whose stability module swaps one to one with another stablecoin, as Sky's does with USDC today, inherits that coin's failures.
- **Disclosure stops the run.** Circle's Sunday statement, giving the size of the exposure and the composition of the rest, is what a holder needed to price the token; an issuer should be able to produce that statement from its records in an hour ([Attestations and Reports](/books/investing-and-digital-assets/issuing-a-stablecoin#attestations-and-reports)).

## Terra's UST

UST was an algorithmic stablecoin on the Terra blockchain, and the SEC's complaint against Terraform Labs describes the mechanism: "holders of LUNA could swap $1.00 worth of LUNA for 1 UST based on LUNA's then-current market price. And holders of UST could likewise exchange 1 UST for $1.00 worth of LUNA." If UST fell below a dollar, "traders could buy UST at that price and exchange it for $1 of LUNA 'burning' UST and 'minting' LUNA," which was supposed to reduce UST supply until the price recovered. Nothing backed the swap but LUNA's market price, which was itself sustained by demand for UST. By May 2022 there were about 19 billion UST, 14 billion of it deposited in the Anchor Protocol, a Terra lending protocol that paid depositors a high fixed yield.

Large UST sales began around May 7, 2022. Each UST redeemed minted more LUNA, LUNA's price fell, each further redemption minted more LUNA still, and UST's price fell "to near zero"; by the end of May, UST, LUNA and related tokens "were essentially worthless, wiping out more than $40 billion in combined market value." The SEC's complaint also alleged that when UST had depegged in May 2021, a US trading firm bought more than $20 million of UST to restore the peg under an arrangement with Terraform, while the market was told the algorithm had done it; the SEC settled with that firm, Tai Mo Shan, a Jump Trading affiliate, in December 2024.

The aftermath: a jury found Terraform and Do Kwon liable, and on June 12, 2024 the court approved a final judgment under which Terraform owes $4,473,828,306 and Kwon must transfer at least $204,320,196. Kwon pleaded guilty in August 2025 to wire fraud and conspiracy to defraud and was sentenced on December 11, 2025 by Judge Paul Engelmayer in the Southern District of New York to 15 years in prison. Terra's place in the 2022 collapse is the volume's FTX, Celsius & the 2022 Collapse chapter.

### Worked Numbers: The Loop

My illustration of why the mechanism has no floor. Start with 10 billion UST outstanding and LUNA with a market value of $20 billion, 1 billion LUNA at $20.

| Round | UST redeemed | LUNA minted | LUNA supply | LUNA price after selling | LUNA market value |
| --- | --- | --- | --- | --- | --- |
| 1 | 1B UST for $1B of LUNA | 50M at $20 | 1.05B | Falls to $15 as holders sell | $15.75B |
| 2 | 2B UST for $2B of LUNA | 133M at $15 | 1.18B | Falls to $8 | $9.5B |
| 3 | 3B UST for $3B of LUNA | 375M at $8 | 1.56B | Falls to $2 | $3.1B |
| 4 | 3B UST for $3B of LUNA | 1.5B at $2 | 3.06B | Falls to $0.20 | $0.6B |

After four rounds 9 billion UST have been redeemed for LUNA whose total value is now $600 million. The 1 billion UST remaining has a claim on nothing; every redemption printed the sister token faster, and the sister token was the only thing behind the coin. The defense in a reserve-backed design, a reserve that doesn't fall when the coin does, is exactly what this design lacked, which is why the GENIUS Act's reserve list contains no issuer-created asset.

## Crypto-Collateralized: DAI and USDS

Sky, formerly MakerDAO, issues DAI and its successor USDS against collateral locked in **vaults**. A user deposits collateral and mints stablecoins against it up to a per-collateral ratio (the `mat` parameter); if the collateral's value falls below that ratio, the protocol's `Dog` contract "confiscates the given Vault urn if it's undercollateralized" and hands it to a `Clipper`, and "Liquidation 2.0 uses Dutch auctions which settle instantly," selling the collateral at a falling price until someone buys. A liquidation penalty (`chop`) is added to the debt being recovered; Sky's documentation's example is a 13% penalty on 1,000 DAI of debt, for a target of 1,130 DAI.

Two other pieces matter for the peg. The **LitePSM** (peg stability module) is "designed to facilitate seamless swaps between DAI, USDS, and external stablecoins such as USDC, with no slippage," with fees "not ... activated" for DAI-USDC swaps as of November 2026, so a large share of DAI's stability comes from USDC held in it. And a converter allows "1:1 conversions between DAI and USDS," with no fee, which Sky says "cannot be enabled on this route in the future." The **Sky Savings Rate** is offered through sUSDS, an ERC-4626 vault token representing "a tokenized implementation of the Sky Savings Rate for USDS."

### Worked Numbers: A Vault in a Crash

My illustration, with a hypothetical 150% liquidation ratio and the documentation's 13% penalty.

| Moment | Collateral | Collateral value | Debt | Ratio | State |
| --- | --- | --- | --- | --- | --- |
| Open | 10 ETH at $3,000 | $30,000 | 15,000 DAI | 200% | Safe |
| ETH falls to $2,250 | 10 ETH | $22,500 | 15,000 DAI | 150% | At the line |
| ETH falls to $2,100 | 10 ETH | $21,000 | 15,000 DAI | 140% | Liquidated: target 16,950 DAI (15,000 + 13%) |
| Dutch auction sells 8.5 ETH at $2,000 | 1.5 ETH returned | | 0 | | 17,000 DAI raised, 16,950 needed |

The system is safe as long as auctions clear above the debt. In a crash fast enough that collateral falls through the debt before buyers arrive, or one where the auctions' buyers can't get DAI to bid with, the auction raises less than the debt and the protocol is left with bad debt that it has to cover from its own buffers. And because much of the system's liquidity sits in USDC in the stability module, DAI is a crypto-collateralized coin that depends, in a crisis, on a fiat-backed one: on March 11, 2023 both depegged. Lending protocols and liquidation mechanics in general are the volume's DeFi Lending & Liquidations chapter.

## Synthetic Dollars: Ethena's USDe

Ethena calls USDe a synthetic dollar. "USDe derives its relative peg stability from holding a diversified portfolio of backing assets": volatile assets "such as spot crypto, tokenized equities, and tokenised commodities, are paired with corresponding short futures positions" of about the same notional, so a fall in the asset's price is offset by a gain on the short. Minting is wholesale: "A whitelisted user provides ~$100 of USDT and receives ~100 newly-minted USDe atomically," and "Ethena does have the ability to reject an order"; everyone else buys on decentralized pools or exchanges. Revenue comes from what the hedged portfolio earns, chiefly the funding rate longs pay shorts on perpetual futures, and "periods of negative protocol revenue are absorbed by the Reserve Fund," which "can also be deployed to address shortfalls in backing." Holders who stake USDe as sUSDe receive reward distributions.

The design's risks are not a reserve's. **Funding can turn negative** for long enough to drain the reserve fund. **The hedge lives on exchanges,** so an exchange failure or a liquidation of the short at a bad price breaks the offset. And **a venue can misprice the token** without the backing changing at all, which is what happened on October 10, 2025: during that day's liquidation cascade, USDe traded at about 65 cents against USDT on Binance while on-chain pools "saw price deviations of less than 30bps," in the words of Ethena's founder, who distinguished a "temporary dislocation in the secondary price" from "permanent impairment of the collateral." Binance, whose own price fed its collateral valuations, acknowledged the "de-pegging of certain Binance Earn products relating to USDE, BNSOL, and WBETH" and reimbursed users about $283 million. The cascade itself is the volume's Perpetuals & Crypto Derivatives chapter.

### Worked Numbers: Funding and the Reserve Fund

My illustration: $5 billion of USDe backed by $5 billion of spot assets and a $5 billion short perpetual position, with a $100 million reserve fund. Perpetual funding is paid every eight hours on the position's notional.

| Funding (annualized) | Per year on $5B short | Per day | Days the $100M fund lasts if negative |
| --- | --- | --- | --- |
| +10% (longs pay shorts) | +$500M | +$1.37M | n/a |
| +3% | +$150M | +$0.41M | n/a |
| −5% (shorts pay longs) | −$250M | −$0.68M | 146 days |
| −20% | −$1,000M | −$2.74M | 36 days |

Positive funding is the business; negative funding is the run risk, slow and measurable, unlike a reserve run. The design is a bet that markets are on average willing to pay to be long crypto, and the reserve fund's size against the worst sustained negative funding is the number a risk team should watch.

## Tokenized Deposits

A bank can put its deposits on a chain without issuing a stablecoin. JPMorgan's JPM Coin (JPMD), from its Kinexys unit, is "a digital representation of a bank deposit on public blockchain," launched on Base for institutional clients on November 12, 2025 after a proof of concept from June 2025. The Federal Reserve staff note on new forms of money (Payne and Styczynski, September 4, 2026) draws the line:

| | Tokenized deposit | Payment stablecoin |
| --- | --- | --- |
| Legal form | "Legally still bank deposits" | Issued by a permitted issuer under the GENIUS Act |
| Backing | "Backed by bank assets (liquid and illiquid)" | "Must be collateralized with 1:1 backing by reserve assets" |
| Deposit insurance | "Eligible for deposit insurance" | Not insured; issuers must say so |
| Monetary aggregates | "Already included (M1 or M2 depending on terms)" | "Not currently included" |

The difference is the run analysis. A tokenized deposit is as safe as the bank, with deposit insurance up to the limit, Federal Reserve liquidity behind the bank, and the bank's loans and securities behind the deposit; a payment stablecoin is as safe as its reserve, fully backed by short safe assets but with no lender of last resort. Barr's comparison was that the deposit regime is "far more robust than what we have developed so far for stablecoins." For a builder the practical differences are that a deposit token typically moves only among the bank's KYC'd clients' wallets, can't circulate freely to strangers the way a stablecoin does, and pays interest if the bank chooses, since the GENIUS Act's yield ban doesn't apply to deposits. Circle's 10-K names banks offering tokenized deposits as competition that "could intensify."

## Operational Depegs

Not every break is economic. On October 15, 2025, Paxos minted 300 trillion PYUSD on Ethereum in error during an internal transfer and burned the excess within about 30 minutes; Paxos said "There is no security breach. Customer funds are safe," and Aave temporarily froze PYUSD markets while it was outstanding. The token's price didn't need to move for the event to matter: lending protocols, exchanges and indexers that read total supply saw a coin with more supply than the world's money, and the ones that paused did the right thing. The controls are in [Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin#minter-allowances): an allowance that makes a mint of that size impossible, and an alarm on any mint without a matching request.

## What Reserves and Redemption Rules Prevent

Each GENIUS Act and OCC rule answers a failure above:

| Failure | Case | Rule |
| --- | --- | --- |
| Reserve in an asset that falls when the coin does | UST | Reserves only in currency, insured deposits, short Treasuries, Treasury repo and government money market funds (12 U.S.C. 5903(a)(1)) |
| Reserve concentrated in one bank | USDC at SVB | OCC: no more than 40% with one counterparty; at least 5% on demand; stress tests |
| Reserve lent out or pledged | 2022 lenders (the volume's FTX, Celsius & the 2022 Collapse chapter) | No pledging or reuse except margin, custody and redemption liquidity (5903(a)(2)) |
| Holders unsure what's in the reserve | Every run | Monthly published composition, examined and certified (5903(a)(1)(C), (a)(3)) |
| Redemption slow or discretionary | Every run | Published policy, two business days (OCC), 24-hour notice above 10% a day |
| Holders behind other creditors in failure | Any issuer insolvency | Holders' priority on required reserves (5910) |
| Issuer's operating costs drawn from the reserve | A wind-down | OCC operational backstop of 12 months' expenses, held apart |
| A promise of yield drawing hot money | Anchor's fixed yield on UST | No issuer interest or yield (5903(a)(11)) |

What they don't prevent: a run when the reserve is whole but redemption is on banking days and the chain isn't (only disclosure and fast settlement rails shorten that), failures in tokens outside the regime (DAI, USDS, USDe), contagion through a stablecoin used as another's collateral, and venue-specific mispricing. Those are risks a platform holding stablecoins has to manage itself.

## How to Build It

These extend [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) and the reserve tables in [Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin#how-to-build-it). An issuer needs to prove it can survive a run before one starts; an exchange, lender or treasury holding stablecoins needs to see a depeg as it happens, per venue, and act on rules written in advance.

```sql
CREATE TABLE peg_observations (              -- a coin's price on one venue at one time
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id        UUID NOT NULL REFERENCES instruments (id),   -- the stablecoin
  quote_instrument_id  UUID NOT NULL REFERENCES instruments (id),   -- USD, USDT, ...
  venue_id             UUID REFERENCES venues (id),                 -- null: a composite
  observed_at          TIMESTAMPTZ NOT NULL,
  price                NUMERIC(38, 18) NOT NULL,
  deviation_bps        NUMERIC(10, 2) NOT NULL,   -- (price - 1) × 10,000
  depth_at_50bps       NUMERIC(78, 0),        -- liquidity within 50 bps, smallest units
  source               TEXT NOT NULL,         -- 'order_book', 'dex_pool', 'oracle', 'issuer'
  UNIQUE (instrument_id, quote_instrument_id, venue_id, observed_at)
);

CREATE TABLE liquidity_stress_tests (        -- can the reserve pay a run
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  issuer_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  backs_instrument_id  UUID NOT NULL REFERENCES instruments (id),
  as_of                DATE NOT NULL,         -- the reserve_holdings date used
  scenario             TEXT NOT NULL,         -- 'outflow_10pct_day', 'bank_failure_largest',
                                              -- 'rates_up_200bps', 'weekend_closure', ...
  assumptions          JSONB NOT NULL,        -- outflows by day, haircuts, unavailable counterparties
  outflow_by_day       BIGINT[] NOT NULL,     -- minor units requested, day 1..n
  cash_by_day          BIGINT[] NOT NULL,     -- minor units available from the ladder, day 1..n
  shortfall            BIGINT NOT NULL,       -- worst cumulative gap; 0 passes
  realized_loss        BIGINT NOT NULL,       -- from selling before maturity
  passed               BOOLEAN NOT NULL,
  reviewed_by          TEXT,
  run_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (issuer_entity_id, backs_instrument_id, as_of, scenario)
);
```

Design notes:

- **Observe per venue, not just a composite.** USDe on October 10, 2025 was 65 cents on one exchange and within 30 basis points on chain; an exchange that valued collateral from its own book saw a depeg the rest of the market didn't. Store each venue's price with its depth, and value collateral from a composite that excludes thin or outlying venues (the volume's [Market Data](/books/investing-and-digital-assets/market-data) chapter covers composites).
- **Act on rules written before the event.** A platform holding stablecoins sets thresholds per coin (for example a deviation of 50 basis points sustained for 15 minutes across a composite) that pause new collateral credit, raise haircuts or halt conversions, stored as data and reviewed like any risk limit ([Rules as Data](/docs/building-blocks/rules-as-data)).
- **Stress tests run from the real reserve.** The test reads `reserve_holdings` for a date and the ladder's liquidity days, applies the scenario's outflows and unavailable counterparties, and records the gap, so the OCC's required stress testing and the issuer's own monitoring are the same computation.
- **Know what backs what.** Record, per coin, the other coins in its backing (DAI's USDC in the stability module, USDe's stablecoin holdings), so a depeg in one raises the risk flag on the others.

## Auditing

- **Peg history per coin and venue,** retained, so a platform can show what price it used for collateral and conversions at any moment and why.
- **Every threshold breach and the action taken,** with the rule version that triggered it and the time it took effect.
- **Every stress test** with its scenario, inputs, result and reviewer, and the reserve changes made after a failed one.
- **For an issuer, the run record:** redemptions by hour, the ladder's cash by hour, the notices sent and the public statements made, with their times.

## What This Means for the System You Build

- **A stablecoin is only as good as its redemption,** and redemption is only as good as the reserve's least liquid, least safe asset; know both for every coin you hold.
- **Spread the cash.** The weak point at SVB was uninsured deposits at one bank; the OCC's counterparty cap is the rule, and a holder should check it.
- **Weekends are the risk window,** for issuers and for anyone holding their coins.
- **Different designs, different runs:** a reserve run is fast, a funding drain is slow, an algorithmic loop is terminal. Monitor what applies.
- **Price per venue, value from a composite,** and act on written thresholds, not judgment in the moment.
- **A deposit token is a deposit.** Treat it as bank credit with insurance, not as a stablecoin, and expect it to move only among the bank's clients.

## References

**Law and regulation**

- [12 U.S.C. 5903: Requirements for issuing payment stablecoins](https://www.law.cornell.edu/uscode/text/12/5903), the reserve list, rehypothecation limits, monthly disclosure and the yield ban
- [12 U.S.C. 5910: Treatment of payment stablecoin issuers in insolvency proceedings](https://www.law.cornell.edu/uscode/text/12/5910), holders' priority on required reserves

**Regulators and guidance**

- [Mayer Brown: OCC finalizes GENIUS Act rulemaking](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking), the 40% counterparty cap, the 5% on-demand floor, stress testing, the operational backstop and the 10% redemption notice
- [Federal Reserve: Barr, speech at DC Fintech Week (October 16, 2025)](https://www.federalreserve.gov/newsevents/speech/barr20251016a.htm), redemption at par, run susceptibility and the deposit regime's robustness
- [Federal Reserve: New forms of money and the US monetary aggregates (FEDS Notes, September 4, 2026)](https://www.federalreserve.gov/econres/notes/feds-notes/new-forms-of-money-and-the-u-s-monetary-aggregates-20260904.html), tokenized deposits compared with payment stablecoins
- [Federal Reserve Bank of New York: Runs and Flights to Safety: Are Stablecoins the New Money Market Funds? (Staff Report 1073)](https://www.newyorkfed.org/research/staff_reports/sr1073), flight-to-safety dynamics and the $1 break-the-buck threshold

**Courts and enforcement**

- [SEC v. Terraform Labs and Do Kwon: amended complaint](https://www.sec.gov/files/terraform-labs-pte-ltd-amended-complaint.pdf), the UST-LUNA swap, 19 billion UST and 14 billion in Anchor, the May 2022 collapse and the $40 billion loss, and the 2021 peg support
- [SEC: Terraform and Kwon agree to pay more than $4.5 billion (June 13, 2024)](https://www.sec.gov/newsroom/press-releases/2024-73), the settlement after the jury verdict
- [SEC: Distributions in SEC v. Terraform Labs and Kwon](https://www.sec.gov/enforcement-litigation/distributions-harmed-investors/sec-v-terraform-labs-pte-ltd-do-hyeong-kwon-no-23-cv-1346-jsr-sdny), the June 12, 2024 final judgment amounts
- [SEC: Tai Mo Shan settlement (December 20, 2024)](https://www.sec.gov/newsroom/press-releases/2024-212), the 2021 UST purchases to restore the peg
- [The Block: Do Kwon sentenced to 15 years (December 11, 2025)](https://theblock.co/news/regulation/2025-12-11-terraform-labs-founder-do-kwon-sentenced-to-15-years-over-40-billion-terra-luna-collapse-inner-city-press-382204), the sentence, judge and August 2025 plea

**Filings**

- [Circle Internet Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000062/crcl-20251231.htm), the SVB transfers that failed to settle and tokenized deposits as competition

**Standards and protocols**

- [Sky: Collateral liquidation](https://developers.skyeco.com/protocol/vaults/collateral-liquidation/), `mat`, the `Dog` and `Clipper`, Dutch auctions and the `chop` example
- [Sky: LitePSM](https://developers.skyeco.com/protocol/liquidity/litepsm/), swaps between DAI, USDS and USDC and their fees
- [Sky: USDS](https://developers.skyeco.com/protocol/tokens/usds/), the fee-free DAI-USDS converter
- [Sky: sUSDS](https://developers.skyeco.com/protocol/tokens/susds/), the Sky Savings Rate as an ERC-4626 token
- [Ethena: How USDe works](https://docs.ethena.fi/overview/how-usde-works.md), backing assets paired with short futures, whitelisted minting and the reserve fund's role
- [Ethena: Minting USDe](https://docs.ethena.fi/technical-design/minting-usde.md), the ability to reject orders and secondary-market access
- [Ethena: Reserve Fund](https://docs.ethena.fi/protocol-overview/reserve-fund.md), absorbing negative revenue and backing shortfalls

**Vendor documentation**

- [Circle: $3.3 billion of USDC reserve risk removed (March 13, 2023)](https://www.circle.com/pressroom/3-3-billion-of-usdc-reserve-risk-removed-dollar-de-peg-closes), the SVB deposit, no Signature exposure and the March 11 reserve composition
- [JPMorgan: JPM Coin USD deposit token for institutional clients (November 12, 2025)](https://www.jpmorgan.com/payments/newsroom/jpm-coin-usd-deposit-token-institutional-clients), JPMD as a digital representation of a bank deposit on Base

**In practice**

- [CoinDesk: USDC and the crypto market after Silicon Valley Bank (March 11, 2023)](https://www.coindesk.com/markets/2023/03/11/usdc-stablecoin-and-crypto-market-go-haywire-after-silicon-valley-bank-collapses), USDC at 87 cents on Kraken and DAI's depeg
- [Protos: Binance's USDe depeg (October 13, 2025)](https://protos.com/binance-usde-depeg-exchange-millions), USDe at about 65 cents on Binance, on-chain deviations under 30 basis points, Binance's statement and about $283 million reimbursed
- [The Block: Paxos mistakenly mints 300 trillion PYUSD (October 15, 2025)](https://www.theblock.co/post/374870/paxos-mistakenly-mints-300-trillion), the mint, the burn within about 30 minutes, Paxos's statement and Aave's freeze
- [DefiLlama: Stablecoins](https://stablecoins.llama.fi/stablecoins?includePrices=false), circulating supply by token on November 5, 2026
