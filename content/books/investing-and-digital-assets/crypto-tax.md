+++
title = "Crypto Tax"
description = "Crypto as property: disposals and swaps, staking, mining and airdrop income, Jarrett, DeFi, the broker rules and 1099-DA, per-wallet basis, wash sales, CARF."
category = "Investing & Digital Assets Industry"
order = 2574
part = "The Rules"
tags = ["crypto-tax", "1099-da", "staking", "airdrops", "rev-rul-2023-14", "brokers", "carf"]
+++

For US federal tax, a bitcoin is not money. It is property, like a share of stock or a painting, and that one classification decides almost everything: every time a customer gives up a unit (for dollars, for another token, for a cup of coffee, or to pay a network fee) they have sold property and owe tax on the difference between what they got and what they paid. Every time they receive a unit without paying for it (a staking reward, a mined block, an airdrop) they have income equal to its value, and that value becomes the unit's basis for the day they sell it. A customer who never cashes out to dollars can still owe tax on every trade they made.

A platform sits on both sides of that. It is the customer's record: the only place that knows when each unit arrived, at what value, and when it left. Since 2025 it is also, if it holds customers' assets, a broker reporting to the IRS on Form 1099-DA, with gross proceeds from 2025 and basis from 2026. The rules that tell the customer what they owe and the rules that tell the broker what to report overlap but aren't the same, and the gap between them (income the broker doesn't report, basis it doesn't know, transactions it never saw) is what the customer's own return has to fill.

This chapter covers the authorities and how they fit, property treatment, disposals including swaps and fees, income from staking, mining and airdrops with worked numbers, the Jarrett litigation, DeFi transactions, the broker's side after the 2025 repeal of the DeFi broker rule, and the international reporting regimes. The lot engine, per-wallet basis under Rev. Proc. 2024-28 and wash sales are in [Cost Basis, Tax Lots & Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots); the 1099-DA's boxes and timeline are in [Confirms, Statements & Tax Forms](/books/investing-and-digital-assets/statements-and-tax-forms#form-1099-da-and-its-timeline). This chapter links to them and doesn't repeat them.

## How the Rules Fit Together

Crypto tax in the US is a statute that doesn't mention crypto, a handful of IRS rulings and notices, and one set of broker regulations. As of November 2026:

| Authority | Date | What it decides | For whom |
| --- | --- | --- | --- |
| **Notice 2014-21** | 2014 | Virtual currency "is treated as property"; income at fair market value when received for services or mined; exchanges produce gain or loss | Taxpayers |
| **Rev. Rul. 2019-24** | 2019 | A hard fork with no new units is not income; an airdrop of new units after a fork is ordinary income when the taxpayer has dominion and control | Taxpayers |
| **Rev. Rul. 2023-14** | July 2023 | Staking rewards are income at fair market value when the taxpayer gains dominion and control, including staking through an exchange | Taxpayers |
| **Final broker regulations (T.D. 10000)** | July 2024 (89 FR 56480) | Custodial brokers report gross proceeds from 2025 and basis from 2026 on Form 1099-DA; basis is tracked per wallet or account from 2025 | Brokers and taxpayers |
| **Rev. Proc. 2024-28** | June 2024 | Safe harbor to allocate unused basis to each wallet or account as of January 1, 2025 | Taxpayers |
| **T.D. 10021 and its repeal** | December 2024; repealed April 10, 2025 (Public Law 119-5) | Would have made DeFi trading front ends brokers; disapproved under the Congressional Review Act and removed | Front ends (no longer) |
| **Notices 2024-56, 2024-57, 2025-33, 2026-20** | 2024 to 2026 | Transition relief: penalties, backup withholding, transactions not yet reported, and identification of units on the taxpayer's own books | Brokers and taxpayers |
| **IRS FAQs on virtual currency** | Updated June 30, 2026 | The IRS's answers on basis, holding periods, swaps, forks, airdrops, gifts and identification, for transactions before 2025 | Taxpayers |

The FAQs say they "generally apply to transactions involving digital assets completed before Jan. 1, 2025"; from 2025 the regulations govern identification and reporting. The underlying treatment (property, income at receipt, gain on disposal) hasn't changed.

## Property, Not Currency

Notice 2014-21: "For federal tax purposes, virtual currency is treated as property. General tax principles applicable to property transactions apply to transactions using virtual currency." It is not foreign currency, so there is no currency gain or loss rule and no exemption for small purchases. Three consequences carry through every case below:

- **Value in dollars at the time.** Income and amounts realized are measured at "the fair market value of the virtual currency, measured in U.S. dollars, as of the date that the virtual currency was received," using an exchange rate determined "in a reasonable manner that is consistently applied." A platform's price source and timestamp are therefore tax data, kept with the event.
- **Holding period from the next day.** The holding period "begins the day after it is received" (FAQ 29); more than one year is long-term.
- **No de minimis.** "You must report income, gain, or loss from all taxable transactions involving virtual currency" (FAQ 42). The 1099-DA's thresholds for stablecoins and NFTs are reporting thresholds for brokers, not exemptions for taxpayers.

Moving units between one's own wallets is not a disposal: FAQ 38 calls a transfer between your own wallets "a non-taxable event." The Form 1040 question draws the same line. It asks whether, at any time during the year, the taxpayer did "(a) receive (as a reward, award or payment for property or services); or (b) sell, exchange, or otherwise dispose of a digital asset," and the IRS says "No" covers only holding, buying with dollars and moving between one's own wallets. Paying a transaction fee in a digital asset counts as a transaction.

## Disposals

A disposal is any time the customer gives up units for something: dollars, goods, services, or another digital asset. "If you exchange virtual currency ... for goods or for another virtual currency, you will recognize a capital gain or loss" (FAQ 16). A swap of one token for another is two things at once: a sale of the first token at the value of what was received, and a purchase of the second with that value as basis.

### Worked numbers: a swap is a disposal

A customer bought 1.0 ETH on Saturday, January 10, 2026 for $3,200.00 (fees included in basis, FAQ 8). On Thursday, October 1, 2026, with ETH at $3,000.00 and SOL at $150.00, they swap the 1.0 ETH for 20 SOL. Leaving network and trading fees aside:

| | Amount |
| --- | ---: |
| Amount realized on the ETH (fair value of the 20 SOL received) | $3,000.00 |
| Basis of the ETH | $3,200.00 |
| **Short-term capital loss** (held January 10 to October 1) | **−$200.00** |
| Basis of the 20 SOL | $3,000.00 ($150.00 each) |
| SOL holding period starts | Friday, October 2, 2026 |

No dollars moved, and the customer has a reportable loss and a new lot. If they swap back to ETH the next day, the $200 loss stands: section 1091 reaches "stock or securities," and an ETH that isn't a security isn't one ([Digital Assets and Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots#digital-assets-and-wash-sales)). If the swap ran through the platform's custody, it is a sale the platform reports on the 1099-DA; if the customer signed it in their own wallet through a front end, nobody reports it and the customer still owes it ([The DeFi Broker Rule and Its Repeal](/books/investing-and-digital-assets/defi-from-a-regulated-platform#the-defi-broker-rule-and-its-repeal)).

**Fees are small disposals.** A network fee paid in ETH gives up units, so each gas payment is a disposal of those units at their value. The broker regulations govern how a custodial broker allocates transaction costs to proceeds and basis; the customer's own wallet activity has to be computed by the customer. Spending crypto at a merchant is the same as a swap: the amount realized is the value of what was bought.

## Income at Receipt

Units received without paying for them are income at their fair market value when the taxpayer can use them, and that value becomes their basis. Three sources lead.

### Staking

Rev. Rul. 2023-14 holds that a cash-method taxpayer includes "the fair market value of the validation rewards received ... in the taxable year in which the taxpayer gains dominion and control over the validation rewards," with "the fair market value ... determined as of the date and time the taxpayer gains dominion and control." It applies the same rule when "a taxpayer stakes cryptocurrency native to a proof-of-stake blockchain through a cryptocurrency exchange and the taxpayer receives additional units." In the ruling's facts, rewards locked until a later date are income when the lock ends and they can be sold, not when the chain credits them. The ruling leaves out section 83 and gas fees. The product side, including how a platform credits rewards and handles its commission, is [Staking as a Product](/books/investing-and-digital-assets/staking#tax).

### Worked numbers: staking income, then a sale

A customer's staked ETH earns 0.5 ETH, credited and withdrawable on the platform at 14:00 UTC on Tuesday, March 3, 2026, when ETH is $2,400.00.

1. **At receipt:** **$1,200.00 of ordinary income** for 2026 (0.5 × $2,400.00). A new lot opens: 0.5 ETH, basis $1,200.00, holding period from Wednesday, March 4.
2. **Sale at a gain:** on Tuesday, September 15, 2026 the customer sells the 0.5 ETH at $3,000.00 for $1,500.00. Gain: $1,500.00 − $1,200.00 = **$300.00 short-term** (held under a year). The year's total from the reward: $1,200.00 ordinary plus $300.00 capital.
3. **Sale at a loss instead:** if ETH had fallen to $2,000.00, proceeds are $1,000.00 and the result is a **$200.00 short-term capital loss**. The $1,200.00 of ordinary income doesn't change. The customer paid tax on value they never got, and the loss that offsets it is capital, which offsets ordinary income only up to the annual limit.

That asymmetry is why the timing of staking income was litigated. For the platform, step 1 is the event it must record: the timestamp of dominion and control, the price source and value, and the lot it opens. The 1099-DA doesn't report the income (Notice 2024-57 excludes staking transactions from 1099-DA reporting for now, though not the rewards themselves from tax), so the customer depends on the platform's records to report it.

### Jarrett

The Jarretts staked Tezos and received 8,876 new tokens in 2019, then sued for a refund of $3,793 of tax on the theory that newly created tokens are not income until sold. The IRS sent a refund check for $4,001.83, which the Jarretts didn't cash, and argued the case was moot. The Sixth Circuit agreed on August 18, 2023 (No. 22-6023): "the IRS's refund check mooted this case," and the court couldn't grant the declaratory or injunctive relief they wanted. On the IRS's new ruling it said "whatever it portends for future tax years, the ruling has no bearing on Jarrett's 2019 taxes," and that "Whether the IRS can tax cryptocurrency at creation, it is true, might well arise again." <!-- source-gap: ida-jarrett-ii-status | status | the status of the Jarretts' second refund suit over later tax years (M.D. Tenn. No. 3:24-cv-01209) | closes with: the CourtListener or PACER docket, opened | checked: 2026-11-05 --> The Jarretts later filed a second suit over later years, and I couldn't open its docket, so I don't state where it stands. Rev. Rul. 2023-14 is the IRS's position; no appellate court has decided the question on the merits.

### Mining

"When a taxpayer successfully 'mines' virtual currency, the fair market value of the virtual currency as of the date of receipt is includible in gross income" (Notice 2014-21). If the mining "constitutes a trade or business, and the 'mining' activity is not undertaken by the taxpayer as an employee," the net earnings are self-employment income subject to self-employment tax. A platform rarely sees mining directly; it sees mined coins arrive as deposits with no basis it can rely on, which is the transferred-in case in [Transferred Basis](/books/investing-and-digital-assets/cost-basis-and-tax-lots#transferred-basis).

### Airdrops and forks

Rev. Rul. 2019-24: a taxpayer "does not have gross income ... as a result of a hard fork" if no new units are received, and "has gross income, ordinary in character" from "an airdrop of a new cryptocurrency following a hard fork if the taxpayer receives units of new cryptocurrency." Receipt requires dominion and control. In the ruling, units credited to an exchange account that doesn't support the new coin aren't received: "If the taxpayer later acquires the ability to transfer, sell, exchange, or otherwise dispose of the cryptocurrency, the taxpayer is treated as receiving the cryptocurrency at that time." Basis equals the income recognized; soft forks produce no income (FAQ 30).

### Worked numbers: an airdrop through an exchange

A protocol airdrops 1,000 XYZ to every eligible address on Monday, June 1, 2026, when XYZ trades at $0.40. A customer's units are in the platform's omnibus wallet, and the platform doesn't support XYZ yet.

- **Self-custody holder:** the airdrop is "recorded on the distributed ledger" on June 1 in their own wallet. Income: **$400.00** ordinary, basis $400.00, holding period from June 2.
- **The platform's customer:** the units sit in an address the customer can't use. When the platform lists XYZ and credits the customer on Tuesday, August 4, 2026, at $0.55, the customer is treated as receiving it then. Income: **$550.00**, basis $550.00, holding period from August 5.

The platform's choice of whether and when to support an airdrop moves its customers' income and basis ([Chain Events](/books/investing-and-digital-assets/corporate-actions#chain-events)). The credit time and price are tax facts it must record and show; a decision never to credit means the customer never receives the units at all.

## DeFi, Wrapping and Lending

Most of what happens in decentralized finance has no specific IRS answer. <!-- source-gap: ida-defi-tax-guidance | status | that the IRS has published no ruling or regulation on whether wrapping, providing liquidity, or lending digital assets is a disposal | closes with: an opened IRS page, notice or ruling stating the treatment, or confirming none issued | checked: 2026-11-05 --> I found no ruling or regulation on whether wrapping ETH, depositing tokens into a liquidity pool, or lending them through a protocol is a disposal, and the general rules point both ways: each gives up one asset and receives another (a wrapped token, a pool share, a receipt token), which looks like an exchange, yet the holder often keeps the economic exposure, which looks like no disposal at all. Notice 2024-57 lets brokers skip 1099-DA reporting for wrapping and unwrapping, liquidity provision, staking, lending and short sales until further guidance, and the IRS adds that "This reporting exception does not apply to rewards or other compensation earned by participants in these transactions." That is a reporting rule only; it doesn't decide the tax.

My default for a platform is to record every such transaction as two legs (asset given, asset received, values at the time) and let the customer's tax treatment choose how to read them, because records that collapse a wrap into "no event" can't be reconstructed later if guidance says it was one. Rewards earned in any of them (interest, liquidity incentives, protocol tokens) are income events under the general rule and are recorded as such.

## The Broker's Side

A platform's tax reporting duties are narrower than its customers' tax, and it helps to keep the two apart:

- **Who is a broker.** After Congress disapproved T.D. 10021 (Public Law 119-5, April 10, 2025) and Treasury removed it (90 FR 30825, July 11, 2025), the broker rules apply to platforms that take custody of customers' assets. The IRS's page on the 2024 rules says they "do not include reporting requirements" for "decentralized or non-custodial brokers." The history and what it leaves are in [The DeFi Broker Rule and Its Repeal](/books/investing-and-digital-assets/defi-from-a-regulated-platform#the-defi-broker-rule-and-its-repeal).
- **What it reports.** Gross proceeds for sales from January 1, 2025; basis for covered assets (acquired in the broker's custodial account after 2025) from January 1, 2026; thresholds and aggregate reporting for qualifying stablecoins and specified NFTs. The form, its boxes and its corrections are in [Form 1099-DA and Its Timeline](/books/investing-and-digital-assets/statements-and-tax-forms#form-1099-da-and-its-timeline).
- **What it doesn't report.** Staking and airdrop income, wrapping and lending (for now, Notice 2024-57), transfers out to the customer's own wallets and anything that happens there, and basis for units transferred in. The customer's return covers all of it, from the platform's records if the platform keeps them.
- **Backup withholding.** Notice 2025-33 says backup withholding "will not be required on any digital asset sale effected by a broker during calendar year 2025 or calendar year 2026," extends TIN-matching relief for customers with accounts opened before 2026 to sales in 2027, and caps withholding where units must be liquidated to fund it at 24%. A platform's withholding engine has to be built and dark, ready for 2027.
- **Identification.** From 2025, units held with a broker are relieved earliest first unless identified to the broker by the time of sale, and a broker that offers only one method is treated as holding a standing order for it (Treas. Reg. 1.1012-1(j)). Notice 2026-20, issued because many custodial brokers are "not currently ready to accept specific identifications (other than standing orders)," lets taxpayers identify units held with a broker on their own books and records through December 31, 2026. The relief doesn't extend to the 1099-DA, so "the acquisition date and basis reported by a broker ... may not match" the customer's. A platform that shows realized gains should show which method it applied and say that the customer's own identification may differ.

### Tokenized securities

A tokenized security is a security for tax as well as for securities law. It goes on the 1099-DA rather than the 1099-B under the forms' coordination rules, and it is the one digital asset for which the 1099-DA reports a disallowed wash sale loss (box 1i), because section 1091 reaches it ([Digital Assets and Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots#digital-assets-and-wash-sales)). Tokenized fund distributions paid as new units ([NAV and Income on Chain](/books/investing-and-digital-assets/tokenized-funds#nav-and-income-on-chain)) are dividends in kind, each opening a lot.

## Beyond the US

Other countries tax crypto differently, and the reporting regimes are converging on one design: platforms report their customers' crypto transactions to their own tax authority, which exchanges the data with the customers' countries. The OECD's Crypto-Asset Reporting Framework (CARF) is that design, and the EU implements it through Council Directive (EU) 2023/2226 (DAC8). <!-- source-gap: ida-carf-dac8 | missing | CARF commitments and first exchange dates, DAC8's application date and reporting deadlines, and the UK's implementation | closes with: the OECD CARF commitments page, the DAC8 text on EUR-Lex and HMRC's CARF guidance, opened | checked: 2026-11-05 --> I couldn't open the OECD's commitments page, the directive's text or the UK's guidance, so their dates aren't stated here. In the US, the 2023 proposed broker regulations noted that Treasury was considering how the United States could implement CARF; I found no US proposed or final rule implementing it in the Federal Register as of November 5, 2026.

For a platform operating in several countries, the practical rule is the same as for the 1099-DA: per-customer, per-transaction records with dollar (or local currency) values at the time, tax residence collected and self-certified at onboarding ([Opening Accounts](/books/investing-and-digital-assets/opening-accounts)), and a reporting pipeline per legal entity and jurisdiction. [Beyond the US](/books/investing-and-digital-assets/beyond-the-us) covers the other regimes a crypto platform operates under.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `tax_lots` and `lot_closings` with the lot engine's additions from [Cost Basis, Tax Lots & Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots#how-to-build-it), `transfers` for units in and out, and `tax_documents` from [Confirms, Statements & Tax Forms](/books/investing-and-digital-assets/statements-and-tax-forms#how-to-build-it). This chapter adds the customer's Rev. Proc. 2024-28 allocations as the platform received them, income events with their value at dominion and control, and the 1099-DA lines tied to the closings they report.

```sql
CREATE TABLE wallet_basis_allocations (      -- a customer's Rev. Proc. 2024-28 allocation, as provided
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  kind                TEXT NOT NULL CHECK (kind IN ('specific_unit', 'global')),
  units               NUMERIC(78, 0) NOT NULL,   -- units held in this account on Jan 1, 2025
  allocated_basis     BIGINT NOT NULL,           -- cents
  acquired_dates      JSONB NOT NULL,            -- per allocated unit group
  method_described_at TIMESTAMPTZ,               -- global: must predate Jan 1, 2025
  received_at         TIMESTAMPTZ NOT NULL,      -- when the customer gave it to the platform
  first_disposal_at   TIMESTAMPTZ,               -- specific: must follow completion
  status              TEXT NOT NULL CHECK (status IN ('received', 'applied', 'rejected')),
  tax_lot_ids         UUID[] NOT NULL DEFAULT '{}',  -- customer-provided lots it opened
  UNIQUE (account_id, instrument_id)
);

CREATE TABLE income_events (                 -- units received as income, valued at receipt
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  kind                TEXT NOT NULL CHECK (kind IN ('staking_reward', 'airdrop', 'fork',
                        'mining', 'lending_interest', 'liquidity_reward', 'promotion',
                        'fund_distribution')),
  quantity            NUMERIC(78, 0) NOT NULL,
  dominion_at         TIMESTAMPTZ NOT NULL,      -- when the customer could dispose of it
  credited_at         TIMESTAMPTZ NOT NULL,      -- when the ledger credited it
  fair_value          BIGINT NOT NULL,           -- cents, at dominion_at
  price_source        TEXT NOT NULL,             -- the feed and its timestamp
  journal_entry_id    UUID NOT NULL REFERENCES journal_entries (id),
  tax_lot_id          UUID NOT NULL REFERENCES tax_lots (id),   -- basis = fair_value
  reward_accrual_id   UUID,                      -- staking: the reward_accruals row
  asset_event_id      UUID REFERENCES asset_events (id),        -- airdrops and forks
  reported_on         TEXT                       -- '1099_misc', 'statement_only', ...
);

CREATE TABLE form_1099_da_records (          -- one reported line, tied to what it reports
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tax_document_id     UUID NOT NULL REFERENCES tax_documents (id),
  lot_closing_ids     UUID[] NOT NULL,           -- empty for an aggregate line's members
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  token_identifier    CHAR(9) NOT NULL,          -- box 1a; '999999999' where none is registered
  units               NUMERIC(78, 0) NOT NULL,   -- box 1c
  disposed_at         TIMESTAMPTZ,               -- null on an aggregate line
  proceeds            BIGINT NOT NULL,           -- box 1f, net of transaction costs
  basis               BIGINT,                    -- box 1g; null when noncovered and not reported
  covered             BOOLEAN NOT NULL,          -- box 9 checked when false
  term                TEXT CHECK (term IN ('short', 'long')),
  wash_loss_disallowed BIGINT NOT NULL DEFAULT 0, -- box 1i, tokenized securities only
  aggregate_kind      TEXT CHECK (aggregate_kind IN ('qualifying_stablecoin',
                        'specified_nft')),       -- optional aggregate reporting
  method_applied      TEXT NOT NULL,             -- fifo default or the standing order used
  CHECK (wash_loss_disallowed = 0 OR basis IS NOT NULL)
);
```

Design notes:

- **Income is a lot.** Every `income_events` row opens a `tax_lots` row with `origin = 'income'` (or `airdrop`, `fork`) and its fair value as basis, in the same transaction as the ledger credit.
- **Dominion, not credit, is the time.** `dominion_at` and `credited_at` differ for locked rewards and unsupported airdrops; value and holding period use `dominion_at`.
- **Price sources are evidence.** The feed, its timestamp and the method are stored with each value, applied consistently, as the notice requires.
- **Customer allocations stay customer-provided.** Lots opened from `wallet_basis_allocations` carry `basis_status = 'customer_provided'`, feed the customer's gain view, and never fill a covered basis box.
- **Two legs for every DeFi move.** Wraps, pool deposits and protocol loans are recorded as asset out and asset in with values, so a later ruling can be applied by replay.
- **Report from the closings.** Each 1099-DA line points at the lot closings it reports, so a correction from a replay finds every line it changes.

## Auditing

Tax records are matched by the IRS and disputed by customers, years later. Keep:

- **Every income event** with the dominion time, credit time, quantity, value, price source and the lot it opened.
- **Every disposal** of any kind (sale, swap, payment, fee) with both legs' values and the lots relieved under the method in force.
- **Every customer-provided basis record:** the Rev. Proc. 2024-28 allocation as received, transferred-in basis, and what each was used for.
- **Every 1099-DA line** tied to its closings, with the version furnished and every correction.
- **Backup withholding readiness:** TIN match results by account and the relief each account relied on.

## What This Means for the System You Build

- **Treat every unit given up as a disposal** with a dollar value at the time, including swaps, payments and fees.
- **Treat every unit received free as income** at dominion and control, and open a lot at that value.
- **Record the time and price source of every value;** they are the tax facts.
- **Keep the broker's reporting and the customer's tax separate:** report what the rules require, and give customers records for everything else.
- **Record DeFi moves as two legs** until guidance settles them.
- **Build backup withholding now** and keep it off through 2026 under Notice 2025-33.
- **Show which identification method applied** and that the customer's own may differ under Notice 2026-20.

## References

**Law and regulation**

- [26 USC 1091: Loss from wash sales of stock or securities](https://www.law.cornell.edu/uscode/text/26/1091), the rule's reach to stock or securities
- [26 CFR 1.1012-1: Basis of property](https://www.law.cornell.edu/cfr/text/26/1.1012-1), digital asset identification with and without a broker, standing orders and the January 1, 2025 applicability
- [Treasury and IRS: Gross Proceeds and Basis Reporting by Brokers (T.D. 10000, 89 FR 56480, July 9, 2024)](https://www.federalregister.gov/api/v1/documents/2024-14004.json), the final broker regulations' citation and effective date
- [Treasury and IRS: Gross Proceeds Reporting by Brokers That Regularly Provide Services Effectuating Digital Asset Sales (T.D. 10021, December 30, 2024)](https://www.federalregister.gov/api/v1/documents/2024-30496.json), trading front-end service providers as brokers
- [Treasury and IRS: CRA revocation of T.D. 10021 (90 FR 30825, July 11, 2025)](https://www.federalregister.gov/documents/full_text/text/2025/07/11/2025-12967.txt), H.J. Res. 25, Public Law 119-5 signed April 10, 2025, and removal of the rule text
- [Treasury and IRS: Proposed broker regulations (88 FR 59576, August 29, 2023)](https://www.federalregister.gov/documents/2023/08/29/2023-17565/gross-proceeds-and-basis-reporting-by-brokers-and-determination-of-amount-realized-and-basis-for), the proposal and its discussion of implementing CARF

**Regulators and guidance**

- [IRS: Notice 2014-21](https://www.irs.gov/pub/irs-drop/n-14-21.pdf), virtual currency as property, fair market value in dollars at receipt, exchanges, mining income and self-employment tax
- [IRS: Rev. Rul. 2019-24](https://www.irs.gov/pub/irs-drop/rr-19-24.pdf), hard forks and airdrops, dominion and control, basis equal to income
- [IRS: Rev. Rul. 2023-14](https://www.irs.gov/pub/irs-drop/rr-23-14.pdf), staking rewards as income at dominion and control, including through an exchange
- [IRS: Rev. Proc. 2024-28](https://www.irs.gov/pub/irs-drop/rp-24-28.pdf), the safe harbor allocation of unused basis as of January 1, 2025
- [IRS: Notice 2025-33](https://www.irs.gov/pub/irs-drop/n-25-33.pdf), no backup withholding for 2025 and 2026 sales, TIN-matching relief into 2027 and the 24% cap
- [IRS: Notice 2026-20](https://www.irs.gov/pub/irs-drop/n-26-20.pdf), identification on the taxpayer's own books for units held with brokers through December 31, 2026, and mismatches with the 1099-DA
- [IRS: Final regulations and related guidance for reporting by brokers on digital assets](https://www.irs.gov/newsroom/final-regulations-and-related-IRS-guidance-for-reporting-by-brokers-on-sales-and-exchanges-of-digital-assets), the reporting dates, non-custodial brokers excluded, Notices 2024-56 and 2024-57 and the rewards carve-out
- [IRS: Frequently asked questions on virtual currency transactions](https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions), basis and fees, swaps, forks and airdrops, holding periods, transfers between own wallets, identification records and reporting all transactions (updated June 30, 2026)
- [IRS: Digital assets](https://www.irs.gov/businesses/small-businesses-self-employed/digital-assets), the Form 1040 question and what counts as a transaction
- [IRS: Instructions for Form 1099-DA (2026)](https://www.irs.gov/instructions/i1099da), covered assets, de minimis thresholds and box 1i for tokenized securities

**Courts and enforcement**

- [Jarrett v. United States, No. 22-6023 (6th Cir. Aug. 18, 2023)](https://www.opn.ca6.uscourts.gov/opinions.pdf/23a0187p-06.pdf), the Tezos staking refund suit dismissed as moot after the refund check, and the court's remarks on Rev. Rul. 2023-14
