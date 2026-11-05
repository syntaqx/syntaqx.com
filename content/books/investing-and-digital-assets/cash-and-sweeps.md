+++
title = "Cash, Sweeps & Yield"
description = "Where a broker's uninvested cash goes: free credit balances, bank and money fund sweeps, the sweep spread and its suits, and crypto yield, BlockFi to GENIUS."
category = "Investing & Digital Assets Industry"
order = 2509
part = "Accounts and Positions"
tags = ["investing", "brokerage", "cash-sweep", "fdic", "sipc", "money-market-funds", "stablecoins", "yield"]
+++

The cash sitting uninvested in brokerage accounts is one of the largest and cheapest sources of funding in American finance. At the end of September 2026 Schwab's clients held $492.8 billion of transactional sweep cash, and its net interest margin was 3.04%; Robinhood's Cash Sweep held $32.3 billion. Customers leave cash in a brokerage account because they just sold, are about to buy, or never decided, and most don't check what it earns. The broker decides where it goes and, within the rules, what it pays. The difference between what the cash earns and what the customer gets is the **sweep spread**, and it has been the subject of SEC orders, a wave of class actions and a fair share of brokers' earnings since rates rose in 2022.

There are three places a broker can put a customer's cash, and the customer's rights differ in each. It can **keep it as a free credit balance**, a liability of the broker-dealer, payable on demand, usable in the broker's business within the customer protection rule, and protected by SIPC up to $250,000 if the broker fails. It can **sweep it to banks**, where it becomes FDIC-insured deposits (pass-through, up to $250,000 per bank) that are no longer the broker's liability at all. Or it can **sweep it to a money market fund**, where it becomes fund shares, securities protected by SIPC as securities and exposed to the fund's own risks. Crypto platforms added a fourth, which ended badly: lending customers' crypto out and paying "interest" on it, which in 2022 turned out to mean the customers were unsecured creditors.

This chapter covers all of them, as of November 2026: free credit balances and their rules, bank sweep programs and what is insured, money market sweeps, the sweep spread worked through with numbers, the 2025-26 enforcement and litigation, what brokers pay on cash now, and crypto yield from BlockFi and Celsius to the GENIUS Act's ban on stablecoin interest and the fight over exchange rewards. The bank side of sweeps, reciprocal deposits and the insurance computation is in [Sweeps, Reciprocal Deposits & Yield](/books/banking-and-lending/sweeps-and-yield) and [Deposit Insurance](/books/banking-and-lending/deposit-insurance); the revenue view across firms is in [How Brokers & Exchanges Make Money](/books/investing-and-digital-assets/revenue-models) earlier in this book.

## How the Platforms Do It

Cash programs as published, as of November 2026:

| Platform | Where cash goes | What it pays | What stands out |
| --- | --- | --- | --- |
| **Fidelity** | Opening "automatically establishes a core position": in taxable accounts a money market fund (SPAXX or FZFXX) or FCASH; in retirement accounts SPAXX or "Fidelity's FDIC Insured Deposit Sweep Program" | The fund's yield, or the sweep's rate | Most of the core options are funds, not deposits; the page doesn't say which is assigned by default |
| **Robinhood** | For Gold subscribers ($5 a month): the first $10,000 "will remain as free credit balances" earning interest in its Brokerage-Held Cash Program; above $10,000 swept to 15 program banks (list as of July 1, 2026), "eligible for FDIC insurance" | "The APY is 3.60% for Robinhood Gold members as of Sept 17, 2026"; compounds daily, paid monthly on the last business day | The rate depends on "the fee, if any, paid to Robinhood by the program banks"; in February 2026 over $6 billion moved from Cash Sweep to Cash and Deposits under the updated program |
| **Schwab** (Bank Sweep) | Up to $249,000 at each of up to three program banks, then the excess to Charles Schwab Bank, SSB "without limit even if the amount exceeds the FDIC insurance available to you"; banks include Schwab's three banks and two TD Bank entities | Six balance tiers from under $25,000 to $1,000,000 and up; rates "may be established at a rate as low as possible consistent with prevailing market and business conditions" | "You will need to maintain substantial uninsured deposit balances at Schwab Bank in order to qualify for one of the highest interest rate tiers"; Schwab "may adjust eligibility for a particular sweep vehicle in part based on optimizing the financial benefits to Schwab" |
| **Interactive Brokers** | Free credit balances at the broker | A published benchmark-linked rate with balance and account-size thresholds | Terms not stated here (see below) |

Interactive Brokers publishes its credit interest formula on pricing pages that I could not open, so the table doesn't state its terms. <!-- source-gap: ida-ibkr-credit-rate | missing | IBKR credit interest formula on cash (benchmark less a spread, unpaid first $10,000, full rate above $100,000 NAV) | closes with: an opened IBKR pricing page or 10-K passage stating the formula and its as-of date | checked: 2026-11-05 -->

Three things stand out. **The default vehicle is a business decision.** Fidelity's core position choices are mostly money market funds; Schwab's Bank Sweep places cash in bank deposits at its own banks and TD Bank; Robinhood keeps the first $10,000 on its own balance sheet as free credits and sweeps the rest. Each choice decides who earns the spread and who bears the risk. **Rates are tiered and discretionary.** Schwab's disclosure says its rate can be set "as low as possible consistent with prevailing market and business conditions", and its highest tiers need uninsured balances; Robinhood's rate moves with what program banks pay it. **Insurance coverage is per bank, with an overflow.** Schwab's $249,000 placements at three banks insure $747,000 at most, and everything above lands at one bank uninsured; a customer's own deposits at those banks count against the same limit.

## Free Credit Balances

A **free credit balance** is the broker's liability "to customers which are subject to immediate cash payment to customers on demand" (Rule 15c3-3(a)(8)). The broker may "accept or use" it only if it tells each such customer, "not less frequently than once every three months", the amount the firm owes them and that "the funds are payable on demand of the customer" (15c3-3(j)(1)). It is not a deposit and it isn't insured by the FDIC. What protects it:

- **The reserve formula.** Customer free credits are a credit item in the Rule 15c3-3 reserve computation, offset by debits such as margin loans to customers; if credits exceed debits, the broker must hold the difference in a "Special Reserve Bank Account for the Exclusive Benefit of Customers". The computation is weekly, and daily for a firm whose average total credits are $500 million or more (amended at 90 FR 2790, January 13, 2025). So free credits finance customers' margin loans first, and only the excess sits in the reserve account. [The Reserve Formula](/books/investing-and-digital-assets/customer-protection#the-reserve-formula) covers the formula.
- **SIPC.** In a broker failure SIPC protects up to $500,000 per customer, "which includes a $250,000 limit for cash", for cash held "in connection with the customers' purchase or sale of securities."

For the broker, free credits are cheap balance-sheet funding that can lend to margin customers or earn the reserve account's yield. That is why the first $10,000 of a Robinhood Gold customer's cash stays as a free credit (earning interest the broker pays from its own balance sheet), and why brokers that pay little on free credits invite the sweep question below.

## Bank Sweep Programs

Rule 15c3-3 defines a **Sweep Program** as a service where a broker "offers to its customer the option to automatically transfer free credit balances" to a money market fund or an FDIC-insured bank account ((a)(17)). Moving a customer's credit balance anywhere else is prohibited (15c3-3(j)(2)) unless the customer orders it, or the transfer is to a product in a Sweep Program and:

- for accounts opened after the provision took effect, the customer gave **prior written affirmative consent** to the sweep, after notice of its general terms and that the products may change;
- the broker gives the sweep disclosures and notices its self-regulatory organizations require;
- the **quarterly statement** shows the balance in the sweep product and that it can be liquidated on the customer's order and the proceeds returned to the account or remitted; and
- the broker gives written notice **at least 30 calendar days before** changing the program's terms, adding, removing or changing products, or moving the customer from one product to another, describing the new terms and the customer's options.

Schwab's program shows the rule in practice: at least 30 days' notice of changes to program banks, 45 days for benefit plans.

Once swept, the money is a deposit at the program bank, titled to the broker as agent or custodian for its customers, and insured by **pass-through** coverage up to $250,000 per depositor per bank per ownership category ([Pass-Through Coverage](/books/banking-and-lending/deposit-insurance#pass-through-coverage)). That changes three things:

- **The broker no longer owes the money;** the bank does. SIPC doesn't cover bank deposits, and the FDIC does only once the money is at the bank.
- **The broker's records determine coverage.** The FDIC relies on the broker's records of each customer's share, exactly as for any custodial deposit ([How a Deposit Sweep Works](/books/banking-and-lending/sweeps-and-yield#how-a-deposit-sweep-works)).
- **The customer's other deposits count.** A customer with their own savings account at a program bank shares one $250,000 limit there with the sweep.

**Worked numbers: Schwab's allocation.** Schwab places up to $249,000 at each of up to three program banks, leaving room under $250,000 for accrued interest, and sends the rest to Charles Schwab Bank, SSB, its excess bank.

| Customer cash | Bank 1 | Bank 2 | Bank 3 | Excess bank | Insured if the excess bank is a fourth bank | Insured if the excess bank is also bank 1 |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| $200,000 | $200,000 | | | | $200,000 | $200,000 |
| $600,000 | $249,000 | $249,000 | $102,000 | | $600,000 | $600,000 |
| $1,000,000 | $249,000 | $249,000 | $249,000 | $253,000 | $997,000 | $748,000 |

The last row turns on a fact the customer rarely knows: whether the excess bank is one of the three placement banks. Schwab Bank, SSB is both a program bank and the excess bank in Schwab's disclosure, so if it holds the first $249,000 placement, the overflow stacks on it: $502,000 at one bank, $250,000 insured, $252,000 not. Add a $50,000 CD the customer holds directly at one of the banks, and that bank's coverage falls by up to $50,000 again. The insured figure is a computation per customer per bank per night, from the broker's placement records and the customer's disclosed other deposits, as [Worked Numbers: A $4 Million Sweep](/books/banking-and-lending/sweeps-and-yield#worked-numbers-a-4-million-sweep) shows for businesses.

## Money Market Sweeps

A money market fund sweep buys fund shares with the cash. The shares are securities in the customer's account: SIPC protects "money market mutual funds" "as securities" within the $500,000 limit, and the FDIC doesn't apply. The fund's yield is the market's (a government fund's portfolio of Treasuries and repo, less its expense ratio), the broker earns what the fund family pays it, and the conflict is smaller because the fund's rate isn't the broker's to set. Fidelity's core position choices for most accounts include its government money market fund (SPAXX). A platform that shows a fund next to deposits has to say it isn't a deposit, isn't insured and may lose value ([Money Market Funds and Treasury Products](/books/banking-and-lending/sweeps-and-yield#money-market-funds-and-treasury-products) covers the 2023 fund reforms and the disclosure rule).

The operational difference is settlement. A sweep to a fund is a purchase and a redemption, on the fund's clock, so "cash available to trade" includes fund shares the broker will redeem automatically when a purchase settles, and the ledger shows the customer holding shares, not dollars ([Double Entry in Many Units](/books/investing-and-digital-assets/ledgers-and-positions#double-entry-in-many-units)).

## The Sweep Spread

A bank sweep's economics have three rates: what the program bank pays for the deposits (close to short-term market rates for stable retail deposits, or the bank's internal funding value when the bank is an affiliate), what the broker keeps as a fee, and what the customer receives. As of November 2026 the federal funds target range is 3.75% to 4.00%, set September 17, 2026.

**Worked numbers: one customer, three programs.** A customer leaves $100,000 of cash in a brokerage account for a year. The program bank's payment is an illustrative assumption, 3.90%; the customer rates are a Robinhood-style 3.60% and an illustrative low tier of 0.05% of the kind discretionary programs paid while rates were high.

| Program | Customer rate | Customer earns | Broker and affiliated bank keep | Spread |
| --- | ---: | ---: | ---: | ---: |
| High-yield sweep with a subscription | 3.60% | $3,600 | $300 of spread + $60 of subscription | 0.30% plus the fee |
| Low-tier discretionary sweep | 0.05% | $50 | $3,850 | 3.85% |
| Government money market fund (illustrative 3.70% net yield) | 3.70% | $3,700 | What the fund pays the broker, if anything | Outside the broker's control |

The second row is the business the SEC's January 2025 orders describe: the yield gap between bank deposit sweeps and alternatives "at times grew to almost 4 percent." On a $250,000 advisory account's cash that is close to $10,000 a year.

**Worked numbers: reading it from a filing.** Schwab's bank deposit account fees, its share of the TD Bank sweep, were $345 million in the third quarter of 2026, and BDA balances were $68.0 billion at quarter-end. $345 million ÷ $68.0 billion is 0.51% for the quarter, about 2.0% annualized (approximate, because the fee accrues on average balances and $68.0 billion is the period-end balance). That is the broker's net share of those deposits' value after paying clients, and it is a fee line, not interest, because the deposits sit off Schwab's balance sheet.

**Worked numbers: rate sensitivity.** The spread's response to rates is the program's **deposit beta**, the share of a rate change passed to customers. Take $30 billion swept at a customer rate held near zero (beta 0) and a 25 basis point cut in what the banks pay: the broker's annual revenue falls by 0.25% × $30 billion = **$75 million**, all of it, because the customer rate has nowhere to fall. At beta 1 (the customer rate moves one for one) the broker's revenue doesn't change, and neither does its spread. Low-beta programs make the most when rates rise and lose every cut; high-yield programs give up the upside and keep a thin, stable spread plus whatever the customer pays to qualify. Robinhood's net interest revenue fell 9% year over year in Q3 2026, which it attributed mainly to lower securities lending and lower short-term rates, partly offset by growth in interest-earning assets.

**Worked numbers: a day of accrual.** A 3.60% APY compounding daily is a daily rate of 1.036^(1/365) − 1 = 0.0096901%. On $25,000 that is $2.4225 a day, and a 30-day month pays 25,000 × (1.036^(30/365) − 1) = **$72.78**. The daily figure isn't a whole number of cents; the accrual has to be kept at higher precision and rounded once at payment, with the remainder carried, or a million accounts each lose a fraction of a cent a day to rounding in someone's favor.

## The Sweep Suits and Settlements

When rates rose in 2022 and 2023, programs that paid customers a few basis points while the banks earned 4% or 5% became the target of regulators and plaintiffs:

- **SEC, January 17, 2025.** The SEC charged Wells Fargo Clearing Services ($28 million), Wells Fargo Advisors Financial Network ($7 million) and Merrill Lynch, Pierce, Fenner & Smith ($25 million), $60 million in total, settled without admitting or denying. The findings: bank deposit sweep programs were the only cash sweep option for most advisory clients, the firms benefited significantly, their affiliates set the rates, the yield gap "at times grew to almost 4 percent", and the firms lacked reasonably designed policies on considering clients' best interests when choosing sweep options and on advisers' duties for client cash.
- **Merrill, retirement accounts.** In *Valelly v. Merrill Lynch, Pierce, Fenner & Smith Inc.*, No. 1:19-cv-07998 (S.D.N.Y.), the court preliminarily approved a class settlement on October 7, 2026, for Merrill Edge retirement accounts swept under its Retirement Asset Savings Program from December 15, 2016 to March 15, 2020, with a final approval hearing set for March 12, 2027. <!-- source-gap: ida-merrill-valelly-amount | secondary | the settlement amount (press reports $39 million) | closes with: the settlement stipulation or the court's final approval order stating the amount | checked: 2026-11-05 --> Press reports put the amount at $39 million; the order I read doesn't state it, so I don't rely on it.
- **A dismissal.** On January 30, 2026, a federal court in Minnesota dismissed a putative class action over a cash sweep program with prejudice, holding that the terms had been disclosed, that there was no fiduciary relationship, and that the claims were barred by the independent-duty rule, which shows the other way these cases go.
- **The rest of the docket.** Class actions over sweep programs at other large brokers and banks (Morgan Stanley and E*Trade, Schwab, JPMorgan, Wells Fargo, LPL, Stifel and others) followed the same theory. <!-- source-gap: ida-sweep-docket-status | secondary | current status of the Morgan Stanley/E*Trade, Schwab, JPMorgan, Wells Fargo, LPL and Stifel sweep class actions | closes with: CourtListener dockets or each firm's latest 10-Q legal proceedings note | checked: 2026-11-05 --> I could open neither the dockets nor the filings' legal proceedings notes for their current status, so I don't characterize individual outcomes.

The related case on the advisory side is the SEC's June 2022 order against Schwab Intelligent Portfolios, $186.5 million in total, over model portfolios that held 6% to 29.4% cash so the affiliated bank earned a spread, which belongs to [Robo-Advisors & Model Portfolios](/books/investing-and-digital-assets/robo-advisors#cash-drag-and-the-schwab-order).

What the cases mean for the system: the sweep vehicle, the rate, who set it, what alternatives existed and what the customer was told are evidence, by date. A broker that can produce, for any account and day, the vehicle the cash was in, the rate paid, the rate the bank paid, the alternatives offered and the disclosure version in force can defend its program; one that can't is settling.

## What Brokers Pay on Cash Now

After the suits, the market split. Programs that pay close to market on cash, usually for a subscription or above a balance threshold (Robinhood's 3.60% for Gold, money market fund core positions like Fidelity's), compete with programs that keep a discretionary bank sweep as the default with tiered rates (Schwab's six tiers). IBKR pays on free credit balances by a benchmark-linked formula whose terms I couldn't confirm. The engineering consequence is the same everywhere: the rate is a function of the account, its balance tier, its subscription and the date, it changes with notice, and every day's accrual must be reproducible from the rate schedule in force that day.

## Crypto Yield: BlockFi, Celsius and Gemini Earn

Before 2022, crypto platforms paid "interest" on deposited crypto by lending it to trading firms or deploying it themselves. The customer's right to the asset depended on terms most never read, and the record is a set of enforcement actions and bankruptcy rulings:

- **BlockFi, February 14, 2022.** BlockFi agreed to pay a "$50 million penalty" to the SEC and "an additional $50 million in fines to 32 states", and to pursue registration of its lending product. The SEC found its BlockFi Interest Accounts were securities.
- **Celsius, January 4, 2023.** In Celsius's bankruptcy the court held that under its "unambiguous Terms of Use" crypto deposited in Earn accounts "became Celsius's property" and was property of the estate: about 600,000 Earn accounts holding about $4.2 billion (July 10, 2022), whose holders became unsecured creditors. The terms decided it; segregation would have decided the rest ([Omnibus and Segregated](/books/investing-and-digital-assets/ledgers-and-positions#omnibus-and-segregated)).
- **Genesis and Gemini Earn.** Gemini's Earn program lent customers' crypto to Genesis, which froze withdrawals in 2022. The SEC settled with Genesis on March 19, 2024 for a $21 million penalty, paid only after other claims, over crypto from 340,000 Gemini Earn investors worth about $900 million. New York's Attorney General settled with Genesis on May 20, 2024 in a deal "worth $2 billion" for victims, alleging Genesis and others "concealed more than $1.1 billion in losses from investors", and on June 14, 2024 secured about $50 million in digital assets from Gemini for Earn's "more than 230,000 investors", barring Gemini from crypto lending programs in New York.

Each failure is a ledger question before it is a legal one: whose asset was it, where was it, and could the platform prove it. A crypto yield product is a loan of the customer's asset, and the account must show that it left the customer's custody, to whom, on what terms and with what collateral, not a balance that kept growing.

## Stablecoin Interest and the Rewards Debate

The GENIUS Act (Pub. L. 119-27) closes the issuer side: "No permitted payment stablecoin issuer or foreign payment stablecoin issuer shall pay the holder of any payment stablecoin any form of interest or yield (whether in cash, tokens, or other consideration) solely in connection with the holding, use, or retention of such payment stablecoin" (12 USC 5903(a)(11)). The Act and the OCC's implementing rule take effect January 18, 2027 ([The GENIUS Act](/books/payments/stablecoins#the-genius-act) covers the rest of the Act for a payment provider).

The question it leaves is whether a platform that isn't the issuer may pay **rewards** to customers holding the stablecoin, as exchanges do. The economics explain why they want to: under Coinbase's 2023 collaboration agreement with Circle, reserve income on USDC is shared, with each party receiving income proportional to the USDC held in its own products and Coinbase "entitled to fifty percent (50%) of the Residual Payment Base", so an exchange that keeps more USDC on its platform earns more, and paying customers to hold it is a distribution cost. Coinbase's institutional documentation describes USDC rewards that "accumulate on a daily basis", are "paid out monthly on the 7th of the calendar month", with eligibility depending "on legal entity structure and jurisdiction".

Where it stands as of November 2026:

- **The OCC's final rule** (FR Doc. 2026-21706, published October 23, 2026, effective January 18, 2027) restates the prohibition for the issuers it supervises (12 CFR 15.10(c)(4)) and **drops the proposed rebuttable presumption** that a payment of yield by an issuer's affiliate or a related third party was a violation: "the OCC has determined to eliminate the rebuttable presumption from the final rule." It keeps anti-evasion authority, says it "would clearly evade the statutory prohibition on yield for an issuer to merely pay another entity to make an interest or yield payment that the issuer could not make directly", treats payments through intermediaries case by case, gives no safe harbor to programs that predate the Act ("Congress could have provided a safe harbor for such programs but did not do so"), and says payments "for bona fide services generally would not be prohibited."
- **The CLARITY Act** (H.R. 3633), introduced May 29, 2025, passed the House 294 to 134 on July 17, 2025. The yield compromise brokered by Senators Tillis and Alsobrooks and released May 1, 2026, carried into the Senate Banking Committee's May 12, 2026 text, would prohibit "interest or yield on idle stablecoin balances while permitting activity-based rewards". <!-- source-gap: ida-clarity-compromise | secondary | the substance of the Tillis-Alsobrooks yield compromise and the 15-9 committee tally | closes with: the committee-reported bill text or the committee's markup record | checked: 2026-11-05 --> The committee ordered the bill reported with a substitute on May 14, 2026 (15 to 9, as press reports the tally) and reported it to the Senate calendar on June 1, 2026. Cloture on the motion to proceed failed 49 to 50 on September 15, 2026, and the latest action, as of November 2026, is Senator Tillis's motion to reconsider that vote.

So as of November 2026 an issuer may not pay yield, the OCC won't presume that an affiliate's or partner's rewards are the issuer's, and a platform's rewards program is judged on its facts under the Act's anti-evasion reach, with Congress's market structure bill stalled. A product team that builds a rewards feature on a stablecoin should be able to show what each payment is for (activity, a bona fide service, a promotion) and who funds it.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `accounts`, `instruments` (USD and each money market fund), `positions` (fund shares), `transfers`, `journal_entries`, `legal_entities` and `disclosures`. Where cash is swept to banks, the program and its banks reuse Banking & Lending's `sweep_programs`, `sweep_program_banks` and `sweep_exclusions` ([How to Build It](/books/banking-and-lending/sweeps-and-yield#how-to-build-it)) with the brokerage account as the swept account, and `sweep_balances` below is the broker's version of its per-night `sweep_placements`; the insured amount comes from [Deposit Insurance](/books/banking-and-lending/deposit-insurance#how-to-build-it)'s determination over those balances. What a broker adds is the cash vehicle per account and date, the consent and notices 15c3-3(j) requires, tiered rate schedules, daily accruals and crypto reward programs.

```sql
CREATE TABLE cash_vehicles (                  -- the products cash can sit in
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  kind               TEXT NOT NULL CHECK (kind IN ('free_credit', 'bank_sweep', 'mmf_sweep')),
  sweep_program_id   UUID REFERENCES sweep_programs (id),    -- for bank sweeps
  fund_instrument_id UUID REFERENCES instruments (id),       -- for money market sweeps
  per_bank_target    BIGINT,                   -- e.g. 24900000 minor units, under the $250,000 limit
  max_banks          SMALLINT,
  excess_institution_id UUID,                  -- where overflow goes
  valid_during       DATERANGE NOT NULL
);

CREATE TABLE sweep_elections (                -- which vehicle each account's cash is in, by date
  account_id         UUID NOT NULL REFERENCES accounts (id),
  cash_vehicle_id    UUID NOT NULL REFERENCES cash_vehicles (id),
  balance_from       BIGINT NOT NULL DEFAULT 0, -- tiered placement: first $10,000 free credit, the rest swept
  balance_to         BIGINT,
  consent_id         UUID REFERENCES sweep_consents (id),
  valid_during       DATERANGE NOT NULL,
  PRIMARY KEY (account_id, cash_vehicle_id, balance_from, valid_during)
);

CREATE TABLE sweep_consents (                 -- 15c3-3(j)(2)(ii)(A): prior written affirmative consent
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  disclosure_id      UUID NOT NULL REFERENCES disclosures (id),  -- the terms shown
  consented_at       TIMESTAMPTZ NOT NULL,
  method             TEXT NOT NULL
);

CREATE TABLE sweep_change_notices (           -- 30 calendar days before any change
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  cash_vehicle_id    UUID NOT NULL REFERENCES cash_vehicles (id),
  change_kind        TEXT NOT NULL CHECK (change_kind IN ('terms', 'add_product', 'remove_product',
                       'change_product', 'move_customers', 'program_bank')),
  disclosure_id      UUID NOT NULL REFERENCES disclosures (id),
  sent_on            DATE NOT NULL,
  effective_on       DATE NOT NULL,
  CHECK (effective_on >= sent_on + 30)
);

CREATE TABLE cash_rate_tiers (                -- tiered, effective-dated rates
  cash_vehicle_id    UUID NOT NULL REFERENCES cash_vehicles (id),
  tier_from          BIGINT NOT NULL,
  tier_to            BIGINT,
  eligibility        TEXT NOT NULL DEFAULT 'all',  -- 'all', 'subscription:gold', 'household_assets>=...'
  customer_apy_bps   NUMERIC(10,4) NOT NULL,
  bank_rate_bps      NUMERIC(10,4),            -- what the program bank pays, for the spread record
  valid_during       DATERANGE NOT NULL,
  PRIMARY KEY (cash_vehicle_id, tier_from, eligibility, valid_during)
);

CREATE TABLE sweep_balances (                 -- each account's cash by vehicle and bank, per business date
  account_id         UUID NOT NULL REFERENCES accounts (id),
  business_date      DATE NOT NULL,
  cash_vehicle_id    UUID NOT NULL REFERENCES cash_vehicles (id),
  institution        TEXT NOT NULL,            -- the program bank, the excess bank, the broker itself or the fund
  principal          BIGINT NOT NULL CHECK (principal >= 0),
  accrued_interest   BIGINT NOT NULL DEFAULT 0,
  over_target        BOOLEAN NOT NULL,         -- overflow above per_bank_target, uninsured unless covered elsewhere
  PRIMARY KEY (account_id, business_date, cash_vehicle_id, institution)
);

CREATE TABLE cash_interest_accruals (         -- one row per account per day, kept at high precision
  account_id         UUID NOT NULL REFERENCES accounts (id),
  accrual_date       DATE NOT NULL,
  cash_vehicle_id    UUID NOT NULL REFERENCES cash_vehicles (id),
  balance            BIGINT NOT NULL,          -- minor units in the vehicle that day
  daily_rate         NUMERIC(20,16) NOT NULL,  -- from the APY: (1 + apy)^(1/365) - 1
  accrued            NUMERIC(24,8) NOT NULL,   -- fractional cents allowed here
  bank_paid          NUMERIC(24,8),            -- the bank's side, for spread reporting
  paid_entry_id      UUID REFERENCES journal_entries (id),  -- set on the monthly payment
  PRIMARY KEY (account_id, accrual_date, cash_vehicle_id)
);

CREATE TABLE crypto_reward_programs (         -- rewards on stablecoins or other holdings
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  instrument_id      UUID NOT NULL REFERENCES instruments (id),
  basis              TEXT NOT NULL CHECK (basis IN ('activity', 'bona_fide_service', 'promotion', 'holding')),
  funded_by          TEXT NOT NULL,            -- the platform, the issuer under an agreement, a partner
  agreement_ref      TEXT,                     -- e.g. the issuer revenue-share agreement
  legal_review_ref   TEXT NOT NULL,            -- the analysis under 12 USC 5903(a)(11) and the OCC rule
  eligible_jurisdictions TEXT[] NOT NULL,
  accrual            TEXT NOT NULL,            -- 'daily'
  payout_schedule    TEXT NOT NULL,            -- 'monthly:7'
  valid_during       DATERANGE NOT NULL
);
```

The month's interest payment, rounding once per account and carrying the remainder into the next month's first accrual:

```sql
WITH month AS (
  SELECT account_id, SUM(accrued) AS accrued
  FROM cash_interest_accruals
  WHERE accrual_date >= :month_start AND accrual_date < :next_month AND paid_entry_id IS NULL
  GROUP BY account_id
)
SELECT account_id,
       FLOOR(accrued)              AS pay_cents,      -- posted as interest to the customer
       accrued - FLOOR(accrued)    AS carry_cents     -- added to next month's first accrual
FROM month;
```

How it runs:

1. **Each night, allocate each account's cash** across its elections in balance order (free credit up to its tier, then the sweep), and for a bank sweep compute target balances per bank under `per_bank_target`, `max_banks` and the customer's exclusions; write `sweep_balances` for the business date and post movements at settlement, as Banking & Lending's sweep does.
2. **Accrue interest daily** from the rate schedule in force that day for the account's tier and eligibility, at high precision, with the bank's rate beside it.
3. **Pay monthly** by the query above, one journal entry per account; for free credits the expense is the broker's, for bank sweeps the bank's payment passes through less the broker's fee.
4. **Before any change, send notices** and refuse to make the change effective earlier than 30 days after sending; new accounts can't be swept without a consent row.
5. **Run the insurance determination** nightly over `sweep_balances` plus the customer's disclosed other deposits, and show the customer last night's insured figure.

Design notes:

- **Vehicles, elections and rates are effective-dated,** so any account's cash on any day has an answer: which vehicle, what rate, what the bank paid, what the customer was told. That is the evidence a sweep case turns on.
- **The spread is recorded, not inferred.** Storing `bank_paid` next to `accrued` makes the spread per account per day a query, for the firm's own best-interest review and for a regulator.
- **Free credits and sweeps are different ledgers.** A free credit is a broker liability in the reserve computation; a sweep balance is a deposit at a bank, outside it; a fund sweep is a security position. The account view adds them up; the books never do.
- **Rewards are entries with a basis.** A crypto reward posts as a payment from a funded firm account with the program's basis and funding source, never as a balance increase on the customer's holding, so the program's legal characterization survives an audit.

## Auditing

FINRA and the SEC examine sweep programs for consent, notices and conflicts; the FDIC relies on sweep records in a bank failure; state regulators examine crypto rewards. Keep:

- **Each account's cash vehicle, tier and rate by day,** with the program bank placements and the bank's rate.
- **Every consent and every change notice** with the disclosure version and the 30-day clock.
- **Quarterly statements** showing free credit balances and sweep balances with the 15c3-3(j) language.
- **Daily accruals and monthly payments,** with rounding carries, reproducible from the rate schedules.
- **The insured amount shown to each customer** and the determination behind it.
- **Each crypto reward program's legal analysis,** funding source and every payment.

## What This Means for the System You Build

- **Treat the cash vehicle as a dated election** with consent, not a setting, and never sweep a new account without a consent row.
- **Enforce the 30-day notice** in the data model before any program change.
- **Compute insured amounts per customer per bank per night,** including overflow to an excess bank and the customer's own deposits.
- **Record the bank's rate next to the customer's** so the spread and its history are queryable.
- **Accrue at high precision and round once,** carrying the remainder.
- **Keep free credits, bank sweeps and fund sweeps in separate ledgers** with their own protections: SIPC for the first and third, FDIC for the second.
- **Give every crypto reward a basis and a funder,** reviewed against the GENIUS Act's interest ban and the OCC's anti-evasion stance, and expect the rules to move.

## References

**Law and regulation**

- [GovInfo: Bill status for H.R. 3633, Digital Asset Market Clarity Act (119th Congress)](https://www.govinfo.gov/bulkdata/BILLSTATUS/119/hr/BILLSTATUS-119hr3633.xml), introduction, House passage, the Banking Committee substitute, the September 15, 2026 cloture vote and the motion to reconsider
- [17 CFR 240.15c3-3: Customer protection, reserves and custody of securities](https://www.law.cornell.edu/cfr/text/17/240.15c3-3), free credit balances (a)(8), the Sweep Program definition (a)(17), the quarterly statement (j)(1), sweep consent and 30-day notice conditions (j)(2), the reserve accounts and weekly or daily computation (e)
- [12 USC 5903: Requirements for issuing payment stablecoins](https://www.law.cornell.edu/uscode/text/12/5903), the prohibition on interest or yield in (a)(11)
- [Federal Register: OCC, Implementing the GENIUS Act (FR Doc. 2026-21706, public inspection)](https://public-inspection.federalregister.gov/2026-21706.pdf), 12 CFR 15.10(c)(4), elimination of the rebuttable presumption, anti-evasion, intermediaries, no safe harbor for pre-Act rewards, bona fide services

**Regulators and guidance**

- [OCC: News Release 2026-92 (October 21, 2026)](https://www.occ.gov/news-issuances/news-releases/2026/nr-occ-2026-92.html), the final rule and the January 18, 2027 effective date
- [Federal Reserve: Open market operations](https://www.federalreserve.gov/monetarypolicy/openmarket.htm), the 3.75% to 4.00% target range set September 17, 2026
- [SIPC: What SIPC protects](https://www.sipc.org/for-investors/what-sipc-protects), $500,000 including $250,000 for cash, money market funds as securities, digital assets and stablecoins excluded

**Courts and enforcement**

- [SEC: Press release 2025-16 (January 17, 2025)](https://www.sec.gov/newsroom/press-releases/2025-16), Wells Fargo and Merrill cash sweep orders, penalties, findings and the "almost 4 percent" yield gap
- [Valelly v. Merrill Lynch, Pierce, Fenner & Smith Inc., No. 1:19-cv-07998-VEC (S.D.N.Y.), order granting preliminary approval (October 7, 2026)](https://www.classaction.org/media/merrill-lynch-settlement-prelim-approval-order.pdf), the class, period and March 12, 2027 final approval hearing
- [Orrick InfoBytes: District court dismisses putative class action over cash sweep program (February 6, 2026)](https://infobytes.orrick.com/2026-02-06/district-court-sides-with-bank-dismisses-putative-class-action-over-cash-sweep-program/), the January 30, 2026 dismissal with prejudice and its grounds
- [SEC: In the Matter of Charles Schwab & Co. and affiliates (Rel. 34-95087, June 13, 2022)](https://www.sec.gov/litigation/admin/2022/34-95087.pdf), Schwab Intelligent Portfolios cash allocations of 6% to 29.4% and the $186.5 million total
- [SEC: Press release 2022-26 (February 14, 2022)](https://www.sec.gov/newsroom/press-releases/2022-26), BlockFi's $50 million SEC penalty, $50 million to 32 states, interest accounts as securities
- [In re Celsius Network LLC, No. 22-10964 (Bankr. S.D.N.Y. January 4, 2023)](https://www.nysb.uscourts.gov/sites/default/files/opinions/312902_1822_opinion.pdf), Earn assets as estate property, about 600,000 accounts and $4.2 billion
- [SEC: Press release 2024-37 (March 19, 2024)](https://www.sec.gov/newsroom/press-releases/2024-37), Genesis's $21 million penalty, 340,000 Gemini Earn investors, about $900 million
- [New York Attorney General: Genesis settlement (May 20, 2024)](https://ag.ny.gov/press-release/2024/attorney-general-james-secures-settlement-worth-2-billion-crypto-firm-genesis), a settlement worth $2 billion and $1.1 billion of concealed losses
- [New York Attorney General: Gemini recovery (June 14, 2024)](https://ag.ny.gov/press-release/2024/attorney-general-james-recovers-50-million-crypto-firm-gemini-defrauded), about $50 million, more than 230,000 Earn investors, the New York lending bar

**Filings**

- [Schwab: Q3 2026 earnings release (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/316709/000031670926000035/a3q26exhibit991.htm), transactional sweep cash of $492.8 billion, net interest margin 3.04%, BDA fees of $345 million and BDA balances of $68.0 billion
- [Robinhood: Q3 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000164/q32026robinhoodexhibit991.htm), Cash Sweep of $32.3 billion, the February 2026 move to Cash and Deposits, net interest revenue down 9% and its causes
- [Circle and Coinbase: Collaboration Agreement (August 18, 2023), filed as an exhibit](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000062/coinbasecollaborationagree.htm), the payment base, per-platform shares and Coinbase's 50% of the residual

**Vendor documentation**

- [Schwab: Cash Features Program Disclosure Statement (October 2026)](https://disclosures.schwab.com/SchwabDashboard/61678/REG90540.pdf), program banks, $249,000 per bank up to three, the excess bank without limit, six tiers, rate setting, the uninsured-balance tiers, conflicts and notice periods
- [Robinhood: High-Yield Cash program](https://robinhood.com/us/en/support/articles/high-yield-cash-program/), 3.60% APY as of September 17, 2026, the first $10,000 as free credit balances, 15 program banks as of July 1, 2026, fees from program banks, daily compounding and monthly payment, eligibility
- [Fidelity: Account FAQs](https://www.fidelity.com/trading/faqs-about-account), the core position and its fund, FCASH and FDIC sweep options
- [Coinbase Prime: USDC rewards](https://docs.cdp.coinbase.com/prime/concepts/stablecoins/usdc-rewards), daily accrual, monthly payout on the 7th, eligibility by legal entity and jurisdiction

**In practice**

- [Latham & Watkins: US crypto policy tracker, legislative developments (updated August 2026)](https://www.lw.com/en/us-crypto-policy-tracker/legislative-developments), CLARITY Act House passage, the Senate Banking yield compromise of May 12, 2026, the 15-9 committee vote and placement on the calendar
- [Baker McKenzie: The CLARITY Act's yield compromise (May 5, 2026)](https://blockchain.bakermckenzie.com/2026/05/05/the-clarity-acts-yield-compromise-what-the-senate-actually-agreed-to-and-why-it-matters/), the Tillis-Alsobrooks compromise released May 1, 2026
