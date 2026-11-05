+++
title = "RIA Custodians & Advisor Platforms"
nav_title = "Advisor Platforms"
description = "Schwab, Fidelity, Altruist, Pershing and others: the custody rule and the withdrawn safeguarding proposal, block trades, advisory fee billing, TAMPs and crypto."
category = "Investing & Digital Assets Industry"
order = 2535
part = "Wealth and Advice"
tags = ["investing", "ria", "custody-rule", "advisory-fees", "block-trading", "tamp", "wealth-management"]
+++

An independent registered investment adviser doesn't hold its clients' money. The client opens an account at an **RIA custodian**, a broker-dealer or bank that holds the assets in the client's name, sends the client statements and executes the adviser's trades, and signs a limited power of attorney letting the adviser trade the account and deduct its fee. The adviser logs into the custodian's platform, or a portfolio management system connected to it, to see every client account, trade them in blocks, rebalance them to models, and bill them. That split, the adviser deciding and the custodian holding, is what the custody rule is built around, and it is why the advisory business runs on a few large platforms.

The custodian's platform is a brokerage with a second customer. The client owns the account and receives the statements; the advising firm is a customer too, with users, permissions over hundreds or thousands of accounts, a fee schedule for its clients, and trades that span them all. Every feature the adviser uses (block orders with average-price allocation, fee deduction, model rebalancing, money movement with the client's standing instructions) is a regulated act on someone else's account.

This chapter covers that platform as of November 2026: the custodians and what they publish, the custody rule (206(4)-2) and the withdrawn 2023 safeguarding proposal, block trading and allocation (worked through), billing advisory fees (an advisory fee billed quarterly in advance with a mid-quarter deposit, worked), TAMPs and model marketplaces, and crypto for advisers. The adviser's own duties are in [Advice, Reg BI & Conduct](/books/investing-and-digital-assets/advice-and-conduct#the-adviser-s-fiduciary-duty); automated management on these platforms is in [Robo-Advisors & Model Portfolios](/books/investing-and-digital-assets/robo-advisors#rebalancing-and-drift-bands); clearing, which these custodians perform for themselves or buy, is covered in [Clearing & Settlement](/books/investing-and-digital-assets/clearing-and-settlement) and [Brokerage as a Service](/books/investing-and-digital-assets/brokerage-as-a-service) later in this book.

## How the Platforms Do It

The RIA custodians and their public figures, as of November 2026:

| Platform | What it is | Published scale | What stands out |
| --- | --- | --- | --- |
| **Schwab** (Advisor Services) | A segment providing "custodial, trading, banking and trust, and support services to independent RIAs" | Advisor Services client assets of $5,845.9 billion and $120.1 billion of net new assets in Q3 2026; segment net revenues of $4,922 million in 2025 | Absorbed TD Ameritrade's RIA business, including 7,000 RIAs |
| **Fidelity** (Clearing & Custody Solutions) | Custody and clearing for wealth management firms, with the Wealthscape platform and model portfolios | "3,400+ wealth management firms" (no date stated) | Serves both RIAs and broker-dealers on one custody and clearing platform |
| **BNY Pershing** | Clearing, custody, outsourced trading and prime brokerage | $3.6 trillion of global client assets (June 30, 2026), $3 billion of net capital, 100,000 professionals and 8.7 million investor accounts on the platform | "A unified bank trust and brokerage custody platform" |
| **Altruist** | Altruist Financial LLC, a FINRA and SIPC member broker-dealer, with "Clearing and custody of securities provided by Altruist Financial LLC"; Altruist LLC, an SEC-registered adviser, runs a model marketplace | Not stated on the pages I read | Fee billing by AUM, hourly, flat or invoice, monthly, quarterly or annually, from whichever account the client prefers, with household rules and minimums and maximums |
| **TradePMR** (Robinhood) | An RIA custody platform ("Fusion"), a wholly owned subsidiary of Robinhood Markets, with "Custodial Services provided by First Clearing" | TradePMR's RIA clients count as Robinhood funded customers from Q1 2025 | Robinhood's AI tooling rolling out inside it |
| **Betterment** (Advisor Solutions) | Betterment's own custody and managed portfolios for third-party advisers | | Wrap fee tiered from 0.12% to 0.20% by the advising firm's aggregate balance at Betterment, or a flat 0.25% or 0.30% |

Three things stand out. **Scale concentrates:** Schwab's advisor segment alone held nearly $5.85 trillion at Q3 2026. **Custodians clear themselves or buy clearing:** Altruist names itself as clearing and custody broker, TradePMR names First Clearing, and Pershing sells clearing to others, the same introducing-versus-clearing split as retail brokerage. **Billing and models are platform features,** which puts the custodian's software in the path of the adviser's fee disclosures and fiduciary duty.

## The Custody Rule and the Withdrawn Safeguarding Proposal

An adviser has **custody** when it holds client funds or securities or has authority to obtain possession of them, which includes "any arrangement (including a general power of attorney) under which you are authorized or permitted to withdraw client funds or securities" (Rule 206(4)-2(d)(2)). The authority to deduct advisory fees from client accounts is such an authority, so nearly every RIA on a custodial platform has custody, and the rule's requirements follow:

- **Qualified custodian.** Client assets are held by a qualified custodian (a bank or savings association, a registered broker-dealer holding them in customer accounts, an FCM in limited cases, or a qualifying foreign financial institution) "in a separate account for each client under that client's name," or in accounts holding only clients' assets "under your name as agent or trustee for the clients" ((a)(1), (d)(6)).
- **Notice.** The adviser tells each client in writing the custodian's name and address and how the assets are held, when the account opens and after changes ((a)(2)).
- **Statements from the custodian.** The adviser must have "a reasonable basis, after due inquiry, for believing" the custodian sends each client statements at least quarterly showing holdings and every transaction ((a)(3)). Form ADV Item 15 adds that clients should compare those statements with any the adviser sends.
- **Surprise examination.** An independent public accountant verifies client assets "by actual examination at least once during each calendar year" at a time of its choosing, filing Form ADV-E within 120 days ((a)(4)). An adviser with custody "solely as a consequence of your authority to make withdrawals from client accounts to pay its advisory fee" is exempt from the surprise exam ((b)(3)), which is why fee deduction is the common case.
- **Related custodians.** Where the adviser or a related person is the qualified custodian, the adviser also needs an annual internal control report from a PCAOB-registered accountant ((a)(6)). A dual registrant that custodies its own advisory clients' assets falls here.

The surprise exam and custodian statement requirements date from the 2010 amendments that followed Madoff ([2008: Madoff, Lehman and Dodd-Frank](/books/investing-and-digital-assets/crises-and-the-rules#2008-madoff-lehman-and-dodd-frank)).

**The safeguarding proposal.** In 2023 the SEC proposed amendments titled Safeguarding Advisory Client Assets (88 FR 14672, March 9, 2023, comment period reopened at 88 FR 59818). On June 17, 2025 it withdrew that proposal with thirteen others (90 FR 25531), saying it "does not intend to issue final rules" and that any future action would be a new proposal. The current rule stayed in force.

**The 2026 crypto custody proposal.** On October 6, 2026 the SEC proposed new custody rules (Release IA-7023, IC-36353, 91 FR 63870, File S7-2026-35): amendments to the adviser custody rule for how advisers may hold client crypto, new custody rules for registered funds holding crypto, a modernization and redesignation of the existing rules, and new Form ADV and N-CEN questions, including on tokenized private funds. Comments are due December 7, 2026. As of November 2026 it is a proposal; an adviser's crypto custody rests on the existing rule, staff guidance and the custodian's charter ([Qualified Custody](/books/investing-and-digital-assets/qualified-custody) later in this book covers the custodians).

What this means for a custodial platform's software: **every client account is titled to the client** (or the adviser as agent or trustee for clients only), **the platform sends the statements** on its own schedule regardless of the adviser's reporting, **fee deduction is limited to what the client authorized** and recorded as such, and **the adviser's authority is a dated, scoped grant** (trade only, trade and fee deduction, standing money movement instructions), not a login.

## Block Trading and Allocation

An adviser managing 500 accounts to one model doesn't send 500 orders for the same fund. It sends one **block order** for the total and **allocates** the fills back to the accounts. Done right, every account gets the same average price and pays its share of costs; done wrong, it is how advisers have defrauded clients, by deciding after the fills which accounts get the good prices ("cherry-picking"). The ADV asks about it directly: Item 12 requires an adviser to "discuss whether and under what conditions you aggregate the purchase or sale of securities for various client accounts," and, if it doesn't aggregate when it could, to explain the cost to clients. Betterment's brochure states the common policy: "no client is favored over any other client and each client who participates in an aggregated transaction will participate at the average share price for transactions in the aggregated order."

The rules a block engine enforces, in my own words:

- **The allocation is fixed before the order is sent:** each account's intended quantity is recorded with the block, so the allocation can't be chosen after prices are known.
- **Partial fills are allocated pro rata** to the intended quantities (or by a disclosed alternative, such as random or rotation for small fills), at the block's average price.
- **Costs are shared the same way:** commissions or fees on the block are divided in proportion.
- **Residuals are handled by rule:** share rounding leaves odd lots, assigned by a stated method; cash rounding leaves fractions of a cent, assigned by a stated method.
- **Accounts that can't participate** (restricted, a different custodian, a wash sale block) are excluded before the block, not after.

**Worked numbers: a block with a partial fill.** My illustration. An adviser blocks a purchase of 2,000 shares for three accounts that intend 1,000, 600 and 400 shares. The block fills 1,500 shares: 900 at $100.02 and 600 at $100.10.

- **Average price:** (900 × 100.02 + 600 × 100.10) ÷ 1,500 = (90,018.00 + 60,060.00) ÷ 1,500 = **$100.052**.
- **Pro rata shares:** 1,500 × 1,000 ÷ 2,000 = **750**, 1,500 × 600 ÷ 2,000 = **450**, 1,500 × 400 ÷ 2,000 = **300**.
- **Cash per account:** 750 × 100.052 = $75,039.00; 450 × 100.052 = $45,023.40; 300 × 100.052 = $30,015.60; together $150,078.00, exactly the two fills' $90,018.00 + $60,060.00.
- **The unfilled 500:** stays working for the same three accounts in the same proportions, or is canceled; a second fill at a different price is allocated the same way and each account's overall average comes out identical.

Here everything divided evenly. With a fill of 1,499 shares, pro rata gives 749.5, 449.7 and 299.8, so whole-share allocation needs a residual rule (largest remainder: 750, 450, 299, with the last share to the account with the largest fractional part), and an average price like $100.0533... needs a cash rounding rule so the accounts' cash sums to the block's. Fractional share programs allocate the fractions instead ([Rounding and Residuals](/books/investing-and-digital-assets/fractional-and-recurring#rounding-and-residuals)). Each account's confirmation shows the average price and says the trade was part of a block.

## Billing Advisory Fees

The adviser sets the fee; the platform usually computes and deducts it. Form ADV Part 2A Item 5 requires the adviser to say whether it deducts fees or bills clients, how often, whether fees are paid in advance, and "how a client may obtain a refund of a pre-paid fee if the advisory contract is terminated before the end of the billing period" and how the refund is determined. Whatever the brochure and agreement say becomes a specification the billing engine must meet exactly, and the SEC's examination staff have listed the ways it goes wrong. From its April 2018 risk alert on the most frequent fee deficiencies, drawn from over 1,500 exams:

- **Wrong valuations:** using the account's value at the end of the billing cycle "instead of using the average daily balance" the agreement specified; including assets the agreement excluded, "such as cash or cash equivalents, alternative investments, or variable annuities."
- **Wrong timing:** billing monthly instead of quarterly, or in advance when the agreement said arrears; billing a new client for a full cycle "instead of pro-rating such charges to reflect that the advisory services began mid-billing cycle"; not refunding a prorated fee when a client terminated mid-cycle.
- **Wrong rates:** a rate higher than agreed, double billing.
- **Missed discounts:** not aggregating "client account values for members of the same household" for breakpoints; not lowering the rate when an account reached a breakpoint; charging brokerage fees inside a wrap program.
- **Disclosures inconsistent with practice.**

Each of those is a billing engine parameter: valuation basis (period-end, average daily balance), exclusions, frequency, advance or arrears, proration rules for new accounts, flows and terminations, tier structure (tiered marginal or blended by level), household grouping, minimums and maximums, and the account the fee is drawn from. Altruist's billing, as published, exposes most of them: AUM, hourly, flat or one-off fees, monthly, quarterly or annual billing, household billing or one designated paying account, excluded accounts, and minimum and maximum rules.

**Worked numbers: an advisory fee billed quarterly in advance with a mid-quarter deposit.** My illustration. A client's agreement: 1.00% a year on the first $1,000,000 of household assets and 0.75% above, tiered marginally; billed quarterly in advance on the prior quarter-end value; prorated by days for flows of $10,000 or more during the quarter; refund of unearned prepaid fees on termination, by days.

1. **The Q4 2026 bill.** The household was worth $800,000.00 on September 30. Q4 has 92 days. The advance fee is 800,000 × 1.00% × 92 ÷ 365 = **$2,016.44**, deducted on October 1 (or the first business day after).
2. **The deposit.** On Tuesday, November 10 the client deposits $400,000.00. The household is now $1,200,000, so $200,000 of the deposit is in the 1.00% tier and $200,000 in the 0.75% tier. From November 10 through December 31 is 52 days. The flow adjustment is (200,000 × 1.00% + 200,000 × 0.75%) × 52 ÷ 365 = 3,500 × 52 ÷ 365 = **$498.63**, billed when the deposit posts or added to the next quarter's bill, as the agreement says.
3. **A termination instead.** Suppose the client terminates on December 1 with 31 days left. The unearned part of both charges is refunded: 8,000 × 31 ÷ 365 + 3,500 × 31 ÷ 365 = 679.45 + 297.26 = **$976.71**, out of the $2,515.07 billed for the quarter.
4. **The Q1 2027 bill,** had the client stayed, starts from the December 31 value with the tiers applied to the whole household, and no flow adjustment carries forward.

The common errors this example invites: billing the deposit at 1.00% because the engine applied the household's old tier, billing it for the full quarter instead of 52 days, forgetting the refund on termination, or using 90 or 91 days because the quarter was assumed to be a fixed fraction of a year. A fixed quarter-of-the-annual-rate convention (8,000 ÷ 4 = $2,000.00) is also legitimate if the agreement says so; what isn't legitimate is a convention the agreement doesn't state.

The custodian's side: the adviser submits a fee file (or the platform computes it), the custodian checks that the adviser has fee deduction authority on each account, debits each account (raising cash by selling if needed, as Betterment does in its own program), credits the adviser's fee account, and shows the fee on the client's statement, which is one reason the custody rule's surprise exam exemption for fee-only custody holds up: the client sees every deduction on a statement the adviser didn't produce.

![The advisory fee run state machine. A row of states: computed, approved, submitted, collected and posted, with that path accented and posted a terminal state. From submitted, a dashed exit labeled rejected by custodian goes to the rejected state, with a dashed back edge to computed labeled fix and resubmit. From posted, a dashed exit labeled termination or error goes to the terminal refunded state.](/diagrams/ida-advisory-fee-run-states.svg "A fee run is the adviser's computation and the custodian's deduction: a rejected line goes back to be fixed, and a refund is a new entry against the posted fee, never an edit of it.")

## TAMPs and Model Marketplaces

Not every adviser builds its own portfolios. A **turnkey asset management program** (TAMP) is an outsourced investment management and operations provider: it supplies models or manages sleeves, rebalances, trades and often bills, while the adviser keeps the client relationship. Orion describes its TAMP as "fully outsourced investment management and operations"; Envestnet sells trading, direct indexing and tax overlays; Fidelity's custody platform offers model portfolios; Altruist runs a model marketplace under a model marketplace agreement through its adviser entity.

The data shapes are the same as a robo-adviser's with one more layer:

- **A model provider** publishes model versions; the adviser **subscribes** an account (or a sleeve of it) to a model, and the provider's changes flow to every subscribed account, so the version and the subscription are dated rows, as in [Model Portfolios](/books/investing-and-digital-assets/robo-advisors#model-portfolios).
- **Sleeves.** A unified managed account (UMA) splits one account into sleeves, each following a different model or manager, with an overlay that nets trades across sleeves, avoids wash sales between them and manages taxes for the whole account.
- **Who has discretion.** A model provider that only supplies models isn't trading; a TAMP or sub-adviser that trades has discretion and its own fiduciary duty. The account record says which party has trading authority, and the fee schedule splits the client's fee among adviser, TAMP, model provider and custodian.

## Crypto for Advisers

Advisers reach crypto three ways. **ETPs in the custodial account:** spot bitcoin and ether ETPs are securities held at the RIA custodian like any other, with no new custody question. **Separately managed crypto at a crypto custodian:** the adviser needs a qualified custodian for the crypto it manages, the 2023 safeguarding proposal is withdrawn, and the October 2026 proposal is open for comment. **Model sleeves:** a crypto ETP sleeve inside a model, with its own drift band, as Betterment's 7% tolerance for its crypto ETF portfolio shows.

For the platform, crypto custody for advisers means the same features as securities (account titling to the client, statements, fee deduction authority, block trades) on an asset with 24/7 prices, on-chain settlement and a custodian that may not be the broker-dealer, so the adviser's view aggregates two custodians and billing reads two valuation sources at one mark policy ([Crypto Performance at 24/7 Marks](/books/investing-and-digital-assets/portfolio-accounting#crypto-performance-at-24-7-marks)).

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `accounts`, `account_parties`, `legal_entities`, `orders`, `executions`, `fees` and `fee_schedules` (code `advisory`), with [Robo-Advisors & Model Portfolios](/books/investing-and-digital-assets/robo-advisors)' `model_portfolios` and Portfolio Accounting & Performance's `valuations` and `external_flows`. This chapter adds advising firms and their authority over accounts, block orders and allocations, and advisory fee runs.

```sql
CREATE TABLE advisor_firms (                 -- an RIA served by the platform
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_name          TEXT NOT NULL,
  sec_number          TEXT,                    -- 801-xxxxx, or null for a state-registered adviser
  crd_number          TEXT,
  registration        TEXT NOT NULL CHECK (registration IN ('sec', 'state', 'exempt')),
  fee_account_id      UUID REFERENCES accounts (id),  -- where collected fees are credited
  status              TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'suspended',
                        'terminated'))
);

CREATE TABLE advisor_accounts (              -- the adviser's authority over one client account
  advisor_firm_id     UUID NOT NULL REFERENCES advisor_firms (id),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  authority           TEXT[] NOT NULL CHECK (authority <@ ARRAY['view', 'trade', 'fee_deduction',
                        'standing_money_movement']),
  discretion          BOOLEAN NOT NULL,
  agreement_ref       TEXT NOT NULL,           -- the limited power of attorney or advisory agreement
  custody_notice_sent_on DATE,                 -- 206(4)-2(a)(2), when the adviser has custody
  valid_during        TSTZRANGE NOT NULL,
  PRIMARY KEY (advisor_firm_id, account_id, valid_during)
);

CREATE TABLE block_orders (                  -- one market order for many accounts
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  advisor_firm_id     UUID NOT NULL REFERENCES advisor_firms (id),
  order_id            UUID NOT NULL REFERENCES orders (id),  -- the order sent to the market
  allocation_method   TEXT NOT NULL CHECK (allocation_method IN ('pro_rata', 'random',
                        'rotation')),
  share_residual_rule TEXT NOT NULL,           -- 'largest_remainder', ...
  cash_rounding_rule  TEXT NOT NULL,
  allocation_locked_at TIMESTAMPTZ NOT NULL,   -- before the order was sent
  status              TEXT NOT NULL CHECK (status IN ('working', 'filled', 'partially_filled',
                        'canceled', 'allocated'))
);

CREATE TABLE block_allocations (             -- intended and final quantity per account
  block_order_id      UUID NOT NULL REFERENCES block_orders (id),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  intended_quantity   NUMERIC(78, 0) NOT NULL CHECK (intended_quantity > 0),
  allocated_quantity  NUMERIC(78, 0),
  average_price       NUMERIC(38, 18),
  cash_amount         BIGINT,                  -- minor units, after the rounding rule
  journal_entry_id    UUID REFERENCES journal_entries (id),
  PRIMARY KEY (block_order_id, account_id)
);

CREATE TABLE advisory_fee_schedules (        -- the agreement's billing terms, versioned
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  advisor_firm_id     UUID NOT NULL REFERENCES advisor_firms (id),
  fee_schedule_id     UUID NOT NULL REFERENCES fee_schedules (id),  -- the tiers and rates
  tiering             TEXT NOT NULL CHECK (tiering IN ('marginal', 'blended_by_level', 'flat')),
  frequency           TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annual')),
  timing              TEXT NOT NULL CHECK (timing IN ('advance', 'arrears')),
  valuation_basis     TEXT NOT NULL CHECK (valuation_basis IN ('period_end', 'average_daily')),
  day_count           TEXT NOT NULL CHECK (day_count IN ('actual_365', 'actual_actual',
                        'equal_periods')),
  flow_threshold      BIGINT,                  -- flows at or above it are prorated; null: none
  excluded_assets     TEXT[] NOT NULL DEFAULT '{}',  -- 'cash', 'alternatives', ...
  household_aggregation BOOLEAN NOT NULL,
  minimum_fee         BIGINT,
  maximum_fee         BIGINT,
  refund_on_termination TEXT NOT NULL,         -- 'prorated_days', 'none', ... as the agreement says
  adv_item5_ref       TEXT NOT NULL,           -- the brochure language this implements
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE advisory_fee_runs (             -- one billing period's computation and collection
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  advisor_firm_id     UUID NOT NULL REFERENCES advisor_firms (id),
  period              DATERANGE NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('periodic', 'flow_adjustment',
                        'termination_refund', 'correction')),
  status              TEXT NOT NULL CHECK (status IN ('computed', 'approved', 'submitted',
                        'rejected', 'collected', 'posted', 'refunded')),
  approved_by         UUID,
  submitted_at        TIMESTAMPTZ,
  UNIQUE (advisor_firm_id, period, kind)
);

CREATE TABLE advisory_fee_lines (            -- one account's fee in one run, with its inputs
  advisory_fee_run_id UUID NOT NULL REFERENCES advisory_fee_runs (id),
  account_id          UUID NOT NULL REFERENCES accounts (id),        -- whose assets were billed
  paying_account_id   UUID NOT NULL REFERENCES accounts (id),        -- where it is deducted
  advisory_fee_schedule_id UUID NOT NULL REFERENCES advisory_fee_schedules (id),
  household_value     BIGINT NOT NULL,         -- for tier placement
  billable_value      BIGINT NOT NULL,         -- after exclusions
  days                INT NOT NULL,
  days_in_year        INT NOT NULL,
  amount              BIGINT NOT NULL,         -- signed: a refund is negative
  computation         JSONB NOT NULL,          -- tier slices and rates as applied
  fee_id              UUID REFERENCES fees (id),
  rejection_reason    TEXT,                    -- 'no_fee_authority', 'insufficient_cash', ...
  PRIMARY KEY (advisory_fee_run_id, account_id)
);
```

How it runs:

1. **Authority first.** Every adviser action checks `advisor_accounts` for the authority it needs at that moment; fee lines on accounts without `fee_deduction` are rejected before submission.
2. **Blocks lock their allocation** in `block_allocations` before the order leaves; fills are allocated by the block's method at the average price, residuals by rule, and each account's entry posts with the block reference.
3. **Fee runs compute from valuations and flows** for the period under the schedule version in force: tiers placed on household value, exclusions removed, days counted by the schedule's convention, flows above the threshold prorated in a `flow_adjustment` run, terminations in a `termination_refund` run.
4. **Approve, submit, collect:** the adviser approves the run; the custodian debits each paying account (raising cash first if needed), credits the firm's fee account and shows each deduction on the client's statement.
5. **Corrections are new runs** with kind `correction`, never edits of posted lines.

Design notes:

- **The schedule row is the agreement in data,** with a pointer to the ADV Item 5 language it implements, so the brochure and the engine can be compared on any date.
- **Paying account and billed account are separate columns,** because a household can route fees to one account, and performance must know which account paid ([Fees in Performance](/books/investing-and-digital-assets/portfolio-accounting#fees-in-performance)).
- **Day counts are explicit.** Actual days over 365, actual over actual, or equal quarters are all used; storing the convention prevents the off-by-a-day bills the risk alert describes.
- **Allocation is evidence.** `allocation_locked_at` before the order's `placed_at` is the record that defeats a cherry-picking allegation.

## Auditing

The SEC examines advisers on custody, fees and allocation, and FINRA examines the custodian broker-dealer. Keep:

- **Every grant of adviser authority** with scope, agreement and dates, and every custody notice.
- **Every client statement** the custodian sent, on its own schedule.
- **Every block order** with its locked intended allocation, fills, average price and final allocation.
- **Every fee run and line** with the schedule version, valuations, household values, days and tier slices, and every refund and correction.
- **Surprise exam and internal control reports** where the rule requires them.

## What This Means for the System You Build

- **Model adviser authority as dated, scoped grants** per account, checked on every action.
- **Send client statements from the custodian,** independent of the adviser's reporting.
- **Lock block allocations before the order goes out,** allocate pro rata at the average price, and state residual rules.
- **Turn the advisory agreement into a versioned billing schedule:** valuation basis, timing, day count, tiers, household, exclusions, proration and refunds.
- **Prorate flows and terminations by the agreement,** and test the engine against the risk alert's list.
- **Separate the billed account from the paying account** for households.
- **Plan crypto for advisers around the custody rule as it stands,** with the October 2026 proposal tracked, not assumed.

## References

**Law and regulation**

- [17 CFR 275.206(4)-2: Custody of funds or securities of clients by investment advisers](https://www.law.cornell.edu/cfr/text/17/275.206(4)-2), qualified custodians, notice, quarterly statements, the surprise examination and Form ADV-E, the fee deduction exception, related-person custodians and the custody definition

**Regulators and guidance**

- [SEC: Form ADV Part 2 instructions](https://www.sec.gov/about/forms/formadv-part2.pdf), Item 5 fee and refund disclosures, Item 12 aggregation and Item 15 custody statements
- [SEC OCIE: Risk Alert, Most Frequent Advisory Fee and Expense Compliance Issues (April 12, 2018)](https://www.sec.gov/files/ocie-risk-alert-advisory-fee-expense-compliance.pdf), the valuation, timing, rate, discount and disclosure deficiencies from over 1,500 exams
- [Federal Register: Withdrawal of Proposed Regulatory Actions (90 FR 25531, June 17, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-06-17/html/2025-11110.htm), the withdrawal of the safeguarding proposal (88 FR 14672) and the statement on future rulemaking
- [Federal Register: Adviser and Regulated Fund Custody Rules; Crypto Custody Rules (91 FR 63870, IA-7023)](https://www.federalregister.gov/api/v1/documents/2026-20466.json), the October 6, 2026 proposal, its scope and the December 7, 2026 comment deadline

**Filings**

- [Schwab: Q3 2026 earnings release (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/316709/000031670926000035/a3q26exhibit991.htm), Advisor Services client assets of $5,845.9 billion and net new assets of $120.1 billion
- [Schwab: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/316709/000031670926000009/schw-20251231.htm), the Advisor Services segment, and the 7,000 RIAs from TD Ameritrade
- [Schwab: 2025 segment information (Form 10-K, R34)](https://www.sec.gov/Archives/edgar/data/316709/000031670926000009/R34.htm), Advisor Services net revenues of $4,922 million
- [Robinhood Markets: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000023/hood-20251231.htm), the TradePMR acquisition and RIA clients as funded customers

**Vendor documentation**

- [Fidelity: Clearing & Custody Solutions](https://clearingcustody.fidelity.com/), custody and clearing for wealth management firms and the 3,400+ firm figure
- [BNY Pershing](https://www.bny.com/pershing/us/en.html), $3.6 trillion of client assets at June 30, 2026, net capital, professionals and investor accounts, and the unified custody platform
- [Altruist: Legal](https://altruist.com/legal/), Altruist Financial LLC as FINRA/SIPC member and clearing and custody broker, Altruist LLC's adviser documents and model marketplace agreement
- [Altruist: Fee billing](https://altruist.com/fee-billing/), fee types, frequencies, paying accounts, household rules and minimums and maximums
- [TradePMR](https://www.tradepmr.com/), the Fusion platform, Robinhood ownership and First Clearing as custodian
- [Orion](https://orion.com/), its TAMP, portfolio accounting and billing
- [Envestnet](https://www.envestnet.com/), trading, direct indexing and tax overlays
- [Betterment: Form ADV Part 2A brochure (October 27, 2026)](https://www.betterment.com/adv), the order aggregation policy, the Advisor Solutions wrap fee, fee collection by selling securities and the crypto ETF portfolio's 7% band
