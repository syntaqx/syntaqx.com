+++
title = "IRAs & Retirement Accounts"
nav_title = "IRAs & Retirement"
description = "Traditional and Roth IRAs, 2026 limits, rollovers and the 60-day rule, the IRA custodian, RMDs from the Uniform Lifetime Table, 5498 and 1099-R, and matches."
category = "Investing & Digital Assets Industry"
order = 2533
part = "Wealth and Advice"
tags = ["investing", "ira", "retirement", "rollovers", "rmd", "tax-forms", "401k"]
+++

An IRA looks like a brokerage account with a different label, and to the trading engine it nearly is: the same orders, positions and lots. Everything around the trading is different. Money goes in under annual limits that depend on the customer's age and income, by a deadline that falls in the following year. It comes out under rules that tax it, penalize it, require it after a certain age, or let it move to another account tax-free if it arrives within 60 days. The account's legal owner of record is a custodian or trustee that must be a bank or an entity the IRS has approved, and that custodian, not the customer, reports every contribution and distribution to the IRS. A brokerage that adds IRAs takes on a second ledger of tax-year attributions alongside the money.

Retirement has become a growth product for retail brokers, which is why the rules matter to engineers there. Robinhood's retirement assets under custody reached $36.6 billion in the third quarter of 2026, up 51% in a year, helped by a match on contributions that the customer keeps only if the assets stay for five years; and the same release reports Treasury's automatic enrollment establishing Trump Accounts for nearly 70 million children, accounts whose assets Robinhood custodies ([Opening Accounts](/books/investing-and-digital-assets/opening-accounts#how-the-platforms-do-it)).

This chapter covers the IRA as of November 2026: traditional and Roth IRAs and the 2026 limits, contributions and their tax years, rollovers and the 60-day rule (worked through), the custodian's role, required minimum distributions (with an RMD worked from the Uniform Lifetime Table), Forms 5498 and 1099-R, matches, crypto in IRAs, and 401(k) recordkeeping in brief. The other tax forms are in [Confirms, Statements & Tax Forms](/books/investing-and-digital-assets/statements-and-tax-forms#the-1099-composite); a recommendation to roll a 401(k) into an IRA is covered in [Regulation Best Interest](/books/investing-and-digital-assets/advice-and-conduct#regulation-best-interest).

## How the Platforms Do It

What brokers publish about their IRAs, as of November 2026:

| Platform | IRA offering | What stands out |
| --- | --- | --- |
| **Robinhood** | Traditional and Roth IRAs; Gold members earn "a 3% match on IRA contributions," "up to $225 based on the 2026 maximum contribution" | "You must stay subscribed to Gold for one year and keep the assets in the IRA for five years in order to keep the full 3% match"; retirement AUC of $36.6 billion at Q3 2026; IRAs "don't support trading or transferring crypto," and only an individual account can be the margin account |
| **Vanguard** (Digital Advisor) | Traditional, Roth, rollover and inherited IRAs and single-participant SEP-IRAs in its managed program, plus eligible Vanguard-administered 401(k)s | Managed advice inside retirement accounts at the same 0.20% gross fee as taxable |
| **Betterment** | IRAs in its managed portfolios, with the same 0.5% operational cash allocation as taxable accounts from May 1, 2026 | Its harvesting methodology uses tertiary tickers so IRA deposits don't wash taxable losses |
| **Fidelity** | Retirement accounts default to a money market fund or an FDIC-insured deposit sweep as the core position | The cash vehicle is decided at opening ([Cash, Sweeps & Yield](/books/investing-and-digital-assets/cash-and-sweeps#how-the-platforms-do-it)) |

The common design: **the IRA is an account type at the same broker-dealer,** with a custodian named on the account, contribution and distribution tax attributes on every money movement, and product restrictions (no margin, often no crypto) enforced by capability.

## Traditional and Roth IRAs

The two differ in when tax is paid. A **traditional IRA** contribution may be deductible, growth is tax-deferred, and distributions are taxed as income; a **Roth IRA** contribution is never deductible, and qualified distributions are tax-free. The 2026 numbers (IRS News Release IR-2025-111 and Notice 2025-67, November 13, 2025):

| Item | 2026 | 2025 |
| --- | ---: | ---: |
| IRA contribution limit (traditional and Roth combined) | $7,500 | $7,000 |
| IRA catch-up, age 50 and over | $1,100 | $1,000 |
| Roth IRA phase-out, single and head of household | $153,000 to $168,000 | $150,000 to $165,000 |
| Roth IRA phase-out, married filing jointly | $242,000 to $252,000 | $236,000 to $246,000 |
| Traditional deduction phase-out, single, covered by a workplace plan | $81,000 to $91,000 | $79,000 to $89,000 |
| Traditional deduction phase-out, married filing jointly, contributor covered | $129,000 to $149,000 | $126,000 to $146,000 |
| Traditional deduction phase-out, contributor not covered but spouse is | $242,000 to $252,000 | $236,000 to $246,000 |
| 401(k) elective deferral | $24,500 | $23,500 |
| 401(k) catch-up, age 50 and over | $8,000 | $7,500 |
| 401(k) catch-up, ages 60 to 63 | $11,250 | $11,250 |
| SIMPLE contribution limit | $17,000 | $16,500 |

A customer aged 50 or over can put $8,600 into IRAs for 2026; the limit is per person across all their IRAs, at every firm, so a broker can enforce it only for the accounts it holds and must otherwise rely on the customer.

**Roth conversions** move money from a traditional IRA to a Roth, taxed as income in the year converted. They aren't rollovers for the once-a-year limit below, and the 1099-R codes them as distributions (2 or 7 by age).

## Contributions and Tax Years

Contributions for a year can be made until "the due date for filing your return for that year, not including extensions," which for most people means contributions for 2025 had to be in by April 15, 2026 (Publication 590-A), and contributions for 2026 can be made until April 15, 2027. Between January 1 and April 15 a contribution can belong to either year, so every contribution carries the **tax year** the customer designated, and the broker asks for it on every deposit in that window. Excess contributions are taxed at 6% a year until withdrawn, and the fix is a corrective withdrawal of the excess by the deadline, which the custodian records as a distribution with its own reason.

The engineering consequence is a second dimension on every money movement into the account: the amount, the date, and the tax year it counts toward, plus its kind (regular, catch-up, rollover, transfer, conversion, recharacterization). The ledger moves dollars; the contribution register counts them against limits by tax year.

## Rollovers and the 60-Day Rule

Money moves between retirement accounts three ways, and the customer's tax result depends on which:

| Route | How it moves | Reported | Limits |
| --- | --- | --- | --- |
| **Trustee-to-trustee transfer** (IRA to IRA) | Custodian to custodian; the customer never receives it, often by ACATS | Not reported on Form 1099-R | None |
| **Direct rollover** (plan to IRA) | The plan pays the IRA custodian directly | 1099-R with code G and $0 taxable; 5498 box 2 at the receiving IRA | No withholding |
| **Indirect (60-day) rollover** | Paid to the customer, who deposits it in an IRA | 1099-R as a distribution; 5498 box 2 | 60 days; one IRA-to-IRA rollover per 12 months; 20% withheld from employer plans |

The rules for the indirect route, from Publication 590-A: "You must generally make the rollover contribution by the 60th day after the day you receive the distribution." "You can make only one rollover from an IRA to another (or the same) IRA in any 1-year period," counting all of the customer's IRAs together, though trustee-to-trustee transfers and conversions don't count and "the once-a-year limit on IRA-to-IRA rollovers doesn't apply to eligible rollover distributions from an employer plan." And "if an eligible rollover distribution is paid directly to you, the payer must withhold 20% of it"; the customer "can make up the amount withheld with funds from other sources."

**Worked numbers: a 60-day rollover.** My illustration. A 52-year-old leaves an employer and takes their $100,000 401(k) balance as a check instead of a direct rollover. The plan withholds 20%.

1. **Monday, March 2, 2026:** the customer receives $80,000; $20,000 went to the IRS as withholding.
2. **The deadline** is the 60th day after receipt: **Friday, May 1, 2026**.
3. **To roll over all $100,000,** the customer deposits the $80,000 plus $20,000 from savings into an IRA by May 1. The $20,000 withheld comes back as a credit on the 2026 tax return. The IRA's 5498 shows a $100,000 rollover contribution in box 2.
4. **If they deposit only the $80,000,** the other $20,000 is a taxable distribution: income for 2026 and, because they are under 59½, generally subject to the 10% additional tax, $2,000 (Publication 590-B), unless an exception applies. The plan's 1099-R reports the $100,000 distribution with code 1 (early, no known exception); the customer reconciles on their return.
5. **If the deposit lands on May 4,** the whole amount is late. Late rollovers go in Form 5498 boxes 13a to 13c with a code ("SC" for a self-certified late rollover, "FD" for a federally declared disaster, "PO" for a plan loan offset), not box 2; whether the late rollover qualifies is the customer's to establish.

The direct rollover avoids every step of this: no withholding, no clock, code G. That is why a broker's rollover flow should request a direct rollover from the plan, and why the rollover recommendation is itself a regulated act ([Form CRS](/books/investing-and-digital-assets/advice-and-conduct#form-crs) must be delivered again when one is recommended).

![The indirect rollover state machine. A row of states: distributed, received, deposited and completed, with that path accented and completed a terminal state. From received, a dashed exit labeled 60 days passed goes to the terminal taxable state. From deposited, a dashed exit labeled partial goes to the terminal partly taxable state, for the amount not rolled over.](/diagrams/ida-rollover-states.svg "A 60-day rollover is a clock that starts the day after receipt, run by the customer and recorded by the custodian: the deposit is a rollover contribution only if it arrives in time and only up to the amount distributed.")

At the receiving IRA, the rollover is a contribution with kind `rollover`, the source plan, the distribution date and the amount, so the 5498 can report it and the once-a-year check can find the last IRA-to-IRA rollover. The custodian can't verify the receipt date from the plan's records alone; it records what the customer certifies and what the paperwork shows.

## The IRA Custodian

An IRA is a trust or custodial account, and its trustee must be "a bank (as defined in subsection (n))" or "such other person who demonstrates to the satisfaction of the Secretary" that it will administer the account consistently with the statute (26 USC 408(a)(2)). A broker-dealer offers IRAs as the custodian only under that approval, or with a bank or trust company as custodian and itself as the broker. The trustee makes "such reports regarding such account" to the IRS and furnishes them to the owner (408(i)), which is where Forms 5498 and 1099-R come from.

In the data model the custodian is a party on the account (`account_parties.role = 'custodian'`) and a legal entity with its own registration. What it adds to the broker's work:

- **Tax attributes on money movements:** every deposit is a contribution of a kind and year; every withdrawal is a distribution with a reason and withholding election.
- **Restrictions:** no margin (an IRA can't borrow against itself) and no life insurance contracts (408(a)(3)), and collectibles bought by the IRA are treated as distributed (408(m), below).
- **Death and beneficiaries:** the beneficiary designation (`account_parties.role = 'beneficiary'` with shares) decides who inherits, outside the will, and an inherited IRA is a new account with its own distribution rules.
- **Reports:** Form 5498 each year for each IRA, RMD statements, Form 1099-R for each distribution.

## Required Minimum Distributions

Traditional IRA owners must start withdrawing at the **applicable age**, 73 for someone who "attains age 72 after December 31, 2022, and age 73 before January 1, 2033," and 75 for someone who "attains age 74 after December 31, 2032" (26 USC 401(a)(9)(C)(v), as amended by the SECURE 2.0 Act). The first distribution is due by April 1 of the year after the owner reaches the applicable age (the **required beginning date**), and each later one by December 31. Roth IRA owners have no lifetime RMDs: "If you are the original owner of a Roth IRA, you don't have to take distributions regardless of your age."

The amount: the account balance at the close of business on December 31 of the prior year, divided by the distribution period for the owner's age that year from the **Uniform Lifetime Table** (Table III in Publication 590-B), or from the Joint Life table when the spouse is the sole designated beneficiary and more than 10 years younger. Table III, ages 72 to 80:

| Age | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Distribution period | 27.4 | 26.5 | 25.5 | 24.6 | 23.7 | 22.9 | 22.0 | 21.1 | 20.2 |

**Worked numbers: an RMD.** An owner turns 75 in 2026, unmarried. The IRA's value at the close of December 31, 2025 was $500,000.00.

- **2026 RMD:** $500,000.00 ÷ 24.6 = **$20,325.20**, due by December 31, 2026.
- **If only $15,000.00 is withdrawn by December 31,** the shortfall is $5,325.20 and the excise tax is 25% of it, **$1,331.30**, reduced to 10%, **$532.52**, if corrected within the correction window (Publication 590-B; the IRS's RMD page puts the window at two years).
- **A first year for comparison:** a customer who turns 73 in 2026 with $400,000.00 at December 31, 2025 owes $400,000.00 ÷ 26.5 = $15,094.34 for 2026, but may take it as late as April 1, 2027. If they wait, 2027 holds two RMDs, the 2026 one by April 1 and the 2027 one by December 31, both taxed in 2027.
- **Several IRAs:** each custodian computes the RMD only for the account it holds; how an owner with IRAs at several firms satisfies the total is the owner's to manage, and the custodian's statement covers its own account.

The custodian's duties are about telling, not enforcing: Form 5498 box 11 ("Check if RMD for 2027") is checked when the participant must take an RMD for 2027, including the year the owner reaches the applicable age even though the first RMD can wait until April 1, and by January 31 the custodian sends the owner a statement either giving the RMD amount and its due date or saying an RMD is required and offering to calculate it, and in either case saying the custodian is reporting to the IRS that one is due. The RMD itself is computed from the prior year-end value, which is why `rmd_calculations` pins the balance and the table version.

## Forms 5498 and 1099-R

The custodian's two forms, from the 2026 instructions for Forms 1099-R and 5498:

| Form | What it reports | When |
| --- | --- | --- |
| **5498** | Contributions by kind and tax year (rollovers in box 2), the account's fair market value at year-end, the RMD indicator (box 11), postponed and late contributions (boxes 13a to 13c) | Fair market value and RMD statements to the owner by early in the following year (February 1, 2027 for the account value statement, January 31 for the RMD statement); the form to the IRS and contribution information to the owner by May 31, 2027, after the contribution deadline has passed |
| **1099-R** | Each distribution, the taxable amount, federal withholding, and a distribution code in box 7 | Early in the following year, with the 1099 season ([The 1099 Composite](/books/investing-and-digital-assets/statements-and-tax-forms#the-1099-composite)) |

The distribution codes are the part that encodes business logic:

| Code | Meaning | When the system assigns it |
| --- | --- | --- |
| 1 | Early distribution, no known exception | Owner under 59½ and the custodian doesn't know of an exception |
| 7 | Normal distribution | Owner 59½ or over (including a Roth conversion at that age), not for a Roth IRA distribution |
| G | Direct rollover to an IRA or plan | The plan paid the receiving custodian directly |
| H | Direct rollover of a designated Roth account to a Roth IRA | From a plan's Roth account |
| N | Recharacterized contribution made in the same year | A 2026 contribution recharacterized in 2026 |
| R | Recharacterized contribution made in the prior year | A 2025 contribution recharacterized in 2026 |

A trustee-to-trustee transfer between IRAs that involves no payment to the participant generally isn't reported on a 1099-R at all, so the ACATS path ([ACATS Transfers](/books/investing-and-digital-assets/funding-and-transfers#acats-transfers)) produces no form, while a check to the customer always does.

## Matches

A **match** is money the broker adds to an IRA as a percentage of the customer's contribution. Robinhood's terms, as published: Gold members earn 3% on "all new IRA contributions, up to the contribution limit," which at the 2026 limit is $7,500 × 3% = $225, the cap its Gold page states, and to keep the full match the customer must stay subscribed to Gold for one year and keep the assets in the IRA for five years. Its 10-K describes the match as "subject to a five-year holding period," and its earnings release counts "retirement match incentives" in net deposits.

What a match adds to the system:

- **A conditional asset.** The match is in the account and invested from day one but can be reclaimed if the conditions fail, so each match is a row with its contribution, amount, start date and condition dates, and a transfer out or withdrawal within five years has to find the matches it affects before it completes.
- **A contribution that isn't one.** The match isn't the customer's contribution and doesn't count toward their limit in the broker's register; how it is reported on the 5498 is a tax question I couldn't source from the materials I opened. <!-- source-gap: ida-ira-match-tax-reporting | missing | how a broker's IRA match is characterized and reported (5498 box, taxability, effect on the customer's contribution limit) | closes with: a broker's published match terms or tax FAQ, or IRS guidance, opened | checked: 2026-11-05 -->
- **A marketing expense with a clawback.** The firm books the match as a cost and any reclaimed match as a recovery, by legal entity.

## Crypto in IRAs

Nothing in section 408 bars crypto in an IRA. What the statute restricts is **collectibles**: if an IRA acquires "any work of art," "any rug or antique," "any metal or gem," "any stamp or coin," "any alcoholic beverage" or other tangible personal property the Secretary specifies, the acquisition is treated as a distribution (408(m)), with exceptions for certain bullion and coins held by the trustee. Crypto assets aren't on that list and the IRS hasn't added them. So the question is the custodian's policy: whether it will custody the asset, value it at year-end for the 5498, and report distributions in kind. Robinhood excludes crypto from its IRAs ([Account Types and Titling](/books/investing-and-digital-assets/opening-accounts#account-types-and-titling)); a firm that offers it needs a custodian willing to hold, value and report the asset, and crypto ETPs held in a brokerage IRA avoid the question entirely ([Crypto ETPs](/books/investing-and-digital-assets/crypto-etps) later in this book covers them).

For the engine, a crypto IRA needs a year-end fair market value at a stated cut for the 5498 ([Pricing Data and Oracles for Marks](/books/investing-and-digital-assets/chain-data-and-indexing#pricing-data-and-oracles-for-marks)), RMD balances computed from that same mark, and in-kind distributions valued at the time of distribution for the 1099-R.

## 401(k) Recordkeeping in Brief

A 401(k) is an employer's plan, not the participant's account at a broker. A **recordkeeper** keeps the participant ledger: each payroll's deferrals by source (pre-tax, Roth, employer match, profit sharing), vesting schedules for employer money, loans, investment elections among the plan's funds, and the distribution and rollover paperwork. The plan's trustee holds the assets, often in omnibus fund positions, and the recordkeeper's ledger says whose they are, the same ledger-versus-location split as an omnibus brokerage account ([Omnibus and Segregated](/books/investing-and-digital-assets/ledgers-and-positions#omnibus-and-segregated)). Limits are per participant per year ($24,500 of deferrals in 2026, plus catch-ups) and the plan, not the broker, enforces them. Where the two worlds meet in a brokerage is the rollover: the plan's 1099-R and the IRA's 5498 must describe the same money.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `accounts` (`ira_traditional`, `ira_roth`), `account_parties` (custodian, beneficiary), `transfers` and `journal_entries`, with [Confirms, Statements & Tax Forms](/books/investing-and-digital-assets/statements-and-tax-forms)' `tax_documents` (forms `5498` and `1099_r`). This chapter adds the contribution and distribution registers, rollovers, RMD calculations and matches.

```sql
CREATE TABLE ira_contributions (             -- every dollar in, with its tax year and kind
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  transfer_id         UUID NOT NULL REFERENCES transfers (id),
  kind                TEXT NOT NULL CHECK (kind IN ('regular', 'catch_up', 'rollover',
                        'late_rollover', 'transfer_in', 'conversion', 'recharacterization',
                        'postponed')),
  tax_year            SMALLINT NOT NULL,       -- designated by the customer in the Jan 1 to Apr 15 window
  amount              BIGINT NOT NULL CHECK (amount > 0),  -- minor units
  rollover_id         UUID,                    -- for rollovers
  late_code           TEXT CHECK (late_code IN ('SC', 'FD', 'PO')),  -- 5498 box 13c
  received_at         TIMESTAMPTZ NOT NULL,
  CHECK ((kind IN ('rollover', 'late_rollover')) = (rollover_id IS NOT NULL))
);

CREATE TABLE ira_distributions (             -- every dollar out, with what the 1099-R will say
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  transfer_id         UUID REFERENCES transfers (id),          -- null for a conversion journal
  reason              TEXT NOT NULL CHECK (reason IN ('normal', 'early', 'rmd', 'conversion',
                        'excess_removal', 'recharacterization', 'death', 'direct_rollover')),
  gross_amount        BIGINT NOT NULL CHECK (gross_amount > 0),
  federal_withholding BIGINT NOT NULL DEFAULT 0,
  distribution_code   TEXT NOT NULL,           -- 1099-R box 7: '1', '7', 'G', 'H', 'N', 'R', ...
  in_kind             BOOLEAN NOT NULL DEFAULT FALSE,
  fmv_source          TEXT,                    -- the mark used for an in-kind distribution
  rmd_calculation_id  UUID,                    -- counts toward this RMD
  distributed_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE rollovers (                     -- a 60-day rollover's facts, as certified
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),  -- the receiving IRA
  source_kind         TEXT NOT NULL CHECK (source_kind IN ('ira', 'employer_plan', 'roth_plan')),
  route               TEXT NOT NULL CHECK (route IN ('direct', 'indirect')),
  source_description  TEXT NOT NULL,           -- the plan or the other custodian
  distribution_received_on DATE,               -- indirect only: starts the clock
  deadline            DATE GENERATED ALWAYS AS (distribution_received_on + 60) STORED,
  distributed_amount  BIGINT NOT NULL,
  withheld_amount     BIGINT NOT NULL DEFAULT 0,
  status              TEXT NOT NULL CHECK (status IN ('distributed', 'received', 'deposited',
                        'completed', 'taxable', 'partly_taxable')),
  prior_ira_rollover_on DATE,                  -- the last IRA-to-IRA rollover in 12 months, if any
  CHECK (route = 'direct' OR distribution_received_on IS NOT NULL)
);

ALTER TABLE ira_contributions ADD FOREIGN KEY (rollover_id) REFERENCES rollovers (id);

CREATE TABLE rmd_calculations (              -- one per account per year
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  distribution_year   SMALLINT NOT NULL,
  prior_year_end_value BIGINT NOT NULL,        -- close of business December 31
  owner_age           SMALLINT NOT NULL,       -- attained in the distribution year
  table_used          TEXT NOT NULL CHECK (table_used IN ('uniform_lifetime', 'joint_life',
                        'single_life')),
  table_version       TEXT NOT NULL,           -- the publication edition
  distribution_period NUMERIC(4, 1) NOT NULL,
  rmd_amount          BIGINT NOT NULL,         -- prior_year_end_value / distribution_period, rounded to cents
  due_on              DATE NOT NULL,           -- Dec 31, or Apr 1 of the next year for the first
  statement_sent_at   TIMESTAMPTZ,             -- the January 31 statement
  UNIQUE (account_id, distribution_year)
);

ALTER TABLE ira_distributions ADD FOREIGN KEY (rmd_calculation_id) REFERENCES rmd_calculations (id);

CREATE TABLE ira_matches (                   -- a broker match with its conditions
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  contribution_id     UUID NOT NULL REFERENCES ira_contributions (id),
  rate_bps            INT NOT NULL,            -- e.g. 300
  amount              BIGINT NOT NULL,
  program_version     TEXT NOT NULL,           -- the published terms in force
  conditions_until    DATE NOT NULL,           -- e.g. five years after the match
  status              TEXT NOT NULL CHECK (status IN ('credited', 'kept', 'reclaimed')),
  journal_entry_id    UUID NOT NULL REFERENCES journal_entries (id)
);
```

How it runs:

1. **Every deposit to an IRA** creates an `ira_contributions` row in the same transaction as the transfer, with the tax year asked for in the January 1 to April 15 window, and checks the firm-visible total against the year's limit for the owner's age.
2. **Every withdrawal** creates an `ira_distributions` row with its reason, code and withholding; a withdrawal within a match's condition period finds the affected matches first.
3. **Indirect rollovers** record the receipt date the customer certifies and refuse box 2 treatment after the deadline, routing to the late-rollover path with a code.
4. **Each January,** compute every RMD from the December 31 values, send the statements by January 31, and set box 11 on the 5498 for the coming year.
5. **Build the 5498 after the contribution deadline** from `ira_contributions` by tax year and the year-end value, and the 1099-R from `ira_distributions`.

Design notes:

- **Tax year is not the posting date.** A contribution on March 3, 2027 for 2026 posts in 2027 and counts in 2026; every limit and form query groups by `tax_year`.
- **The RMD is pinned.** The prior year-end value and the table edition are stored, so a later correction to a December 31 price is a new calculation, not a silent change.
- **Transfers and rollovers are different rows.** A trustee-to-trustee move is `transfer_in`, reported on no 1099-R and outside the once-a-year limit; mixing them gets the customer's taxes wrong.

## Auditing

The IRS relies on the custodian's forms; examiners and auditors test the custodian's records against them. Keep:

- **Every contribution** with kind, tax year, amount and the evidence of the designation.
- **Every distribution** with reason, code, withholding election and the mark for in-kind ones.
- **Every rollover's facts** as certified, with the deadline and the prior rollover check.
- **Every RMD calculation and statement** with the year-end value and table edition.
- **Every match** with its program version, conditions and outcome.
- **Every 5498 and 1099-R as furnished,** with corrections ([Corrections and Their Timing](/books/investing-and-digital-assets/statements-and-tax-forms#corrections-and-their-timing)).

## What This Means for the System You Build

- **Put a tax year and a kind on every IRA contribution,** and ask for the year in the January to April window.
- **Prefer direct rollovers,** and when a rollover is indirect, record the receipt date and enforce the 60-day deadline and the once-a-year rule.
- **Assign 1099-R codes from the facts at distribution,** not at form time.
- **Compute RMDs from pinned December 31 values** and the table edition, and send the January 31 statement.
- **Treat a match as a conditional asset** with a clawback window that every withdrawal and transfer checks.
- **Decide crypto in IRAs as a custody policy,** with year-end marks for the 5498.
- **Keep transfers, rollovers and conversions apart,** because each has its own reporting and limits.

## References

**Law and regulation**

- [26 USC 401: Qualified pension, profit-sharing, and stock bonus plans](https://www.law.cornell.edu/uscode/text/26/401), the applicable age of 73 and 75 in (a)(9)(C)(v)
- [26 USC 408: Individual retirement accounts](https://www.law.cornell.edu/uscode/text/26/408), the trustee requirement in (a)(2), the life insurance bar in (a)(3), the rollover limitation in (d)(3)(B), reports in (i) and collectibles in (m)

**Regulators and guidance**

- [IRS: 401(k) limit increases to $24,500 for 2026, IRA limit increases to $7,500 (IR-2025-111, November 13, 2025)](https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500), every 2026 limit and phase-out range in the table
- [IRS: Publication 590-A (2025), Contributions to IRAs](https://www.irs.gov/publications/p590a), the contribution deadline, the 60-day rule, the one-rollover-per-year limit and its exceptions, 20% withholding and making it up, and the 6% excess contribution tax
- [IRS: Publication 590-B (2025), Distributions from IRAs](https://www.irs.gov/publications/p590b), the required beginning date, the RMD computation, Table III, the Joint Life table condition, the 25% and 10% excise tax, no lifetime Roth RMDs and the 10% additional tax before 59½
- [IRS: Retirement topics, required minimum distributions](https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-required-minimum-distributions-rmds), the two-year correction window and Roth 401(k) treatment (updated April 8, 2026)
- [IRS: Instructions for Forms 1099-R and 5498 (2026)](https://www.irs.gov/instructions/i1099r), distribution codes 1, 7, G, H, N and R, unreported trustee-to-trustee transfers, box 2, boxes 13a to 13c and their codes, box 11, the RMD statement and the 2027 due dates

**Filings**

- [Robinhood: Q3 2026 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000164/q32026robinhoodexhibit991.htm), retirement AUC of $36.6 billion, up 51%, and retirement match incentives in net deposits
- [Robinhood Markets: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000023/hood-20251231.htm), the 3% Gold match and the five-year holding period

**Vendor documentation**

- [Robinhood: Gold](https://robinhood.com/us/en/gold/), the 3% match, the $225 figure for 2026 and the one-year and five-year conditions
- [Robinhood: Multiple investing accounts FAQ](https://robinhood.com/us/en/support/articles/multiple-investing-accounts-faq/), IRAs that "don't support trading or transferring crypto" and the one individual margin account
- [Fidelity: Account FAQs](https://www.fidelity.com/trading/faqs-about-account), SPAXX or the FDIC-insured deposit sweep as the retirement account core position
- [Betterment: Tax-loss harvesting methodology (updated August 4, 2026)](https://www.betterment.com/resources/tax-loss-harvesting-methodology), tertiary tickers so IRA deposits don't wash taxable losses
- [Vanguard: Digital Advisor](https://investor.vanguard.com/advice/digital-advisor), the IRA and 401(k) account types in the program
- [Betterment: Form ADV Part 2A brochure (October 27, 2026)](https://www.betterment.com/adv), the operational cash allocation in IRAs
