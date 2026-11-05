+++
title = "How Brokers & Exchanges Make Money"
nav_title = "How the Money Is Made"
description = "PFOF per share and per contract, net interest, sweeps, stock lending, subscriptions, crypto fee tiers, staking, custody, reserve income and rate sensitivity."
category = "Investing & Digital Assets Industry"
order = 2503
part = "The Business"
tags = ["investing", "pfof", "net-interest", "stablecoins", "fees", "business-models"]
+++

A commission-free broker, a crypto exchange and a stablecoin issuer look like different businesses and run on the same four meters: what the firm earns on a trade, what it earns on cash and credit, what it earns on assets it manages or safeguards, and what it earns on a reserve. The mix decides how the firm behaves. A broker paid per order wants more orders, a broker paid on cash wants customers to leave it uninvested, an exchange paid in basis points of volume needs volatility, and an issuer paid on its reserve needs interest rates and pays most of the income to whoever holds its token for it. Almost every conduct rule in this volume regulates one meter: what a broker received for routing and whether the customer still got a good price, what a sweep paid the customer against what it paid the firm, what was charged and under which schedule, and what an issuer may share with a distributor.

This chapter takes each meter from filings and rule-required reports, as of November 2026, works the numbers per share, per contract, per dollar of cash and per dollar of float, and ends with what each needs in the ledger. [The Investing & Digital Assets Business](/books/investing-and-digital-assets/investing-business#how-the-money-works) gives the overview; this chapter adds `order_flow_agreements`, `order_flow_payments`, `revenue_share_agreements` and `interest_programs` to [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model).

## How the Platforms Do It

Revenue by meter for the latest reported quarter, from each company's release or quarterly report; shares are my arithmetic:

| Company (quarter) | Trading | Net interest | Assets, subscriptions, other | Reserve or stablecoin | Total |
| --- | --- | --- | --- | --- | --- |
| **Robinhood** (Q3 2026) | $867M transaction-based, 61% | $415M, 29% | $142M other, 10% | | $1,424M net revenues |
| **Charles Schwab** (Q3 2026) | $1,158M trading, 16% | $3,476M, 48% | $1,913M asset management and administration fees, 27%; $345M bank deposit account fees, 5% | | $7,171M net revenues |
| **Interactive Brokers** (Q3 2026) | $602M commissions, 31% | $1,150M, 60% | $88M other fees and services, 5% | | $1,914M net revenues |
| **Coinbase** (Q3 2026) | $590M transaction, 51% | $69M interest and finance fees, 6% | $86M blockchain rewards, 7%; $109M other subscription and services, 9% | $307M stablecoin revenue, 26% | $1,160M net revenue |
| **Circle** (Q3 2026) | | | $207M other revenue, 24%, of which $182M from the ARC token presale | $658M reserve income, 76% | $865M revenue and reserve income |
| **Gemini** (Q2 2026) | $12.5M exchange and $4.7M OTC transactions, 38% | | $16.2M credit card, 36%; $4.0M staking, 9%; $0.6M custody fees, 1% | | $45.5M revenue |

Four patterns run through the table:

- **Interest is the biggest meter at the biggest brokers.** Interactive Brokers earns 60% of its revenue and Schwab 48% as net interest; even Robinhood, built on payment for order flow, earns nearly 30% that way. A broker is a balance sheet with an app.
- **Crypto revenue is the volatile line.** Robinhood's crypto revenue fell 55% year over year in the third quarter of 2026 while its options and equities revenue rose 31% and 41%; Coinbase's transaction revenue fell from $1,046.3 million to $590.2 million over the same year. Exchanges have spent two years adding stablecoin, staking, card and subscription lines to dampen it.
- **An issuer's revenue is a rate times a float.** Circle's reserve income is three-quarters of its quarter even with a one-time token sale in the other line, and The Stablecoin Business covers the issuer's side in depth.
- **Gross and net are not comparable.** BitGo reported $16.2 billion of 2025 revenue, of which about $15.6 billion was digital asset sales reported gross on the full value of trades it executed as principal; Coinbase reports its trading as net fees. Before comparing two firms' revenue, read which they report ([Accounting](/docs/money/accounting#asc-606-and-ifrs-15-in-five-steps)).

## Payment for Order Flow

A retail broker that charges no commission routes its customers' stock and options orders to wholesalers, which fill them off-exchange, usually at or inside the national best bid and offer, and pay the broker for the flow. The wholesaler earns the spread it captures between buying from one retail customer and selling to another or hedging on an exchange; the payment is a share of that spread. Robinhood Securities' Rule 606 report for the second quarter of 2026 states its terms for NMS stocks: a fixed percentage of the NBBO spread at the time of execution, 12.35% during regular hours (9:30 a.m. to 4:00 p.m. ET) and 9% during extended hours (4:00 to 9:30 a.m. and 4:00 to 8:00 p.m.), the same for every non-exchange market center, and $0.0006 a share for orders executed between 8:00 p.m. and 4:00 a.m.

Worked numbers, my own:

| Order | Spread at execution | Rate | Payment per share | Payment for the order |
| --- | --- | --- | --- | --- |
| 100 shares, regular hours | $0.02 | 12.35% | $0.00247 | $0.247 |
| 100 shares, regular hours | $0.10 | 12.35% | $0.01235 | $1.235 |
| 100 shares, pre-market | $0.05 | 9% | $0.0045 | $0.45 |
| 100 shares, overnight | any | $0.0006 a share | $0.0006 | $0.06 |

The payment scales with the spread, not the price, so a wide-spread, thinly traded stock pays the broker far more per share than a penny-spread megacap. The report's monthly tables show the result. For April 2026 in S&P 500 stocks, Virtu paid $772,056.10 for market orders at 96.31 cents per hundred shares, and Jane Street $567,312.97 at 116.52 cents. If the 12.35% applied to all of it, 96.31 cents per hundred shares implies an average spread at execution of about 7.8 cents a share (0.9631 ÷ 100 ÷ 0.1235, my arithmetic), which is what the S&P 500's higher-priced stocks quote.

Options pay per contract instead. The same report lists, for single-leg orders of 1 to 100 contracts, $0.30, $0.38, $0.56, $0.70, $0.90 or $1.20 a contract depending on the symbol's average spread; $0.15 to $0.60 for 101 contracts or more; $0.30 to $0.90 for multi-leg orders; and no payment on index options. A 10-contract single-leg order in a narrow-spread symbol pays $3.00, and in the widest tier $12.00, against about 25 cents for the 100-share stock order above (my arithmetic). That ratio is why options are Robinhood's largest transaction line: $399 million in the third quarter of 2026 on 905 million contracts traded, about $0.44 of revenue per contract (my arithmetic, across all options revenue), against $121 million of equities revenue on $992 billion of notional, about 1.2 basis points.

**The trade-off with price improvement.** A wholesaler's spread is split between the customer, as price improvement inside the NBBO, and the broker, as payment. The SEC's staff report on the January 2021 events, describing the SEC's December 2020 order against Robinhood, said Robinhood took about a 20/80 split of that value between price improvement and payment for order flow, against the typical 80/20 other retail brokers received. The order itself imposed a $65 million penalty for misleading customers about payment for order flow, its largest revenue source from 2015 to late 2018, and found customer orders executed at worse prices than at other brokers, costing customers about $34.1 million even after the commissions they saved. The payment is lawful and disclosed; the obligation that comes with it is best execution, measured order by order and reviewed regularly, and [Order Routing, PFOF & Best Execution](/books/investing-and-digital-assets/routing-and-best-execution) covers the measurement. The SEC's December 2022 proposal to make retail orders compete in auctions was withdrawn in June 2025, so the model stands as of November 2026 in the US; Beyond the US covers the markets that ban it.

**Who in the group receives it.** Robinhood's introducing broker (Robinhood Financial) routes to its affiliated clearing broker (Robinhood Securities), which routes to the market centers; the 606 report states that Robinhood Securities passes 80% of the venue revenue to Robinhood Financial under a revenue and cost allocation agreement. Inside one brand, the payment lands at one entity and is allocated to another, and both entities' books have to show it ([Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses#one-company-many-entities)).

**Concentration.** Citadel Securities alone was 17% of Robinhood's total net revenues in the third quarter of 2026. The broker's revenue depends on a few counterparties' willingness to keep paying, under agreements its 10-K says are often not written contracts.

## Crypto Spreads, Fees and Rebates

A crypto platform earns on the trade directly, in one of three forms:

- **Exchange fees.** An order book charges maker and taker fees by tier. Kraken Pro's spot schedule runs from 0.40% maker and 0.80% taker below $2,500 of 30-day volume, through 0.10% and 0.22% at $250,000, to 0% maker and 0.05% taker at $500 million or more, with tiers also reachable by assets held on the platform.
- **Simple-buy fees and spreads.** Kraken's app charges a 1% fee on instant and recurring trades and 1.5% on custom orders, with small instant trades capped at $2, plus the spread in the price quoted. A $1,000 instant buy pays $10 in fee before the spread; the same $1,000 as a Pro taker order at the first tier pays $8 and at the top tier $0.50 (my arithmetic).
- **Rebates from liquidity providers.** Robinhood's 10-K describes its crypto revenue as transaction rebates from the market makers it routes to, the crypto version of payment for order flow.

Blended take rates show who is paying. Coinbase's consumer transaction revenue of $450.1 million on $23.4 billion of consumer volume in the third quarter of 2026 is about 1.9%; its institutional transaction revenue of $91.7 million on $111.1 billion is about 8 basis points. Robinhood's $120 million of crypto revenue on $50 billion of notional across its app and Bitstamp is about 24 basis points (all my arithmetic). At Coinbase a consumer pays about 23 times what an institution does per dollar traded, and that gap, more than volume, is the exchange's revenue line. Crypto Trading Products covers convert pricing, RFQ and fee tier engines.

## Net Interest on Cash and Margin

A broker earns interest four ways, and each is a program with its own records:

- **Margin loans.** Customers borrow against securities at the broker's posted rate. Schwab had $187.9 billion of margin loans at September 30, 2026, up 93% in a year; Interactive Brokers $105.2 billion; Robinhood a $22.1 billion margin book.
- **Free credit balances.** Cash a customer leaves at the broker is a liability the broker can use in its business only within the customer protection rule's reserve formula (Customer Protection, Net Capital & SIPC). Interactive Brokers reported $186.2 billion of customer credits.
- **Sweeps.** Uninvested cash moves automatically to program banks or a money market fund; the bank pays the broker a fee or a rate, and the broker passes some of it to the customer. Schwab reported $345 million of bank deposit account fees on $68.0 billion of balances swept to third-party banks at quarter-end, an annualized fee of about 2.0% of the ending balance (my arithmetic, and an overstatement or understatement to the extent the average balance differed).
- **Its own balance sheet.** Cash a broker keeps in its own bank or on its own balance sheet earns the spread over what clients are paid; Schwab reported $492.8 billion of transactional sweep cash and a net interest margin of 3.04% in the third quarter of 2026, up from 2.88% a year earlier.

Worked numbers for a sweep, my own illustration with stated assumptions: a broker sweeps $10 billion to program banks that pay it 4.00%, and credits customers 0.50%. The program earns $350 million a year; the customer on $10,000 of cash earns $50 instead of $400. If the broker credits 3.60%, the rate Robinhood advertises to Gold subscribers on eligible brokerage cash as of November 2026, the same program earns $40 million. Every point of difference between what the bank pays and what the customer gets is revenue, and that is why sweep rates became the subject of enforcement and class actions (Cash, Sweeps & Yield covers them, and Banking & Lending's [Worked Numbers: A $4 Million Sweep](/books/banking-and-lending/sweeps-and-yield#worked-numbers-a-4-million-sweep) the bank side).

The robo-adviser version is the clearest enforcement record. The SEC found in June 2022 that each Schwab Intelligent Portfolios model held between 6% and 29.4% of clients' assets in cash, set so that Schwab's affiliate bank would earn a minimum amount, with management deciding the portfolios would hold an average of at least 12.5% in cash, while disclosures described the cash as the product of a "disciplined portfolio construction methodology." Schwab's subsidiaries paid $187 million: about $52 million of disgorgement and interest and a $135 million penalty. Cash allocation in a managed account is a revenue decision, and Robo-Advisors & Model Portfolios covers how to keep it a portfolio decision.

## Securities Lending

A broker lends customers' margin securities, and with consent their fully paid securities, to borrowers who pay a fee, highest for hard-to-borrow stocks. Robinhood's fully paid lending program pays customers up to 15% of the gross revenue it earns lending their shares, monthly; holds cash collateral of at least 100% of the loaned shares' value at a third-party bank; and tells customers loaned shares are not protected by SIPC and that they lose voting rights on them. A worked illustration of my own: a customer's 1,000 shares of a $20 stock lent at a 30% annualized fee earn $6,000 a year gross; at a 15% share the customer receives $900 and the broker keeps $5,100. Robinhood attributed the 9% fall in its third quarter 2026 net interest to lower securities lending activity and lower short-term rates, so the line moves with how many stocks are hard to borrow, not with rates alone. Margin & Short Selling covers locates and the loan records.

## Subscriptions and Advisory Fees

**Subscriptions.** Robinhood Gold costs $5 a month and gave 3.6% APY on eligible brokerage cash and a 3% IRA match as of November 2026; Robinhood had 5.2 million Gold subscribers at September 30, 2026. At the monthly list price that is at most $312 million a year (my arithmetic, ignoring any annual pricing), and the subscription also changes the interest line, because the 3.6% it pays on cash is paid out of the sweep spread. A subscription is a fee schedule with a recurring charge and a set of benefits that change other fee schedules, and each benefit has to read the subscription in force on the date it applies.

**Asset-based fees.** Advisers and robo-advisers charge a percentage of assets: 0.25% a year on a $100,000 account is $250, accrued daily on the account's value and billed monthly or quarterly (my illustration). Schwab's asset management and administration fees were $1,913 million in the third quarter of 2026. Asset fees rise and fall with markets rather than trading, and RIA Custodians & Advisor Platforms covers billing them.

## Staking and Custody Fees

**Staking.** A custodial staking program stakes customers' assets with validators, receives the protocol's rewards and passes them through less a commission. Kraken's staking page shows estimated reward rates "before our commission" (2.63% bonded for ETH when read in November 2026) without stating the commission; BitGo's 10-K says it earns a fixed percentage of the rewards its clients receive. A worked illustration with an assumed commission: 1,000 ETH staked at 2.63% earns 26.3 ETH a year; at a 25% commission, the platform keeps 6.575 ETH and credits customers 19.725 ETH. Coinbase reported $85.7 million of blockchain rewards revenue in the third quarter of 2026, against $184.6 million a year earlier, and Gemini $4.0 million in its second quarter. Rewards revenue moves with the staked asset's price, so a falling ETH price cuts it even when nothing about the program changes. Staking as a Product covers how the rewards are accrued and reported; the validator side is Hosting & Cloud's [Validators and Slashing](/books/hosting-and-cloud/blockchain-nodes-and-validators#validators-and-slashing).

**Custody.** Custody fees are rarely published. The iShares Bitcoin Trust pays its sponsor 0.25% a year of net asset value, and the sponsor in turn pays the custodians' fees; on the trust's $67.4 billion of net assets at December 31, 2025, the sponsor fee was running at about $168.5 million a year (my arithmetic), with the custodian's share undisclosed. Gemini's custodial fee revenue fell from $1.9 million to $0.6 million year over year in its second quarter of 2026. Custody is the steady, small, high-trust meter, and Qualified Custody covers what earns it.

## Reserve Income and Distribution Payments

A stablecoin issuer earns the yield on the reserve backing its tokens and may not pay holders interest, so the income is the issuer's to keep or to share with the firms that distribute the token.

**Circle in 2025.** Reserve income was $2,636.8 million on an average of $64,870 million of USDC in circulation at a reserve return rate of 4.1%; $64.87 billion at 4.1% is about $2.66 billion, close to the reported figure (my check). Distribution and transaction costs were $1,661.5 million, about 60% of total revenue and reserve income of $2,746.6 million, and about $1.4 billion of them went to Coinbase. Circle reported a net loss of $69.5 million from continuing operations for the year.

**The waterfall.** Circle's 10-K describes the collaboration agreement with Coinbase: payments are computed from a daily payment base equal to net reserve income; Circle retains an issuer portion; each party receives the income on USDC held on its own platform; and Coinbase "receives half of the remaining amount of income generated from stablecoins circulated in the broader ecosystem," after payments to approved third parties. A worked illustration with assumed shares (the issuer retention tier is redacted in the filed agreement): on $1,000 of daily net reserve income, if the issuer retains 10% ($100), USDC on Coinbase's platform is 30% of circulation ($270 of the remaining $900 to Coinbase), USDC on Circle's platform is 18% ($162 to Circle), and the rest of the ecosystem's $468 is split half and half, Coinbase receives $504 and Circle keeps $496 including its retention. With those assumptions, a partner holding 30% of the supply receives about half the income, which is the shape of Circle's 2025 numbers.

**The third quarter of 2026.** Circle's average USDC in circulation rose 8% to $73.3 billion, but its reserve return rate fell 61 basis points to 3.5%, and reserve income fell 8% to $657.6 million: $73.3 billion at 3.5% for a quarter is about $641 million, and a year earlier about $67.9 billion at 4.1% was about $700 million (my arithmetic). On the other side, Coinbase booked $306.9 million of stablecoin revenue, with an average of $22 billion of USDC held in its products against an average USDC market capitalization of $73 billion. USDC on Circle's own platform averaged 18.1% of circulation.

**Tether** has no comparable distribution agreement disclosed in its attestation and reported $1.5 billion of net operating profit for the quarter, with $132.4 billion of direct and indirect Treasury bill exposure and "U.S. Treasury bills and reverse repurchase agreements" providing most of the income. The Stablecoin Business covers both models; the GENIUS Act's limits on paying holders, and the open question of affiliates' rewards, are in Stablecoin Law.

## Rate Sensitivity

Three of the four meters are rates. The filings describe the exposure; the arithmetic below is mine, on reported balances, before any repricing of what customers are paid:

| Business | Rate-sensitive balance (latest) | Effect of 25 bp on a full year, unhedged |
| --- | --- | --- |
| Circle | $73.9 billion of USDC in circulation | About $185 million of reserve income, of which about 60% would have gone to distribution at 2025's ratio |
| Robinhood | $32.3 billion cash sweep plus a $22.1 billion margin book | About $136 million gross across both, before any change in rates paid to customers |
| Interactive Brokers | $186.2 billion customer credits plus $105.2 billion margin loans | About $728 million gross across both, before any change in rates paid to customers |
| Schwab | $492.8 billion transactional sweep cash plus $187.9 billion margin loans | About $1.7 billion gross across both, before any change in rates paid to clients |

The numbers overstate the exposure for brokers, because brokers reprice what they pay on cash when rates move (the deposit beta that Banking & Lending's [Deposit Betas](/books/banking-and-lending/bank-economics#deposit-betas) covers), and understate it for an issuer that by law pays holders nothing: Circle's 10-K says reserve income was 96.0% of its 2025 revenue and that it is "unable to accurately predict the impact of changes in interest rates" on its results. The design consequence is the same either way: every interest-bearing program needs the rate paid, the rate earned and the balance by day, so the firm can answer what a cut costs before the Federal Reserve meets.

## How to Build It

The core model already has `fee_schedules`, `fees` and `journal_lines` ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)). Revenue that a counterparty pays the platform, rather than a customer, needs its own agreements and its own accruals, tied to the executions and balances that earned it:

```sql
CREATE TABLE order_flow_agreements (       -- what a venue pays for routed flow, versioned
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),  -- the entity paid
  venue_id            UUID NOT NULL REFERENCES venues (id),
  asset_class         TEXT NOT NULL CHECK (asset_class IN ('nms_stock', 'option', 'crypto',
                        'event_contract')),
  session             TEXT NOT NULL CHECK (session IN ('regular', 'extended', 'overnight',
                        'all')),
  basis               TEXT NOT NULL CHECK (basis IN ('pct_of_spread', 'per_share',
                        'per_contract', 'bps_of_notional')),
  terms               JSONB NOT NULL,        -- {"pct_bps": 1235} or per-contract tiers by spread
  written_contract    BOOLEAN NOT NULL,      -- many arrangements are not
  valid_during        TSTZRANGE NOT NULL,
  EXCLUDE USING gist (venue_id WITH =, asset_class WITH =, session WITH =,
                      legal_entity_id WITH =, valid_during WITH &&)
);

CREATE TABLE order_flow_payments (         -- accrued per execution, invoiced monthly
  execution_id        UUID PRIMARY KEY REFERENCES executions (id),
  agreement_id        UUID NOT NULL REFERENCES order_flow_agreements (id),
  nbb_at_execution    NUMERIC(38, 18),       -- the quote the payment is computed on
  nbo_at_execution    NUMERIC(38, 18),
  accrued_micros      BIGINT NOT NULL CHECK (accrued_micros >= 0),  -- 1e-6 USD
  invoice_month       DATE NOT NULL,
  journal_entry_id    UUID REFERENCES journal_entries (id)
);

CREATE TABLE revenue_share_agreements (    -- intercompany and partner splits
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  payer_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  payee_entity_id     UUID REFERENCES legal_entities (id),   -- an affiliate
  payee_participant   UUID,                  -- or an outside firm (market_participants)
  revenue_kind        TEXT NOT NULL,         -- 'order_flow', 'reserve_income', 'sweep_fee', ...
  formula             JSONB NOT NULL,        -- {"pct": 80} or a waterfall of steps
  document_ref        TEXT NOT NULL,         -- the agreement, as filed or as signed
  valid_during        TSTZRANGE NOT NULL,
  CHECK ((payee_entity_id IS NULL) <> (payee_participant IS NULL))
);

CREATE TABLE interest_programs (           -- sweeps, margin rates, cash rates, reserves
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  kind                TEXT NOT NULL CHECK (kind IN ('bank_sweep', 'mmf_sweep',
                        'free_credit', 'margin_loan', 'stock_loan', 'reserve')),
  counterparty        TEXT,                  -- program bank, fund or borrower
  rate_earned_bps     INT,                   -- what the firm receives, by version
  rate_paid_bps       INT,                   -- what the customer receives or pays
  tier_rule           JSONB,                 -- balance tiers, subscription conditions
  valid_during        TSTZRANGE NOT NULL
);
```

The payment on each fill is computed once, in integer micro-dollars, from the quote at execution, and rounded once per fill; the monthly invoice from the venue is then reconciled against the sum ([Money & Amounts](/docs/money/amounts#integer-minor-units)):

```go tab="Go"
// pfofMicros returns the payment for one fill in micro-dollars (1e-6 USD).
// spreadMicros is the NBO minus the NBB at execution; rateBps is the agreed
// share of the spread in basis points (1235 for 12.35%). Rounds half up once.
func pfofMicros(shares, spreadMicros, rateBps int64) int64 {
	num := shares * spreadMicros * rateBps
	q, r := num/10_000, num%10_000
	if r*2 >= 10_000 {
		q++
	}
	return q
}

// 100 shares at a $0.02 spread and 12.35%: pfofMicros(100, 20_000, 1235) == 247_000 ($0.247)
```

```rust tab="Rust"
/// Payment for one fill in micro-dollars (1e-6 USD). `spread_micros` is the NBO
/// minus the NBB at execution; `rate_bps` is the share of the spread (1235 for
/// 12.35%). Computed in i128 so large fills can't overflow; rounds half up once.
fn pfof_micros(shares: i64, spread_micros: i64, rate_bps: i64) -> i64 {
    let num = shares as i128 * spread_micros as i128 * rate_bps as i128;
    let (q, r) = (num / 10_000, num % 10_000);
    (if r * 2 >= 10_000 { q + 1 } else { q }) as i64
}

// 100 shares at a $0.02 spread and 12.35%: pfof_micros(100, 20_000, 1235) == 247_000 ($0.247)
```

Design notes:

- **Payment terms are rules as data with dates.** The 606 report states the terms in force each quarter; the router, the accrual and the report read the same `order_flow_agreements` row, so a change of percentage on a date changes all three ([Rules as Data](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Accrue per execution, reconcile per invoice.** The venue pays monthly on its own computation; the platform's per-fill accrual is the control, and a difference is a `recon_breaks` row, not an adjustment.
- **Keep the quote with the payment.** Best execution reviews compare the price improvement given to the customer with the payment received on the same fill, so both come from the same NBBO snapshot.
- **Intercompany splits are journal entries between entities.** The 80% pass-through from clearing broker to introducing broker posts in both entities' books under a `revenue_share_agreements` row, so each entity's revenue, capital and the consolidated total can be produced separately.
- **Interest programs are versioned per rate change.** What the firm earned and what it paid, by day, is how sweep disclosures, the rate table customers see and rate-sensitivity questions are answered from the same rows.

## Auditing

- **What was received for every order.** Each execution's payment, agreement version and NBBO, reproducible for the quarterly 606 report and for a best execution review that compares price improvement with payment.
- **Every rate earned and paid.** Each interest program's rates by day and the balances they applied to, so a sweep disclosure, a marketing claim about a cash rate and the actual credits can be compared.
- **Every revenue share with its document.** Intercompany allocations and partner payments with the agreement that set them, since filings name the counterparties and examiners ask how revenue moved between entities.
- **Gross versus net, decided once.** The principal or agent determination for each revenue line, recorded with its rationale, so reported revenue doesn't change meaning between periods.

## What This Means for the System You Build

- **Model each meter separately:** trade revenue, interest, asset fees and reserve income have different drivers, counterparties and rules.
- **Compute payment for order flow per fill from the quote at execution,** in integer micro-units, and reconcile the venue's invoice against it.
- **Record what the customer got next to what the firm got** on the same execution, because best execution is judged on both.
- **Version every rate and every split** with its source document and dates.
- **Know the rate exposure from your own rows:** balances, rates earned and rates paid by day.
- **Read gross and net before comparing revenue** across firms.

## References

**Regulators and guidance**

- [SEC: SEC charges Robinhood Financial with misleading customers about revenue sources and failing to satisfy duty of best execution (Press Release 2020-321, December 17, 2020)](https://www.sec.gov/news/press-release/2020-321), the $65 million penalty, payment for order flow as the largest revenue source, inferior execution prices and the $34.1 million customer loss
- [SEC: Staff Report on Equity and Options Market Structure Conditions in Early 2021 (October 2021)](https://www.sec.gov/files/staff-report-equity-options-market-struction-conditions-early-2021.pdf), the 20/80 split between price improvement and payment for order flow described in the Robinhood order
- [SEC: Charles Schwab to pay $187 million to settle charges of misleading robo-adviser clients (Press Release 2022-104, June 13, 2022)](https://www.sec.gov/newsroom/press-releases/2022-104), the representations, the affiliate bank spread and the amounts
- [SEC: In the Matter of Charles Schwab & Co., Inc. et al. (Release 34-95087, June 13, 2022)](https://www.sec.gov/litigation/admin/2022/34-95087.pdf), the 6% to 29.4% cash range and the 12.5% average target
- [SEC: Order Competition Rule, proposed rule (88 FR 128, January 3, 2023)](https://www.govinfo.gov/content/pkg/FR-2023-01-03/html/2022-27617.htm), the retail auction proposal
- [SEC: Withdrawal of Proposed Regulatory Actions (90 FR 25531, June 17, 2025)](https://www.federalregister.gov/api/v1/documents/2025-11110.json), its withdrawal

**Filings**

- [Robinhood Securities: Rule 606 report, second quarter 2026](https://cdn.finra.org/606/2026/287900_606_NMS_2026_Q2_V1.pdf), equity payment terms by session, the overnight per-share rate, the options per-contract schedule, April 2026 payments by venue and the 80% allocation to Robinhood Financial
- [Robinhood Markets: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000164/q32026robinhoodexhibit991.htm), revenue by line, options contracts, equity and crypto notional, margin book, cash sweep, Gold subscribers and the reasons for lower net interest
- [Robinhood Markets: Form 10-Q for the third quarter of 2026](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000167/hood-20260930.htm), Citadel Securities' share of total net revenues
- [Robinhood Markets: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000023/hood-20251231.htm), crypto transaction rebates and liquidity provider arrangements
- [Charles Schwab: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/316709/000031670926000035/a3q26exhibit991.htm), revenue by line, net interest margin, sweep cash, bank deposit account balances and margin loans
- [Interactive Brokers: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1381197/000138119726000154/ibkr-ex99_1.htm), commissions, net interest income, other fees, customer credits and margin loans
- [Coinbase Global: Form 10-Q for the third quarter of 2026](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000122/coin-20260930.htm), revenue by line for the quarter and a year earlier
- [Coinbase Global: Third quarter 2026 earnings deck](https://www.sec.gov/Archives/edgar/data/0001679788/000167978826000121/q326earningsdeck_vsec.htm), consumer and institutional volume and transaction revenue, average USDC held in Coinbase products and average USDC market capitalization
- [Circle Internet Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000062/crcl-20251231.htm), reserve income, distribution costs and payments to Coinbase, average circulation and reserve return rate, the collaboration agreement's terms, reserve income as a share of revenue and the statement on interest rates
- [Circle Internet Group: Third quarter 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000309/finalq3epr-110326.htm), reserve income, reserve return rate, other revenue and the ARC presale, average and ending USDC, USDC on platform
- [Gemini Space Station: Form 10-Q for the second quarter of 2026](https://www.sec.gov/Archives/edgar/data/0002055592/000205559226000065/gemi-20260630.htm), revenue by line
- [BitGo Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1740604/000174060426000020/btgo-form10xk.htm), total revenue and digital asset sales reported gross, staking commission and custody fees
- [iShares Bitcoin Trust ETF: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1980994/000143774926006058/bit20251231_10k.htm), the 0.25% sponsor fee, the sponsor's assumption of the custodians' fee and net assets

**Vendor documentation**

- [Kraken: Fee schedule](https://www.kraken.com/features/fee-schedule), Kraken Pro spot tiers and instant buy fees
- [Kraken: Staking](https://www.kraken.com/features/staking-coins), reward rates shown before commission
- [Robinhood: Robinhood Gold](https://robinhood.com/us/en/gold/), the monthly price, the cash APY and the IRA match
- [Robinhood: Stock lending](https://robinhood.com/us/en/support/articles/stock-lending/), the revenue share, monthly payment, collateral and SIPC status of loaned stocks
- [Tether: Q3 2026 attestation release](https://tether.io/news/tether-generates-1-5-billion-in-q3-net-operating-profit-as-reserve-buffer-doubles-to-almost-8-billion/), net operating profit, Treasury bill exposure and income sources
