+++
title = "Products & Product Configuration"
nav_title = "Product Configuration"
description = "The product factory: rate tiers and promotions, fee schedules, versioning when terms change, change-in-terms notices and grandfathered accounts."
category = "Banking & Lending Industry"
order = 2411
part = "The Core"
tags = ["banking", "core-banking", "products", "configuration", "regulation-dd"]
+++

A bank's checking account, its high-yield savings account, its 12-month CD and its personal line of credit are each a **product**: a named set of rules that every account opened under it inherits. The rate and how it's computed, the fees and when they apply, the minimum balance, the limits, what happens at maturity, how long before the account goes dormant, which GL lines it posts to. Cores call the part of themselves that defines these the **product factory** (or product catalog, product builder), and its quality decides how fast a bank can launch, price and change what it sells.

It also decides whether the bank can honor what it told customers. A product's terms are disclosed at account opening and are, in effect, a contract; a change that hurts the customer needs advance notice, and an account opened under old terms may keep them for years. The engineering problem this chapter is about is that **a product is not a row you edit**. It's a sequence of versions, each tied to the disclosures that described it and the accounts that hold it. [Interest, APY & Statements](/books/banking-and-lending/interest-and-statements) is how the rates are applied; Deposit Accounts & Truth in Savings has the account-opening disclosures in full; this chapter is how the terms are modeled and changed.

## How the Platforms Do It

As of October 2026, the public documentation shows two philosophies: products as parameter sets a core interprets, and products as code the core executes.

| | Product model | Editing a live product | Retiring a product |
| --- | --- | --- | --- |
| **Mambu, deposits** | Parameter set (rates and tiers, balance basis, day count, fees with triggers and accounting rules, overdraft, maturity, dormancy, limits, currencies), configurable as YAML | Saving an edit updates existing accounts; rate and interest-method changes ask "Which accounts should the new interest settings apply to?" | Deactivated products open no new accounts; existing accounts continue; used products can't be deleted |
| **Mambu, loans** | Parameter set | "The new terms and conditions will only affect any new accounts created under that product"; pending accounts can be updated | Deactivated; active loans keep running |
| **Thought Machine Vault Core** | "Programmable smart contracts" per product, on a single ledger for every product | Versioned contract code (developer documentation is not public) | Not public |

The two Mambu rows, from one vendor, are the whole design question in miniature. A deposit product edit that flows to every existing account is convenient for a variable-rate savings product and dangerous for anything with disclosed fixed terms. A loan product edit that touches only new accounts is safe and leaves the bank with every historical set of terms alive at once. Neither default is right for every product; the system has to let the bank choose per change and record what it chose.

## The Product Factory

A product definition has the same parts across cores, whatever they're called.

| Part | Holds | Notes |
| --- | --- | --- |
| **Identity** | Code, name, kind (checking, savings, money market, CD, loan, line), currency, institution, program | The program link matters for fintech products at a sponsor bank (Banking as a Service) |
| **Interest** | Rate source (fixed, index plus spread), tiers and tier method, balance basis, day count, compounding, crediting frequency, accrual after maturity | [Interest, APY & Statements](/books/banking-and-lending/interest-and-statements) has each one |
| **Fees** | Fee schedule: each fee's trigger, amount method, waivers, caps | [Fee Schedules](#fee-schedules) below |
| **Balances and limits** | Opening deposit, minimum balance to avoid a fee or earn interest, maximum balance, withdrawal limits | Transaction limits on savings are now a bank choice, not Regulation D's (Deposit Accounts & Truth in Savings) |
| **Term features** | Maturity range, early withdrawal penalty, renewal behavior and grace period | CDs and other time accounts |
| **Lifecycle** | Dormancy period, auto-close rules, statement cycle | [Dormancy, Escheat & Closing Accounts](/books/banking-and-lending/dormancy-and-escheat) |
| **Posting** | Overdraft eligibility, posting order class | [Posting Order](/books/banking-and-lending/posting-holds-and-balances#posting-order) |
| **Accounting** | GL mappings per transaction type | [The General Ledger and Its Subledgers](/books/banking-and-lending/core-banking-systems#the-general-ledger-and-its-subledgers) |
| **Disclosures** | The account-opening disclosure, fee schedule and agreement versions it was sold with | 12 CFR 1030.4 |

Mambu's published deposit product configuration is a working example of the list: identity and type, currencies, a maturity period with minimum, maximum and default, withholding tax, `dormancyPeriodDays`, an opening balance range and `maxWithdrawalAmount`, fees each with an amount, a calculation method, a trigger and accounting rules, interest with days-in-year, balance basis, tiered rates as `endingBalance` and `interestRate` pairs and accrual after maturity, overdraft settings, and accounting rules mapping the product's financial resources to GL codes.

Two boundaries keep a product factory sane:

- **Product terms and account terms are different layers.** The product says what an account gets by default; an account can hold an override (a negotiated rate on a commercial money market, a fee waiver for an employee). Overrides are stored on the account with a reason, an approver and an end date, never as a private copy of the product.
- **Terms are data, behavior is code.** "Monthly fee of $12, waived at a $1,500 minimum daily balance" is data. "Waive the fee if the customer has a mortgage with us" is a rule over data from another system; model it as a named, versioned rule the fee references, not as a free-form expression in the product ([What Belongs in Data](/docs/architecture/rules-as-data#what-belongs-in-data)). The smart-contract approach goes further and makes the whole product code, which buys flexibility at the price of testing every product like software.

## Rates, Tiers and Promotions

Rates are where products change most often and where the disclosure rules bite.

- **Fixed or variable.** A fixed rate holds for a stated term. A variable rate moves with an index or at the bank's discretion; the account-opening disclosure must say so, and Regulation DD exempts variable-rate changes from advance notice (below). Index-plus-spread rates need the index as its own effective-dated series and a review frequency (Mambu's index-rate overdraft interest, for example, sets the review frequency when the product is created and logs each rate change as a transaction on the account).
- **Tiers.** Each tier is a balance threshold and a rate, plus the product-level tier method: whole-balance (Appendix A's method A) or marginal (method B). The method is a term; the same thresholds and rates pay different amounts under each ([Balance Methods](/books/banking-and-lending/interest-and-statements#balance-methods)).
- **Introductory and promotional rates.** A rate for a stated period, then the regular rate. Appendix A's APY computation applies the introductory rate for its period and the regular rate for the rest of the year (7.00% for 91 days then 5.00% gives an APY of 5.65%). A promotion is therefore a dated term on the account (start, end, rate, what follows), not a temporary edit to the product, and its end is an event the core runs on the date, not a task someone remembers.
- **Bonuses.** A cash bonus for opening or maintaining a balance is a disclosed term (amount or type, when it's paid, balance and time requirements, 12 CFR 1030.4) with its own eligibility tracking and a 1099-INT consequence when paid.
- **Relationship pricing.** Better rates or waived fees for customers with several products. It's a rule that reads across accounts, so its evaluation date and inputs are recorded with each result.

## Fee Schedules

A fee schedule is a list of fee definitions, each with five parts:

1. **Trigger:** an event (an overdraft paid, an item returned, a wire sent, a stop payment), a date (monthly maintenance, annual), or manual (Mambu's example trigger is `MANUAL`).
2. **Amount method:** flat, percentage of the transaction or balance, or tiered by count.
3. **Conditions and waivers:** minimum balance by the same method the product uses, relationship rules, student or senior status, the first N per period free.
4. **Caps and limits:** per day, per period, and any legal limits that apply.
5. **Accounting:** the GL income line it posts to, which Mambu attaches to each fee as `accountingRules`.

Every fee a bank imposes on a consumer deposit account must be disclosed at opening with its amount (or how it's determined) and conditions (12 CFR 1030.4), and itemized on the periodic statement by type and amount, with overdraft and returned item fees totaled for the period and the year to date ([The Periodic Statement](/books/banking-and-lending/interest-and-statements#the-periodic-statement)). Overdraft and NSF fees carry their own legal history (opt-in for ATM and one-time debit card overdrafts, the 2024 CFPB rule and its nullification) owned by Overdraft, NSF & Fees.

Each assessment records the fee definition and version that produced it, the trigger event, the balance or count it evaluated, and any waiver that applied. A fee waived is a record too, because "you were charged this fee last month and not this month" is a question customers ask, and "how much did we waive under the relationship rule" is one finance asks.

## Versions, Not Edits

Model every product as a sequence of immutable **versions**, each effective from a date, and pin every account to the version it holds. [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model) already does: each `products` row is one version of a product code, and `accounts.product_id` names the exact one.

- **A change creates a version.** The new version has its own effective date and the change that produced it. Nothing about a past version changes after it has been used, so an account's interest, fees and disclosures for any past date are computed from the terms in force then ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Accounts point to versions, and move between them only by an event.** Opening pins an account to the current version. A change in terms moves a defined set of accounts to a new version on its effective date, as a recorded event per account. An account that wasn't moved keeps its version, which is what grandfathering is.
- **Disclosures are generated from versions.** The account-opening disclosure, the fee schedule and the APY a customer saw are rendered from the version and stored with it, so "what did we tell this customer" is a join from the account to the version to the disclosure record (see How to Build It below).
- **Effective dates are business dates.** A version effective December 1 takes effect at the start of that business day in the core, and accruals for November 30 use the old terms, whatever time the batch runs.

This is the Mambu loan behavior made explicit and extended: changes never reach existing accounts by accident. When a change should reach them (a variable rate, an adverse fee change after notice), it does so as a migration of those accounts to the new version, chosen and recorded, which is the Mambu deposit prompt ("Which accounts should the new interest settings apply to?") turned into data.

## Changing Terms on Existing Accounts

US law decides how much notice a change needs, and it differs by product type.

**Consumer deposit accounts (Regulation DD, 12 CFR 1030.5).** A change to a disclosed term that "may reduce the annual percentage yield or adversely affect the consumer" needs written notice, stating the change and its effective date, mailed or delivered "at least 30 calendar days before the effective date of the change." No advance notice is required for:

- rate and APY changes on variable-rate accounts,
- check printing fees,
- any term of a time account with a maturity of one month or less,
- changes the account-opening disclosures already described in full (a fee waiver that ends when employment ends, a promotional waiver that ends on its stated date).

**Time accounts at maturity (12 CFR 1030.5(b) and (c)).** An automatically renewing time account longer than one month gets renewal disclosures at least 30 calendar days before maturity, or at least 20 calendar days before the end of a grace period of at least five calendar days. Over one year, those are full account disclosures for the new term (or, if the rate isn't set, when it will be and a number to call); one year or less, the bank may instead give the new maturity date, rate and APY and any changed terms. A non-renewing time account longer than a year gets notice of the maturity date and whether interest continues after it at least 10 calendar days before maturity.

**Open-end credit (Regulation Z, 12 CFR 1026.9(c)).** Significant changes to an open-end plan not secured by a home need written notice at least 45 days before the effective date, and for credit card accounts the notice must tell the consumer of the right to reject the change before it takes effect. A home equity line needs notice at least 15 days before the change. Rate increases on credit cards are separately limited (12 CFR 1026.55, in Credit Cards as Credit).

Worked dates:

- **A new monthly maintenance fee** on a consumer checking product, effective December 1, 2026: adverse, so notices must be mailed or delivered no later than November 1, 2026.
- **A 12-month CD maturing March 15, 2027** that renews automatically with a 10-day grace period: renewal disclosures by February 13, 2027 (30 days before maturity), or by March 5, 2027 (20 days before the grace period ends on March 25).
- **A variable-rate savings rate cut** from 4.00% to 3.50%: no advance notice, though the bank still records the change as a version and the date each account moved.

A change in terms is therefore a workflow with dates, not a configuration save:

1. **Draft the new version** and classify the change: adverse to the consumer or not, which regulation governs each affected product, and the notice period that results.
2. **Select the affected accounts** as of a date: every account on the old version, or a segment (by state, by program, by opening date).
3. **Compute the notice deadline** from the effective date and the longest notice period that applies, and refuse an effective date that can't be met ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
4. **Generate and send the notices,** each recorded as a disclosure with its version, channel and delivery time, and track failures (returned mail, bounced email) per account.
5. **On the effective date, migrate** the accounts that were noticed in time to the new version, and only those; accounts whose notice failed or went late stay on the old version until they can be noticed properly.
6. **For credit card accounts, honor rejections:** an account whose holder rejected the change stays on the old terms under the rules in Credit Cards as Credit.

Posting order, overdraft coverage and dispute terms are product terms too, so changing them runs through the same workflow ([Posting Order](/books/banking-and-lending/posting-holds-and-balances#posting-order)).

## Grandfathering

**Grandfathering** is leaving existing accounts on old terms when the product changes: the old version stays in force for them, and new accounts get the new one. It happens for three reasons. The bank chooses to (a no-fee checking account kept for existing customers when the product gets a fee, to avoid attrition). The law or contract requires it (a fixed-rate CD keeps its rate to maturity). Or the change couldn't be noticed in time for some accounts.

It has costs that grow quietly:

- **Every grandfathered version is a live product.** Its interest, fees, disclosures, statements and GL mapping must keep working, and every core upgrade, conversion and new regulation must be tested against it. A bank with forty years of product history can have hundreds of live versions of "checking".
- **Grandfathering ends by an event.** A time account's grandfathered terms end at maturity, when renewal moves it to a current product under 12 CFR 1030.5(b). A transaction account's end only by a change in terms with notice, or by closing the product and converting accounts to a successor product (which is itself a change in terms).
- **Deactivated is not retired.** Deactivating a product stops new accounts (in Mambu, existing accounts on a deactivated product stay active for the rest of their term); the product is retired only when its last account closes or moves.

Track grandfathering as data: the number of accounts and balances on each version, the oldest active version per product, and a sunset plan per version. A conversion is the moment every one of them must be mapped to something in the new core ([Product Mapping](/books/banking-and-lending/core-modernization#product-mapping)).

## How to Build It

These tables extend `products`, `accounts`, `fee_assessments` and `disclosures` from [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). There, each `products` row is already one version (a stable `code` plus a `version` number, with the terms as JSONB and `valid_during` saying when new accounts may open on it), and `accounts.product_id` names the exact version an account holds. This chapter types the terms the core computes with, adds tiers, fee definitions and promotions, keeps each account's history of versions, and makes a change in terms a record with its notices. Rates are decimal fractions as in `interest_accruals.annual_rate`; amounts are integer minor units.

```sql
-- Typed terms on each version; products.terms keeps the rest, validated per category.
ALTER TABLE products
  ADD COLUMN rate_source      TEXT CHECK (rate_source IN ('fixed', 'index_spread', 'discretionary')),
  ADD COLUMN index_name       TEXT,
  ADD COLUMN spread           NUMERIC(9, 6),
  ADD COLUMN tier_method      TEXT CHECK (tier_method IN ('whole_balance', 'marginal')),
  ADD COLUMN balance_method   TEXT CHECK (balance_method IN ('daily', 'average_daily')),
  ADD COLUMN day_count        TEXT,              -- 'actual_365', 'actual_360', ...
  ADD COLUMN compounding      TEXT CHECK (compounding IN ('none', 'daily', 'at_crediting')),
  ADD COLUMN crediting        TEXT,              -- 'monthly', 'quarterly', 'at_maturity', ...
  ADD COLUMN rounding_rule    TEXT,
  ADD COLUMN minimum_to_earn  BIGINT,
  ADD COLUMN term_months      INTEGER,           -- time accounts
  ADD COLUMN grace_days       INTEGER,
  ADD COLUMN early_withdrawal_penalty JSONB,     -- e.g. {"days_interest": 90}
  ADD COLUMN renews_to_code   TEXT,              -- the product line a maturing account renews into
  ADD COLUMN dormancy_days    INTEGER,
  ADD COLUMN created_by       UUID NOT NULL,
  ADD COLUMN approved_by      UUID NOT NULL,
  ADD CONSTRAINT products_two_people CHECK (approved_by <> created_by);

CREATE TABLE product_rate_tiers (
  product_id     UUID NOT NULL REFERENCES products (id),
  floor_balance  BIGINT NOT NULL,                -- the tier starts at this balance
  annual_rate    NUMERIC(9, 6) NOT NULL,
  PRIMARY KEY (product_id, floor_balance)
);

CREATE TABLE product_fees (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id      UUID NOT NULL REFERENCES products (id),
  code            TEXT NOT NULL,                 -- 'monthly_service', 'overdraft', 'returned_item', 'wire_out', ...
  trigger         TEXT NOT NULL,                 -- 'event:overdraft_paid', 'date:monthly', 'manual'
  amount_method   TEXT NOT NULL CHECK (amount_method IN ('flat', 'percent', 'tiered_count')),
  amount          BIGINT,
  percent         NUMERIC(9, 6),
  waiver_rule     TEXT,                          -- a named, versioned rule
  cap_per_day     INTEGER,
  cap_per_period  INTEGER,
  gl_mapping_id   UUID NOT NULL REFERENCES gl_mappings (id),
  UNIQUE (product_id, code)
);

-- Which version each account held over time, and any approved overrides.
CREATE TABLE account_terms (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  product_id      UUID NOT NULL REFERENCES products (id),
  valid_during    DATERANGE NOT NULL,            -- business dates
  reason          TEXT NOT NULL CHECK (reason IN ('opened', 'term_change', 'renewal',
                    'conversion', 'override')),
  term_change_id  UUID,                          -- set when reason = 'term_change'
  overrides       JSONB,                         -- negotiated rate or fee waiver, with approver and end
  EXCLUDE USING gist (account_id WITH =, valid_during WITH &&)
);

-- Promotions as dated terms on the account.
CREATE TABLE account_promotions (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  kind            TEXT NOT NULL CHECK (kind IN ('intro_rate', 'bonus', 'fee_waiver')),
  annual_rate     NUMERIC(9, 6),
  bonus_amount    BIGINT,
  conditions      JSONB,
  during          DATERANGE NOT NULL,
  disclosure_id   UUID NOT NULL REFERENCES disclosures (id),
  outcome         TEXT CHECK (outcome IN ('earned', 'forfeited', 'expired'))
);

-- A change in terms, and each account's notice.
CREATE TABLE term_changes (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  from_product_id  UUID NOT NULL REFERENCES products (id),
  to_product_id    UUID NOT NULL REFERENCES products (id),
  adverse          BOOLEAN NOT NULL,
  governing_rule   TEXT NOT NULL,                -- '12 CFR 1030.5(a)', '12 CFR 1026.9(c)(2)', 'none:variable_rate'
  notice_days      INTEGER NOT NULL,
  effective_date   DATE NOT NULL,
  notice_deadline  DATE GENERATED ALWAYS AS (effective_date - notice_days) STORED,
  selection        JSONB NOT NULL,               -- the account criteria, as of a date
  status           TEXT NOT NULL CHECK (status IN ('draft', 'approved', 'noticing', 'applied', 'cancelled')),
  approved_by      UUID
);

CREATE TABLE term_change_accounts (
  term_change_id  UUID NOT NULL REFERENCES term_changes (id),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  disclosure_id   UUID REFERENCES disclosures (id),  -- the notice as sent
  sent_at         TIMESTAMPTZ,
  delivery_failed BOOLEAN NOT NULL DEFAULT false,
  rejected_at     TIMESTAMPTZ,                      -- credit card right to reject
  applied_at      TIMESTAMPTZ,
  PRIMARY KEY (term_change_id, account_id)
);

-- Each assessment names the fee definition and the inputs it evaluated.
ALTER TABLE fee_assessments
  ADD COLUMN product_fee_id  UUID REFERENCES product_fees (id),
  ADD COLUMN evaluated       JSONB,               -- balance, count, rule inputs
  ADD COLUMN waived_by_rule  TEXT;

-- Disclosures rendered from a version point to it.
ALTER TABLE disclosures
  ADD COLUMN product_id UUID REFERENCES products (id);
```

Accounts that may move on a change's effective date, which the apply job runs and the notice report reconciles against:

```sql
SELECT tca.account_id
FROM term_changes tc
JOIN term_change_accounts tca ON tca.term_change_id = tc.id
WHERE tc.id = :term_change_id
  AND tc.status = 'noticing'
  AND (NOT tc.adverse
       OR (tca.sent_at IS NOT NULL
           AND NOT tca.delivery_failed
           AND tca.sent_at::date <= tc.notice_deadline))
  AND tca.rejected_at IS NULL;
```

How it runs:

1. **A product change is a new `products` row** (same `code`, next `version`) created by one person and approved by another, with its disclosures rendered from it before any account can hold it.
2. **Account opening sets `accounts.product_id`** and writes `account_terms` with `reason = 'opened'`, beside the disclosure records the customer received.
3. **Every interest and fee computation resolves the account's version** from `account_terms` for the business date it's computing, plus any override and promotion in force that day.
4. **A term change** selects accounts, computes its deadline, sends notices as `disclosures` rows, and on the effective date closes each eligible account's current `account_terms` range, opens one on the new version and updates `accounts.product_id`; ineligible accounts are reported, not moved.
5. **Promotion ends and maturities** are date events in end of day, moving accounts to their following terms and recording the outcome.

## Auditing

Product records answer the examiner's Truth in Savings questions (were the terms disclosed, were changes noticed, did the account get what it was promised) and the customer's. Beyond [Audit Trails](/docs/architecture/audit-trails):

- **Every product version,** who drafted and approved it, its effective date, and the disclosures rendered from it, kept for as long as any account held it plus the retention period.
- **Every account's terms history:** which version it held over which dates, why it moved, and the change or renewal that moved it.
- **Every term change:** its classification (adverse or not, governing rule, notice period), the selection, each notice as sent with delivery evidence, and which accounts moved on the effective date and which didn't, with the reason.
- **Every fee assessment and waiver** with the definition, version and inputs that produced it.
- **Overrides** with approver, reason and end date, reviewed periodically so negotiated terms don't outlive their reason.

## What This Means for the System You Build

- **Products are immutable versions; accounts point to versions** over dated ranges and move only by recorded events.
- **Separate product terms from account overrides and promotions,** each dated, approved and tied to the disclosure that described it.
- **Model fees as definitions with trigger, amount method, waiver rule, caps and GL mapping,** and record every assessment and waiver against the definition.
- **Make a change in terms a dated workflow:** classify, select, compute the deadline from 1030.5 or 1026.9, notice, then migrate only the accounts noticed in time.
- **Render every disclosure from the version it describes,** so what the customer saw and what the core applies can't drift apart.
- **Count and plan grandfathered versions;** each one is a live product until its last account moves or closes.

## References

**Law and regulation**

- [12 CFR 1030.4: Account disclosures (Regulation DD)](https://www.consumerfinance.gov/rules-policy/regulations/1030/4/), timing and content of account-opening disclosures, including fees, time account features and bonuses
- [12 CFR 1030.5: Subsequent disclosures](https://www.consumerfinance.gov/rules-policy/regulations/1030/5/), the 30-day change-in-terms notice and its exceptions, renewal disclosures for time accounts, and the 10-day notice for non-renewing time accounts
- [12 CFR 1030 Appendix A: Annual percentage yield calculation](https://www.consumerfinance.gov/rules-policy/regulations/1030/a/), tiering methods and introductory-rate APY
- [12 CFR 1026.9: Subsequent disclosure requirements (Regulation Z)](https://www.consumerfinance.gov/rules-policy/regulations/1026/9/), the 45-day notice for open-end plans not secured by a home, the right to reject for credit cards, and the 15-day notice for home equity plans

**Vendor documentation**

- [Mambu: Deposit products configuration](https://docs.mambu.com/docs/deposit-products-configuration/), the parameters of a deposit product as configuration, fees with triggers and accounting rules, and deactivating used products
- [Mambu: Managing deposit products](https://docs.mambu.com/docs/managing-deposit-products/), edits updating existing accounts, the choice of which accounts get new interest settings, mid-period recalculation, and deactivation
- [Mambu: Managing loan products](https://docs.mambu.com/docs/managing-loan-products/), edits affecting only new loan accounts
- [Mambu: Changing interest rates on active deposit accounts](https://docs.mambu.com/docs/changing-the-interest-rate/), account-level and product-level rate changes, backdating, and the logged rate-change transaction
- [Thought Machine: Vault Core](https://www.thoughtmachine.net/vault-core), products as programmable smart contracts on one ledger
