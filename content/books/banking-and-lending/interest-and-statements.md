+++
title = "Interest, APY & Statements"
description = "Day counts, balance methods, daily accrual against crediting, compounding, the Reg DD APY and APY earned formulas, statements, and 1099-INT and 1098."
category = "Banking & Lending Industry"
order = 2410
part = "The Core"
tags = ["banking", "interest", "apy", "statements", "regulation-dd"]
+++

Interest is the product a bank sells on both sides of its balance sheet, and the core computes it for every account every day. A deposit's interest is the bank's largest expense; a loan's is its largest income (Bank Economics & Balance Sheet Risk covers what the spread between them does to margins). The arithmetic looks trivial (balance × rate × time) and is where the most consequential rounding, timing and disclosure rules in banking live. Get the day count wrong and every account is off by a few cents a month, which across two million accounts is a misstated income statement. Disclose the yield wrong and the error is a Truth in Savings violation on every account opened under it.

This chapter is the engineering of interest on deposit accounts, with the loan side where it shares the machinery: how interest is computed (day counts and balance methods), when it accrues and when it's paid (accrual against crediting and compounding), how the law requires it to be disclosed (Regulation DD's APY and APY earned), what the statement must show, and the year-end tax forms. Credit card interest calculation methods belong to Credit Cards as Credit, and amortization and daily simple interest on loans to Loan Servicing; the money rules (integer minor units, explicit rounding) are in [Money & Amounts](/docs/payments/money).

## How the Platforms Do It

Core vendors expose the same handful of choices as product settings. Mambu's public documentation is the clearest example, and Regulation DD sets the bounds for US consumer deposits.

| Setting | Mambu's options | What Regulation DD allows (US consumer deposits) |
| --- | --- | --- |
| **Balance basis** | Average daily, minimum daily, or end of day (optionally capped at a maximum balance) | Daily balance or average daily balance; ending, lowest and investable balance methods are prohibited |
| **Day count** | Actual/365 Fixed, Actual/360, 30E/360 ISDA, Actual/Actual ISDA | A daily rate of at least 1/365 of the rate; 1/360 if applied 365 days a year; 1/366 in a leap year |
| **Accrual booking** | Daily (at 00:00 for the prior day) or monthly (last day at 23:59:59), per product | Not prescribed; accrual must begin by the Regulation CC business day |
| **Crediting** | Per product "interest paid into account" settings | No required compounding or crediting frequency |
| **Overdraft interest** | On the day's maximum overdrawn amount; fixed or index plus spread; no negative rates | Overdraft as credit is outside Regulation DD |

The contrast in the first row is a good test of whether a team has read the rule. Mambu offers **minimum daily balance** because it sells globally; a US consumer deposit product configured with it pays interest on the day's lowest balance, which Regulation DD's commentary lists as a prohibited method ("low balance"). The core will let you; the law won't.

## Day Count Conventions

A **day count convention** turns an annual rate into a daily one. The four in common use, applied to $10,000.00 at 4.00% for October (31 days):

| Convention | Daily factor | October interest | Where it's typical |
| --- | --- | --- | --- |
| **Actual/365 (Fixed)** | Actual days ÷ 365 | $10,000 × 0.04 × 31 ÷ 365 = **$33.97** | US consumer deposits; many consumer loans |
| **Actual/360** | Actual days ÷ 360 | $10,000 × 0.04 × 31 ÷ 360 = **$34.44** | Commercial loans, money markets; deposits only if applied all 365 days |
| **30/360** | Every month 30 days ÷ 360 | $10,000 × 0.04 × 30 ÷ 360 = **$33.33** | Mortgages and bonds; equal monthly interest |
| **Actual/Actual** | Actual days ÷ actual days in the year | $33.97 (or $33.88 in a leap year) | Government securities; leap-year-exact deposits |

Mambu's documentation gives the same comparison for $1,000 at 10%: $8.22 for a 30-day month and $8.49 for a 31-day one under Actual/365, $7.78 for 28 days and $8.61 for 31 under Actual/360, and $8.33 for any month under 30E/360.

Actual/360 applied every day of the year pays more than the nominal rate says: 4.00% × 365 ÷ 360 is an effective simple rate of about 4.0556%. That's why Regulation DD allows a 1/360 daily rate on deposits only "as long as it is applied 365 days a year", which makes it more generous to the depositor, never less. On a commercial loan the same convention favors the lender, and it is a standard term the borrower should see in the note.

The convention is a product setting with a version, like the rate. Changing it on a live product changes every account's interest the next day.

## Balance Methods

The **balance method** decides which balance the daily rate applies to. Regulation DD (12 CFR 1030.7) requires interest on "the full amount of principal in an account for each day" by one of two methods:

- **Daily balance:** each day's rate applied to that day's closing balance.
- **Average daily balance:** a periodic rate applied to the average of the period's daily balances.

With a single rate the two give the same interest, because the sum of each day's balance × daily rate equals the average balance × daily rate × days. They diverge when the rate depends on the balance (tiers) or when a minimum balance is required to earn interest: Regulation DD requires the same method for the minimum as for the interest, so an average-daily-balance account that needs $1,000 to earn checks the average, not any one day. Negative balances count as zero for both.

**Tiered rates** come in two shapes, and Regulation DD's Appendix A names them. Using its tiers (5.25% up to $2,500, 5.50% from $2,500 to $15,000, 5.75% above), a $10,000 balance for a year, simple interest:

- **Tiering method A (whole balance):** the whole balance earns the rate of its tier. $10,000 × 5.50% = **$550.00**. Each tier has a single APY (Appendix A gives 5.39%, 5.65% and 5.92% for these tiers, with compounding).
- **Tiering method B (marginal):** each slice earns its own tier's rate. $2,500 × 5.25% + $7,500 × 5.50% = $131.25 + $412.50 = **$543.75**, a blended 5.4375%. The APY for each tier above the first is a range, because it depends on how far into the tier the balance sits (Appendix A gives 5.39% to 5.61% for the second tier).

A core configured for method A while the disclosures describe method B (or the reverse) pays every account in the upper tiers the wrong amount. The tier method belongs in the product definition next to the tiers ([Rates, Tiers and Promotions](/books/banking-and-lending/product-configuration#rates-tiers-and-promotions)).

## Accrual Is Daily

Interest **accrues** every day and is **credited** (paid into the account) or **billed** (on a loan) periodically. The two are separate events with separate entries, and most interest bugs come from conflating them.

**Accrual** is the bank recognizing what it owes or is owed. Each night, after the day's posting, the core computes the day's interest for every interest-bearing account and adds it to the account's accrued-interest balance. On a deposit the accounting is: debit interest expense, credit accrued interest payable. On a loan: debit interest receivable, credit interest income. Mambu books these to the GL daily or monthly, per product, and each booking "reverses the previous" entries and books the current accrued total; either way the GL sees an aggregate per product and branch, and the account subledger holds the detail ([The General Ledger and Its Subledgers](/books/banking-and-lending/core-banking-systems#the-general-ledger-and-its-subledgers)).

**Crediting** moves accrued interest into the customer's balance: debit accrued interest payable, credit the deposit account. Only then is it spendable, shown as "interest paid", and, for tax purposes, paid (below).

**Precision lives in the accrual, rounding in the credit.** Regulation DD's Appendix A allows the daily rate and daily interest to be carried to at least five decimal places, and requires the interest figure used in APY earned to be the two-decimal amount actually paid. That's a design rule as much as a disclosure one. At $4,000.00 and 3.00% Actual/365, one day's interest is $0.328767. Rounded each day to $0.33 and summed over a 30-day month, the account gets $9.90; accrued unrounded and rounded once at crediting, it gets $9.86. Four cents per account per month, in the customer's favor here, but in the bank's on other balances, across every account, is a systematic error an examiner will find. Store accruals as exact decimals (or integer micro-units), round once per crediting with a stated rule, and carry nothing forward implicitly ([Rounding](/docs/payments/money#rounding)).

## When Interest Starts and Stops

Regulation DD fixes both ends.

- **Start:** interest on a noncash deposit "shall begin to accrue not later than the business day specified" for that deposit by the Expedited Funds Availability Act and Regulation CC. A bank may use Regulation CC's rules to decide when a deposit is made, and need not pay interest on a check that is later returned unpaid. Because availability holds and interest accrual come from the same deposit item, the core should date the accrual from the item's availability schedule, not from when someone posts it ([Effective Dates and Backdating](/books/banking-and-lending/posting-holds-and-balances#effective-dates-and-backdating)).
- **Stop:** interest accrues until the funds are withdrawn. The regulation's example: a check debited on a Tuesday means interest accrues through Monday.
- **Closing before crediting:** a bank may withhold accrued-but-uncredited interest on an account closed before the crediting date, but only if it disclosed that it would. A closure flow that silently zeroes accrued interest is a violation on a product that didn't disclose it.
- **Withdrawals before crediting:** the bank can't avoid paying interest on funds withdrawn before the crediting date, though it may delay paying it until that date.
- **Dormancy:** some cores stop accruing on dormant accounts (Mambu's dormancy setting does); whether a US product may is a disclosure question, and Dormancy, Escheat & Closing Accounts has the state law side.

## Compounding

**Compounding** is interest earning interest. Regulation DD doesn't require any frequency, but the disclosed APY must reflect the one the account uses, and the core must match it.

There are two common designs. **Compounded at crediting:** accrued interest joins the balance only when credited, so monthly crediting means monthly compounding. **Compounded daily, credited monthly:** each day's accrual is computed on the balance plus interest accrued but not yet credited. At $4,000.00 and 3.00% for 30 days, simple accrual gives $9.8630 and daily compounding $9.8748, both $9.86 or $9.87 at crediting. The difference is a fraction of a cent on a month, and exactly the kind of difference that must agree with the APY on the disclosure.

The annual effect at 4.00%:

| Compounding | APY |
| --- | --- |
| Annually (or simple, credited once a year) | 4.00% |
| Quarterly | (1 + 0.04/4)^4 − 1 = 4.06% |
| Monthly | (1 + 0.04/12)^12 − 1 = 4.07% |
| Daily | (1 + 0.04/365)^365 − 1 = 4.08% |

## APY: The Disclosure Formula

The **annual percentage yield** is the number the law lets a bank advertise and requires it to disclose, defined by formula in Regulation DD Appendix A so that every bank computes it the same way:

> APY = 100 × [(1 + Interest ÷ Principal)^(365 ÷ Days in term) − 1]

For an account with no stated maturity, or a term of exactly 365 days, it reduces to APY = 100 × (Interest ÷ Principal). The interest is what the principal would earn over the term at the account's rate and compounding, assuming no withdrawals or other transactions.

Appendix A's own examples: a NOW account earning $61.68 on $1,000 over a 365-day year has an APY of 6.17%; a six-month, $1,000 CD earning $30.37 over 182 days has an APY of 6.18%.

A worked example on a six-month CD, $10,000.00 at 4.00% for 182 days:

- **Compounded daily:** interest = $10,000 × [(1 + 0.04/365)^182 − 1] = $201.44. APY = 100 × [(1 + 201.44/10,000)^(365/182) − 1] = **4.08%**.
- **Simple, paid at maturity:** interest = $10,000 × 0.04 × 182 ÷ 365 = $199.45. APY = 100 × [(1 + 199.45/10,000)^(365/182) − 1] = **4.04%**.

The annualizing exponent is why a short CD paying simple interest still shows an APY above its rate: the formula assumes the proceeds could be reinvested on the same terms.

The special cases the formula handles, from Appendix A:

- **Stepped rates** apply each rate for its contractual period: a six-month CD paying 5.00% for 91 days and 5.50% for 92 days has an APY of about 5.39%.
- **Variable rates** assume the initial rate stays in effect for the year; with an introductory rate, the introductory rate for its period and the regular rate for the rest. A 7.00% introductory rate for 91 days followed by 5.00% gives 5.65%.
- **Time accounts over a year that pay interest at least annually** without compounding may disclose an APY equal to the rate (or a day-weighted composite for stepped rates).
- **Tiered accounts** disclose an APY per tier, or a range per tier under method B.

The disclosure rules (when the APY must be stated, advertising, "annual percentage yield" spelled out) are in Deposit Accounts & Truth in Savings; what matters to the core is that the APY on a disclosure is generated from the same product version, rate, compounding and day count the core will apply ([Versions, Not Edits](/books/banking-and-lending/product-configuration#versions-not-edits)).

## APY Earned: The Statement Formula

The **APY earned** is the yield the account actually earned over a statement period, shown on the periodic statement:

> APY earned = 100 × [(1 + Interest earned ÷ Balance)^(365 ÷ Days in period) − 1]

where the balance is the period's average daily balance and the interest earned is the two-decimal amount actually paid or accrued for the period. Appendix A's examples: average daily balance of $1,000 ($1,500 for 15 days, $500 for 15) with $5.25 of interest over 30 days is 6.58%; $21 on $2,000 over 91 days is 4.28%.

A worked example. In a 30-day statement period an account holds $2,000.00 for 10 days and $5,000.00 for 20 days, at 3.00% Actual/365:

- Average daily balance: ($2,000 × 10 + $5,000 × 20) ÷ 30 = **$4,000.00**.
- Interest: $4,000 × 0.03 × 30 ÷ 365 = $9.8630, paid as **$9.86**.
- APY earned: 100 × [(1 + 9.86/4,000)^(365/30) − 1] = **3.04%**.

The rules that make the formula an engineering spec:

- **The two-decimal rule.** If $20.074 accrued and $20.07 was paid, $20.07 goes into the formula.
- **Negative balances are zero** in the average.
- **Partial periods.** For an account opened or closed during the period, the APY earned uses the balances for the days it was open.
- **Statements more often than crediting.** If statements are monthly and interest is credited quarterly, interest accrued but not yet credited must be included in the balance for the later monthly statements; if statements are as frequent as crediting or less, it may not be. Where the bank calculates interest over a period other than the statement period (quarterly average daily balance with monthly statements), the first two monthly statements may omit the APY earned and interest and the third shows them for the quarter (12 CFR 1030.6(b)).
- **Daily balance method with statements more often than compounding** uses a separate formula in Appendix A (its example: $4.11 on a $1,000 daily balance over 30 days is 5.00%).

## The Periodic Statement

Regulation DD doesn't require a bank to send statements; if it does, 12 CFR 1030.6 says what a deposit statement must show:

- **The APY earned** for the period, computed as above.
- **The amount of interest** that accrued during the period, "even if it was not credited", labeled "interest paid" if credited and "interest accrued" or "interest earned" if not.
- **Fees** debited during the period, itemized by type and amount.
- **The length of the period,** as a number of days or beginning and ending dates (saying whether both dates are included).
- **Total overdraft fees and total returned item fees** for the period and the calendar year to date, the first labeled "Total Overdraft Fees", near the itemized fees and in a format substantially similar to Sample Form B-10 (12 CFR 1030.11(a)).

Loan statements follow their own rules (Regulation Z for open-end credit and many mortgages, owned by Credit Cards as Credit and Loan Servicing), and Regulation E adds electronic transfer details to any account with EFTs. For the core, a statement is a **closed artifact**: generated from a closed statement cycle, stored as rendered, and never regenerated with different numbers. A correction after the statement is a line on the next one ([Closed Periods Stay Closed](/docs/payments/accounting#closed-periods-stay-closed)).

Statement cycles are per account, not per bank. A bank that cycles every account at month end puts its whole statement run in one night; one that staggers cycles by account spreads the load and the call center volume. Either way, interest crediting, the APY earned period and the statement period should line up wherever the product allows, because every mismatch is a special case in the formula above.

## Tax Reporting: 1099-INT and 1098

The interest the core credits and collects is also tax information, reported once a year to the customer and the IRS.

**Form 1099-INT** reports interest paid to a depositor. A bank files it for each person paid at least $10 of interest (box 1). Interest counts as paid when it is "credited or set apart" for the person without substantial limitation, which ties the tax year to the crediting date: interest credited on December 31 is that year's income, and interest that accrued in December but is credited on January 1 is next year's. Interest or principal forfeited as an early withdrawal penalty on a time deposit goes in box 2, without reducing box 1. Backup withholding (24%, when the depositor hasn't provided a correct TIN) goes in box 4. Corporations and other exempt recipients don't get one.

**Form 1098** reports mortgage interest a lender received from an individual: $600 or more per mortgage in the calendar year, with the outstanding principal on January 1, the origination date, points paid on a purchase, and optionally property taxes paid from escrow. Interest is reported for the year it properly accrues: a payment received on December 20 for interest accrued through December 31 counts for that year even if due January 31.

Both are furnished to recipients by January 31 (February 2 for tax year 2025, because January 31, 2026 fell on a Saturday) and filed electronically with the IRS by March 31; the electronic filing threshold is 10 information returns of all types combined.

Three things make tax reporting a core design concern rather than a year-end export:

- **Year-to-date interest per party, per account, per tax year** is a stored figure maintained by every crediting, adjustment and reversal, not a January query that has to guess what a reversal in March meant. A backdated interest correction in January for the prior December changes last year's figure.
- **Ownership on the reporting date.** The form goes to one owner's TIN, so joint accounts need a stored rule for whose. An ownership change mid-year, a deceased owner, or a conversion mid-year (the new core must carry the old core's year-to-date figures, [Conversion Weekends](/books/banking-and-lending/core-modernization#conversion-weekends)) all need defined rules.
- **Corrections after filing** are corrected returns, so the forms as furnished are retained alongside any corrections.

## How to Build It

These tables extend `interest_accruals`, `statements` and `accounts` from the core data model in The Banking & Lending Business; rates, tiers and day counts come from the product version in [Products & Product Configuration](/books/banking-and-lending/product-configuration#how-to-build-it). Accrual amounts are stored in micro-units (millionths of the currency's major unit) so daily accrual keeps the precision Appendix A allows; everything credited is integer minor units.

```sql
-- One row per account per accrual day.
ALTER TABLE interest_accruals
  ADD COLUMN accrual_date      DATE NOT NULL,
  ADD COLUMN product_version_id UUID NOT NULL,          -- the terms in force that day
  ADD COLUMN balance_basis     TEXT NOT NULL CHECK (balance_basis IN ('daily', 'average_daily')),
  ADD COLUMN day_count         TEXT NOT NULL CHECK (day_count IN ('act_365', 'act_360', '30_360', 'act_act')),
  ADD COLUMN accrual_balance   BIGINT NOT NULL,         -- minor units; negative stored as zero
  ADD COLUMN annual_rate_bp    NUMERIC(12, 6) NOT NULL, -- rate in basis points, after tiers and promotions
  ADD COLUMN tier_detail       JSONB,                   -- per-slice balance and rate under marginal tiering
  ADD COLUMN amount_micros     BIGINT NOT NULL,         -- the day's interest, unrounded to six places
  ADD COLUMN accrued_to_date_micros BIGINT NOT NULL,    -- since the last crediting
  ADD COLUMN journal_entry_id  UUID REFERENCES journal_entries (id),
  ADD COLUMN corrects_id       UUID REFERENCES interest_accruals (id),
  ADD CONSTRAINT interest_accruals_day_key UNIQUE NULLS NOT DISTINCT (account_id, accrual_date, corrects_id);

-- Each crediting (or loan interest billing) rounds once and records how.
CREATE TABLE interest_credits (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  period           DATERANGE NOT NULL,               -- accrual days covered
  accrued_micros   BIGINT NOT NULL,
  credited_amount  BIGINT NOT NULL,                  -- minor units actually paid
  rounding_rule    TEXT NOT NULL,                    -- 'half_up', 'half_even', 'down'
  residual_micros  BIGINT NOT NULL,                  -- accrued minus credited; disposed of by rule, never silently carried
  transaction_id   UUID NOT NULL REFERENCES transactions (id),
  tax_year         SMALLINT NOT NULL,                -- from the crediting date
  UNIQUE (account_id, period)
);

-- What the statement showed, as computed, kept with the rendered document.
ALTER TABLE statements
  ADD COLUMN period              DATERANGE NOT NULL,
  ADD COLUMN days_in_period      INTEGER NOT NULL,
  ADD COLUMN average_daily_balance BIGINT NOT NULL,
  ADD COLUMN interest_amount     BIGINT NOT NULL,
  ADD COLUMN interest_label      TEXT NOT NULL CHECK (interest_label IN ('interest_paid', 'interest_earned', 'interest_accrued')),
  ADD COLUMN apy_earned_bp       INTEGER,            -- NULL when the period's figures are deferred to a later statement
  ADD COLUMN overdraft_fees_period BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN overdraft_fees_ytd    BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN returned_item_fees_period BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN returned_item_fees_ytd    BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN rendered_uri        TEXT NOT NULL,       -- immutable
  ADD COLUMN rendered_sha256     BYTEA NOT NULL;

-- Year-end tax reporting, maintained as interest is credited or collected.
CREATE TABLE tax_reportables (
  account_id     UUID NOT NULL REFERENCES accounts (id),
  party_id       UUID NOT NULL REFERENCES parties (id),   -- the owner reported to
  tax_year       SMALLINT NOT NULL,
  form           TEXT NOT NULL CHECK (form IN ('1099-INT', '1098')),
  box            TEXT NOT NULL,                            -- '1', '2', '4' for 1099-INT; '1', '2', '6', '10' for 1098
  amount         BIGINT NOT NULL,
  PRIMARY KEY (account_id, tax_year, form, box)
);

CREATE TABLE tax_forms (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id       UUID NOT NULL REFERENCES parties (id),
  tax_year       SMALLINT NOT NULL,
  form           TEXT NOT NULL,
  corrects_id    UUID REFERENCES tax_forms (id),
  furnished_at   TIMESTAMPTZ,
  filed_at       TIMESTAMPTZ,
  content        JSONB NOT NULL,                            -- the boxes as furnished
  rendered_uri   TEXT NOT NULL
);
```

APY earned for a closed statement, computed from the stored snapshots and the credited amount, the query a statement job and a complaint investigation should both get the same answer from:

```sql
WITH days AS (
  SELECT b.business_date, GREATEST(b.ledger_balance, 0) AS bal
  FROM balance_snapshots b
  WHERE b.account_id = :account_id AND b.business_date <@ :period
), adb AS (
  SELECT AVG(bal)::numeric AS adb, COUNT(*) AS days FROM days
)
SELECT adb.adb,
       :interest_paid AS interest,
       ROUND(100 * (POWER(1 + :interest_paid / NULLIF(adb.adb, 0), 365.0 / adb.days) - 1), 2) AS apy_earned
FROM adb;
```

How it runs:

1. **Accrual is an end-of-day step after posting,** one row per interest-bearing account per day, with the product version, rate, basis and balance it used ([End of Day and the Business Date](/books/banking-and-lending/posting-holds-and-balances#end-of-day-and-the-business-date)).
2. **The GL entry** for accruals posts per product and branch with `journal_line_sources` back to the accrual rows.
3. **Crediting rounds once,** records the residual and the rule, posts the customer transaction, and updates `tax_reportables` for the crediting date's tax year.
4. **Backdated corrections** write correcting accrual rows (`corrects_id`) for the affected days and post the difference at the next crediting or as an immediate adjustment, including the tax year it belongs to.
5. **Statements** are computed from closed snapshots and credits, rendered, hashed and stored; the fee totals come from the fee assessments in the period and year.

## Auditing

Interest is computed for every account every day, so examiners test it by sample and by recomputation: pick an account, recompute a month's interest and the APY earned from the disclosed terms, and compare. Beyond [Audit Trails](/docs/architecture/audit-trails), the records that make that possible:

- **Each accrual row** keeps the balance, rate, tier detail, day count, basis and product version it used, so the recomputation reads the core's inputs, not today's configuration.
- **Each crediting** keeps the unrounded accrual, the credited amount, the rounding rule and the residual.
- **Each statement** keeps the figures as computed and the rendered document, hashed; corrections appear on later statements, never as regenerated ones.
- **Each disclosure's APY** traces to the product version that produced it, so "the APY on the disclosure didn't match what the account paid" is a join, not an argument.
- **Tax forms as furnished and as corrected,** with the year-to-date figures behind them and the adjustments that changed them.

## What This Means for the System You Build

- **Day count, balance method, tier method and compounding are versioned product terms,** checked against Regulation DD for US consumer deposits (no minimum-balance method, at least 1/365 daily).
- **Accrue daily with high precision, credit periodically with one rounding,** and record the residual and the rule.
- **Date accrual from the deposit's Regulation CC business day** and stop it on the day before the withdrawal posts; corrections carry value dates.
- **Generate the disclosed APY from the same product version the core applies,** and recompute APY earned from stored snapshots and the amount actually paid.
- **Treat statements as closed, hashed artifacts** with the Regulation DD fields, including the overdraft and returned item totals for the period and the year.
- **Maintain tax figures as interest is credited,** by party and tax year, and carry them across conversions and ownership changes.

## References

**Law and regulation**

- [12 CFR 1030 Appendix A: Annual percentage yield calculation (Regulation DD)](https://www.consumerfinance.gov/rules-policy/regulations/1030/a/), the APY and APY earned formulas, worked examples, tiering methods A and B, rounding, negative balances and accrued-but-uncredited interest
- [12 CFR 1030.7: Payment of interest](https://www.consumerfinance.gov/rules-policy/regulations/1030/7/), daily balance and average daily balance methods, the 1/365 and 1/360 daily rates, prohibited methods, accrual start and closing before crediting
- [12 CFR 1030.6: Periodic statement disclosures](https://www.consumerfinance.gov/rules-policy/regulations/1030/6/), APY earned, interest, fees, the period, and calculation periods that differ from statement periods
- [12 CFR 1030.11: Additional disclosure requirements for overdraft services](https://www.consumerfinance.gov/rules-policy/regulations/1030/11/), total overdraft and returned item fees for the period and the calendar year to date

**Tax**

- [IRS: Instructions for Forms 1099-INT and 1099-OID](https://www.irs.gov/instructions/i1099int), the $10 threshold, interest paid when credited, early withdrawal penalties in box 2, backup withholding and exempt recipients
- [IRS: Instructions for Form 1098](https://www.irs.gov/instructions/i1098), the $600 per-mortgage threshold, the boxes and the year interest properly accrues
- [IRS: General Instructions for Certain Information Returns](https://www.irs.gov/instructions/i1099gi), furnishing by January 31 (February 2, 2026), electronic filing by March 31, the 10-return threshold and the 24% backup withholding rate

**Vendor documentation**

- [Mambu: Interest calculation methods in deposit accounts](https://docs.mambu.com/docs/interest-calculation-methods-in-deposit-accounts/), balance bases, the day count conventions with worked figures, and overdraft interest
- [Mambu: Cash vs accruals accounting](https://docs.mambu.com/docs/cash-vs-accruals-accounting/), daily or monthly accrual booking, reversal of the previous booking, and aggregation per product and branch
