+++
title = "Banking & Lending Metrics"
description = "One definition per banking and lending metric over the book's tables: deposits, NIM, efficiency, delinquency, roll rates, losses, fraud, servicing and spend."
category = "Banking & Lending Industry"
order = 2475
part = "Running the Platform"
tags = ["banking", "lending", "metrics", "credit-risk", "delinquency", "analytics", "data-model"]
+++

A bank runs on a few dozen numbers, and most of them have regulatory definitions that differ from the ones its own teams use. Delinquency is 30 or more days past due in the Federal Reserve's statistics, 1 day past due in a collections queue, and measured from the oldest unpaid installment or from the last payment depending on who wrote the query. A charge-off rate is net of recoveries and annualized against average loans in the call report data and gross, monthly and against the opening balance in a lender's investor deck. Net interest margin is over average earning assets for a bank and over average assets for a credit union. A cost of deposits counts noninterest-bearing balances or doesn't. A board, an examiner, an investor and a warehouse lender all read "the same" number and compute different things, and the arguments that follow are about the definition.

This chapter owns the volume's metric definitions: one definition per metric, the formula over the book's own tables, and where the common variants disagree. Earlier chapters store the inputs (balance snapshots, journal lines, interest accruals, loans and installments, delinquency snapshots, charge-offs and recoveries, cases, applications and decisions, card program economics) and the economics behind them ([Bank Economics & Balance Sheet Risk](/books/banking-and-lending/bank-economics), [The Lending Business](/books/banking-and-lending/lending-business), [The Spend Management Business](/books/banking-and-lending/spend-management)); this chapter is the arithmetic. The general method (one definition per metric with its version, grain and business date; frozen periods; reconciliation to source) is the playbook's [One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric). Acceptance, authorization and dispute rates are the Payments volume's [Payments Metrics](/books/payments/payments-metrics); store metrics are [Commerce Metrics](/books/commerce/commerce-metrics). The chapter extends `balance_snapshots`, `loans`, `schedule_installments` and `delinquency_snapshots` (with an accrual status), and adds `metric_definitions` and `metric_values` in the same shape as the other volumes' metrics chapters.

## Why the Same Metric Disagrees

Six choices change most numbers in this chapter, and each definition below states them:

- **Average or end of period.** Ratios of income to a balance (NIM, yield, charge-off rate) divide by the period's average balance; ratios of a stock to a stock (delinquency, uninsured share, loan-to-deposit) use the end of period. The Federal Reserve's series follow that split: delinquencies "as a percentage of end-of-period loans," charge-offs "as a percentage of average loans and annualized." Average of what is a second choice: daily balances from `balance_snapshots`, or the average of the opening and closing balance, which can differ widely for a growing book.
- **Annualized or not.** A quarter's net charge-offs over average loans is a quarterly rate; the Fed multiplies quarterly ratios by 400 to express them as annual percentages. Monthly figures are multiplied by 12 (or by 365 over the month's days). A rate without its period is unusable.
- **Dollars or counts.** Delinquency by balance and delinquency by number of accounts tell different stories when large and small loans behave differently. Losses are almost always in dollars; fraud and dispute rates are often counts.
- **Gross or net.** Charge-offs before or after recoveries; revenue before or after rewards and partner shares; deposits including or excluding brokered and reciprocal balances.
- **Scope.** Loans held for investment or also held for sale; owned or serviced for others; on balance sheet or including loans sold through forward flow; one program or the institution; deposits on the bank's books or including those swept to other banks ([Sweeps, Reciprocal Deposits & Yield](/books/banking-and-lending/sweeps-and-yield)).
- **The clock.** Business date or calendar month end; delinquency aged from the contractual due date or from the last payment ("recency"); a vintage by origination month or by first payment due.

My rule, as in the other volumes ([Payments Metrics](/books/payments/payments-metrics#why-the-same-metric-disagrees), [Commerce Metrics](/books/commerce/commerce-metrics#why-the-same-metric-disagrees)): every metric is a versioned definition with its unit, population, scope, clock, annualization and formula; every report names the definition and version it used; and a reported period is frozen, so late charge-offs, reclassifications and restatements create new rows rather than silent changes. Where a regulator publishes a definition, the institution's default is the regulator's, because its own call report and the public peer data use it.

## How the Institutions Report

As of October 2026, from regulators' and companies' own definitions:

| Source | Metric | Definition as published |
| --- | --- | --- |
| **Federal Reserve** | Delinquency rate | "Delinquent loans are those past due thirty days or more and still accruing interest as well as those in nonaccrual status," measured as a percentage of end-of-period loans, from call report Schedule RC-N over RC-C |
| **Federal Reserve** | Charge-off rate | Charge-offs, "the value of loans removed from the books and charged against loss reserves," net of recoveries, as a percentage of average loans, annualized (quarterly ratios × 400) |
| **FDIC** | Net interest margin | Net interest income over average earning assets, annualized; 3.32% for all insured institutions in the second quarter of 2026 ([Net Interest Margin](/books/banking-and-lending/bank-economics#net-interest-margin)) |
| **Banks' filings** | Efficiency ratio | Noninterest expense over taxable-equivalent net interest income plus noninterest income, with an "adjusted" version beside it ([The Efficiency Ratio](/books/banking-and-lending/bank-economics#the-efficiency-ratio)) |
| **Banks' calls** | Deposit beta | Change in deposit cost over change in the policy rate, total or interest-bearing ([Deposit Betas](/books/banking-and-lending/bank-economics#deposit-betas)) |
| **Upstart** | Automation rate | Share of loans fully automated, 91% for 2025 ([Automation Rates](/books/banking-and-lending/decision-engines#automation-rates)) |

Two lessons from the table. **Regulators define by stock and flow precisely,** with the schedule they come from, because thousands of institutions must compute them the same way. **Companies add metrics regulators don't define** (automation, active customers, take rates) and state their own definitions in their filings; a metric borrowed from a peer's 10-K is only comparable with the peer's definition beside it.

## Deposits

All balances from `balance_snapshots` by business date; rates and costs from `interest_accruals` and journal lines.

| Metric | Definition | Notes |
| --- | --- | --- |
| **Average deposits** | Mean of daily ledger balances of deposit accounts in the period | Not the average of month-end balances; payroll weeks and month-end sweeps distort point-in-time figures |
| **Cost of interest-bearing deposits** | Interest expense on interest-bearing deposits ÷ their average balance, annualized | From accruals, not postings, so a quarterly-credited CD counts in every month |
| **Cost of total deposits** | Interest expense on all deposits ÷ average total deposits (noninterest-bearing included), annualized | The difference from the line above is the noninterest-bearing mix ([Deposit Betas](/books/banking-and-lending/bank-economics#deposit-betas)) |
| **Deposit beta** | Change in cost of deposits ÷ change in the policy rate over the same window | State total or interest-bearing, and the window |
| **Noninterest-bearing share** | Noninterest-bearing deposits ÷ total deposits, end of period | |
| **Uninsured share** | Estimated uninsured deposits ÷ total deposits, end of period | From the insurance computation by ownership category, not a balance cap per account ([How a Bank Computes Insured Amounts](/books/banking-and-lending/deposit-insurance#how-a-bank-computes-insured-amounts)) |
| **Loan-to-deposit ratio** | Loans held for investment ÷ total deposits, end of period | |
| **Deposit attrition** | Balances of accounts closed or fully drained in the period ÷ opening balances | Separate account closures from balance runoff in accounts still open |
| **Funded accounts** | Accounts with a positive balance or a credit in the trailing 90 days ÷ accounts opened | The period is the definition; neobanks each publish their own active-customer rule |

## Margin and Efficiency

The income statement metrics, from journal lines mapped through `gl_accounts` to income and expense, with balances from snapshots. [Bank Economics & Balance Sheet Risk](/books/banking-and-lending/bank-economics) has the worked numbers; these are the definitions the pipeline implements:

| Metric | Definition | Notes |
| --- | --- | --- |
| **Net interest income** | Interest and fee income on loans, securities and cash less interest expense on deposits and borrowings | Loan fees that are part of yield (amortized origination fees) are interest income |
| **Yield on loans** | Interest income on loans ÷ average loans, annualized | Nonaccrual loans in the denominator, earning nothing |
| **Net interest margin** | Net interest income (taxable-equivalent where stated) ÷ average earning assets, annualized | Credit unions report against average assets; label which |
| **Efficiency ratio** | Noninterest expense ÷ (taxable-equivalent net interest income + noninterest income) | Lower is better; state reported or adjusted |
| **Return on assets** | Net income ÷ average total assets, annualized | |
| **Return on equity** | Net income ÷ average equity, annualized | |
| **Fee income share** | Noninterest income ÷ (net interest income + noninterest income) | Separate overdraft and NSF fees, which are disclosed and scrutinized on their own ([Overdraft, NSF & Fees](/books/banking-and-lending/overdraft-and-fees#the-money)) |

A lender that isn't a bank reports the lending version: yield, cost of funds, losses and operating expense per dollar of average receivables, which [The Lending Business](/books/banking-and-lending/lending-business#the-four-lines) builds and `loan_economics_monthly` stores per loan.

## Credit

The metrics a credit team, a CECL model, a warehouse lender and an examiner all read. Delinquency comes from `delinquency_snapshots` ([Collections & Recovery](/books/banking-and-lending/collections#how-to-build-it)), losses from `charge_offs` and `recoveries` ([Credit Losses & CECL](/books/banking-and-lending/credit-losses-and-cecl#how-to-build-it)).

| Metric | Definition | Notes |
| --- | --- | --- |
| **Delinquency rate (30+)** | Principal of loans 30 or more days past due, plus nonaccrual loans, ÷ principal of all loans, end of period | The Federal Reserve's definition; by bucket (30 to 59, 60 to 89, 90+) for operations |
| **Early delinquency** | Principal 1 to 29 days past due ÷ all loans | An operations metric; not reportable as late to the bureaus |
| **Nonaccrual rate** | Principal on nonaccrual ÷ all loans, end of period | |
| **Roll rate (bucket to bucket)** | Principal in bucket *b+1* at month end that was in bucket *b* at the prior month end ÷ principal in bucket *b* at the prior month end | Per bucket, by product; the operating number collections runs on ([Delinquency Buckets](/books/banking-and-lending/collections#delinquency-buckets)) |
| **Cure rate** | Principal in a past-due bucket at the prior month end that is current at this month end ÷ principal in that bucket at the prior month end | Exclude loans that cured only by a modification, or report them separately |
| **Gross charge-off rate** | Principal charged off in the period ÷ average loans, annualized | |
| **Net charge-off rate** | (Principal charged off − recoveries) ÷ average loans, annualized | The Federal Reserve's definition; the one the call report data and peers use |
| **Recovery rate** | Recoveries in the period on prior charge-offs ÷ gross charge-offs in a reference period | State the reference: same period, or the charge-off cohort |
| **Vintage cumulative loss** | Cumulative net charge-offs of loans originated in a month ÷ their original principal, by months on book | The curve investors and CECL read ([Worked Numbers: A Vintage and Roll-Rate Allowance](/books/banking-and-lending/credit-losses-and-cecl#worked-numbers-a-vintage-and-roll-rate-allowance)) |
| **First payment default** | Loans whose first scheduled payment is 30+ days past due ÷ loans with a first payment due in the cohort | A fraud and underwriting signal more than a credit one |
| **Allowance coverage** | Allowance for credit losses ÷ loans held for investment, end of period | Also against nonaccrual loans and against annualized net charge-offs (years of coverage) |

A worked example of my own: a card book's 30-to-59 bucket held $10,000,000 at the end of August. At the end of September $3,200,000 of it had rolled to 60 to 89, $4,500,000 had cured to current, $2,000,000 was still 30 to 59 (a partial payment kept it there) and $300,000 had paid off. The roll rate to 60+ is 3.2 ÷ 10.0 = 32%, the cure rate 45%. If the book's September net charge-offs were $1,800,000 on average loans of $600,000,000, the monthly rate is 0.30% and the annualized rate 3.6% (× 12); computed instead on September's 30 days it's 0.30% × 365 ÷ 30 = 3.65%. Either is defensible; the definition says which.

## Fraud and Disputes

Payments owns the card and acceptance side ([Fraud](/books/payments/payments-metrics#fraud), [Disputes and Refunds](/books/payments/payments-metrics#disputes-and-refunds)); on accounts, the inputs are `cases` with their detail tables ([Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes#how-to-build-it), [Account Takeover & Scams](/books/banking-and-lending/account-takeover-and-scams#how-to-build-it)):

| Metric | Definition | Notes |
| --- | --- | --- |
| **Fraud loss rate** | Fraud losses written off in the period ÷ debit volume of the channel (card, ACH, P2P, wire), in basis points | Net of recoveries; by channel, because a P2P loss and a card loss have different liability |
| **Reg E claim rate** | Error claims opened ÷ active accounts, per 1,000, per month | Counts claims, not disputed transactions |
| **Claims resolved on time** | Claims resolved within the regulation's deadline (or with provisional credit by it) ÷ claims due in the period | The compliance metric; target 100%, every miss a finding ([The Notice and the Clock](/books/banking-and-lending/deposit-errors-and-disputes#the-notice-and-the-clock)) |
| **Provisional credit rate** | Claims given provisional credit ÷ claims not resolved within 10 business days | |
| **Claims paid** | Claims resolved in the customer's favor ÷ claims resolved | Split unauthorized from authorized-but-scam claims ([Unauthorized or Authorized](/books/banking-and-lending/account-takeover-and-scams#unauthorized-or-authorized)) |
| **Account takeover rate** | Accounts with a confirmed takeover ÷ active accounts, per 10,000, per month | Confirmed, not suspected |

## Origination

From `applications` and `credit_decisions` ([Loan Origination](/books/banking-and-lending/loan-origination), [Underwriting & Decision Engines](/books/banking-and-lending/decision-engines)):

| Metric | Definition | Notes |
| --- | --- | --- |
| **Approval rate** | Applications approved (including counteroffers accepted) ÷ completed applications decided | Completed applications only; incomplete and withdrawn are their own rates |
| **Pull-through** | Loans funded ÷ applications approved | |
| **Automation rate** | Decisions made with no human touch ÷ decisions | State whether a fraud or document review counts as a touch ([Automation Rates](/books/banking-and-lending/decision-engines#automation-rates)) |
| **Time to decision** | Median time from completed application to decision | The clock Reg B's 30 days runs on ([When a Notice Is Owed](/books/banking-and-lending/adverse-action#when-a-notice-is-owed)) |
| **Override rate** | Decisions overridden by an underwriter ÷ decisions | By direction; high overrides are a fair lending and model risk signal |

## Servicing and Collections

From `loan_payments`, `payment_allocations`, `collection_contacts` and the servicing tables ([Loan Servicing](/books/banking-and-lending/loan-servicing#how-to-build-it), [Collections & Recovery](/books/banking-and-lending/collections#how-to-build-it)):

| Metric | Definition | Notes |
| --- | --- | --- |
| **Autopay share** | Active loans with autopay enrolled ÷ active loans, end of period | |
| **Payment return rate** | Loan payments returned ÷ payments received, by method | ACH returns feed the payment transfer rules ([Autopay and Payment Attempts](/books/banking-and-lending/loan-servicing#autopay-and-payment-attempts)) |
| **Right-party contact rate** | Attempts reaching the borrower ÷ attempts | From `collection_contacts.conversation`; the contact limits make attempts scarce |
| **Promise kept rate** | Promises to pay honored by their date and amount ÷ promises made | |
| **Hardship plan performance** | Loans on a plan that are current 6 months later ÷ loans enrolled | Exclude from cure rates or report alongside them |
| **Cost to service** | Servicing operating expense ÷ average loans serviced (or per loan per year) | State owned or serviced for others |

## Spend Management

From `card_program_economics_monthly` and the spend chapters' tables ([The Spend Management Business](/books/banking-and-lending/spend-management#how-to-build-it)):

| Metric | Definition | Notes |
| --- | --- | --- |
| **Spend volume** | Cleared purchases less refunds in the period | The volume interchange is earned on |
| **Net interchange take rate** | (Gross interchange − bank share − network and processor fees) ÷ spend volume | Rewards are a separate line ([Rewards as a Share of Interchange](/books/banking-and-lending/spend-management#rewards-as-a-share-of-interchange)) |
| **Rewards rate** | Rewards earned ÷ spend volume | |
| **Credit loss rate on charge cards** | Charge-offs net of recoveries ÷ spend volume, or ÷ average receivable, annualized | State which; on a daily-pay card the two differ greatly |
| **Receipt compliance** | Transactions over the receipt threshold with a matched receipt within the policy window ÷ such transactions | ([Receipts, Expense Policy & Audit](/books/banking-and-lending/expense-management)) |
| **Days to close** | Business days from month end to the customer's books closed with card activity synced | ([Accounting Sync & the Close](/books/banking-and-lending/accounting-sync)) |

## Operations and Compliance

The metrics that show whether the platform keeps its obligations, from `cases`, filing records and the invariant checks ([Banking Architecture](/books/banking-and-lending/banking-architecture#invariants-checked-continuously)):

| Metric | Definition | Notes |
| --- | --- | --- |
| **Deadline adherence** | Cases closed or acted on by `due_at` ÷ cases with a deadline in the period, by rule | One line per rule: Reg E, Reg CC, billing errors, FCRA disputes, legal process |
| **SAR timeliness** | SARs filed within 30 days of determination (60 with no suspect) ÷ SARs filed | Counts only, inside the restricted store ([Suspicious Activity Reports](/books/banking-and-lending/bsa-aml#suspicious-activity-reports)) |
| **Filings on time** | Regulatory submissions accepted by the due date ÷ submissions due | ([Regulatory Reporting & Data](/books/banking-and-lending/regulatory-reporting#the-filing-calendar)) |
| **Reconciliation breaks** | Open subledger, omnibus and invariant differences at end of day, count and dollars | Target zero unexplained |
| **Complaint rate** | Complaints received ÷ active accounts, per 1,000, per month | By product and root cause |
| **Digital availability** | Minutes the app's critical journeys succeeded ÷ minutes in the period | An SLO, from synthetic checks ([Frontend & Synthetic Monitoring](/docs/observability/frontend-and-synthetic)) |

## Definitions as Code, Restatements as Rows

The playbook's rules apply ([One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric)), with three banking additions:

- **Regulatory definitions are the default.** Where the call report or the Federal Reserve's statistics define a metric, the institution's metric uses that definition unless it says otherwise, so the board's delinquency figure, the call report's RC-N and the UBPR peer comparison agree ([Lineage: From a Filed Number to Its Rows](/books/banking-and-lending/regulatory-reporting#lineage-from-a-filed-number-to-its-rows)).
- **Credit metrics mature.** A vintage's loss curve, a month's cure rate and a quarter's recoveries keep changing for months; the definition states when a period is final, and an early figure is labeled provisional.
- **Money metrics reconcile to the GL.** Net interest income, fee income, charge-offs and recoveries from the pipeline are checked each month against the closed GL; a gap is a definition difference (written down) or a bug.

## How to Build It

The chapter adds the definition and value tables the other volumes use; every formula above is a query over tables earlier chapters own (`balance_snapshots`, `interest_accruals`, `journal_lines`, `delinquency_snapshots`, `charge_offs`, `recoveries`, `cases`, `credit_decisions`, `card_program_economics_monthly`).

```sql
CREATE TABLE metric_definitions (          -- one definition per metric, versioned
  key                 TEXT NOT NULL,         -- 'nco_rate', 'delinquency_30_plus', 'roll_30_60', 'nim'
  version             INT NOT NULL,
  unit                TEXT NOT NULL CHECK (unit IN ('ratio', 'amount', 'count', 'bps', 'days')),
  population          TEXT NOT NULL,         -- 'loans_hfi', 'deposit_accounts', 'reg_e_claims'
  scope               TEXT NOT NULL,         -- 'institution', 'program', 'product:CARD-STD', 'owned'
  balance_basis       TEXT CHECK (balance_basis IN ('average_daily', 'average_of_ends',
                        'end_of_period', 'original_principal')),
  annualization       TEXT CHECK (annualization IN ('none', 'x4', 'x12', 'x400', 'days_365')),
  gross_or_net        TEXT CHECK (gross_or_net IN ('gross', 'net')),
  clock               TEXT NOT NULL,         -- 'business_date', 'month_end', 'origination_month'
  delinquency_basis   TEXT CHECK (delinquency_basis IN ('contractual', 'recency')),
  maturity_days       INT,                   -- when a period's value is final
  regulatory_source   TEXT,                  -- 'FRB charge-off and delinquency rates', 'call report RC-N'
  formula_ref         TEXT NOT NULL,         -- the SQL or model in version control
  history_policy      TEXT NOT NULL CHECK (history_policy IN ('frozen', 'recomputed')),
  owner               TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL,
  PRIMARY KEY (key, version)
);

CREATE TABLE metric_values (               -- computed, frozen when reported
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  metric_key          TEXT NOT NULL,
  metric_version      INT NOT NULL,
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  program_id          UUID REFERENCES programs (id),
  period              DATERANGE NOT NULL,
  dimensions          JSONB NOT NULL DEFAULT '{}',  -- {"product": "CARD-STD", "bucket": "30_59"}
  value               NUMERIC NOT NULL,
  numerator           NUMERIC,
  denominator         NUMERIC,
  provisional         BOOLEAN NOT NULL,      -- true until the definition's maturity has passed
  computed_at         TIMESTAMPTZ NOT NULL,
  inputs_ref          TEXT NOT NULL,         -- the snapshot it was computed from
  frozen_at           TIMESTAMPTZ,           -- reported to the board, an investor or a regulator
  supersedes_id       UUID REFERENCES metric_values (id),  -- a restatement is a new row
  FOREIGN KEY (metric_key, metric_version) REFERENCES metric_definitions (key, version)
);
```

A month-end delinquency rate needs nonaccrual status as of that date, not as it is today, so the chapter adds it to the daily snapshot beside the bucket ([Collections & Recovery](/books/banking-and-lending/collections#how-to-build-it) owns the table; `loans.accrual_status` from [Commercial Lending](/books/banking-and-lending/commercial-lending#how-to-build-it) is its source):

```sql
ALTER TABLE delinquency_snapshots
  ADD COLUMN accrual_status TEXT NOT NULL DEFAULT 'accrual'
    CHECK (accrual_status IN ('accrual', 'nonaccrual'));  -- copied from loans each business date
```

Delinquency rate (30+ or nonaccrual, the Federal Reserve's definition) for one month end, by product:

```sql
SELECT p.code AS product,
       SUM(d.principal_balance) FILTER (
         WHERE d.bucket NOT IN ('current', '1_29') OR d.accrual_status = 'nonaccrual')::numeric
       / NULLIF(SUM(d.principal_balance), 0)              AS delinquency_30_plus
FROM delinquency_snapshots d
JOIN accounts a ON a.id = d.account_id
JOIN products p ON p.id = a.product_id
WHERE d.business_date = :month_end
  AND a.institution_id = :institution_id
  AND d.bucket <> 'charged_off'
GROUP BY p.code;
```

The 30-to-59 roll to 60 to 89: the denominator is the prior month end's whole bucket, including loans that paid off or charged off since, so it comes from the prior snapshot alone:

```sql
SELECT SUM(nxt.principal_balance) FILTER (WHERE nxt.bucket = '60_89')::numeric
       / NULLIF(SUM(prv.principal_balance), 0)            AS roll_30_60,
       SUM(nxt.principal_balance) FILTER (WHERE nxt.bucket = 'current')::numeric
       / NULLIF(SUM(prv.principal_balance), 0)            AS cure_30_59
FROM delinquency_snapshots prv
LEFT JOIN delinquency_snapshots nxt
  ON nxt.account_id = prv.account_id AND nxt.business_date = :month_end
WHERE prv.business_date = :prior_month_end
  AND prv.bucket = '30_59';
```

(The roll uses each loan's balance at the later date, as the worked example does; a definition that uses the earlier balance says so.)

Net charge-off rate for a quarter, annualized as the Federal Reserve does:

```sql
WITH co AS (
  SELECT COALESCE(SUM(principal), 0) AS gross
  FROM charge_offs c
  JOIN accounts a ON a.id = c.account_id
  WHERE a.institution_id = :institution_id
    AND c.charged_off_on <@ :quarter                  -- a DATERANGE
), rec AS (
  SELECT COALESCE(SUM(gross_amount), 0) AS recovered
  FROM recoveries r
  JOIN accounts a ON a.id = r.account_id
  WHERE a.institution_id = :institution_id
    AND r.received_on <@ :quarter
), avg_loans AS (
  SELECT AVG(day_total) AS average
  FROM (SELECT b.business_date, SUM(-b.ledger_balance) AS day_total  -- loans: debit balances
        FROM balance_snapshots b
        JOIN accounts a ON a.id = b.account_id
        WHERE a.institution_id = :institution_id
          AND a.account_kind IN ('loan', 'line')
          AND b.business_date <@ :quarter
        GROUP BY b.business_date) d
)
SELECT (co.gross - rec.recovered)::numeric / NULLIF(avg_loans.average, 0) * 400
         AS nco_rate_annualized_pct
FROM co, rec, avg_loans;
```

Design notes:

- **The sign convention is the snapshot's.** `balance_snapshots` stores balances from the account's side; the query negates loan balances to get positive receivables. A definition that forgets the sign reports negative loans, which at least fails loudly.
- **Delinquency comes from snapshots, never from today's state.** A month-end rate recomputed from current days past due rewrites history; `delinquency_snapshots` holds each business date's bucket as it was.
- **Restricted metrics stay aggregated.** SAR counts and timeliness are computed inside the restricted store and published as counts only ([Confidentiality](/books/banking-and-lending/bsa-aml#confidentiality)).
- **Peer comparisons use the public definitions.** A metric meant for comparison with the UBPR or the Federal Reserve's series carries `regulatory_source`, and its formula follows the published one even where the institution's operational version differs.
- **Emit events:** `metric_value.computed`, `metric_value.frozen`, `metric_value.restated`.

## Auditing

- **Every definition and its history.** Each metric's definition versions with their owner, regulatory source and validity, so a figure in a board deck from two years ago can be recomputed as it was defined then.
- **Every reported value as reported.** Frozen values with their inputs, and each restatement as a new row pointing at the one it supersedes, with the reason.
- **Agreement with the filings.** Each quarter, the metrics that have call report equivalents (loans, deposits, past dues, charge-offs, NIM) tied to the filed numbers, with any definition differences written down.
- **Agreement with the GL.** Monthly ties of income, fee, charge-off and recovery metrics to the closed GL.
- **Who saw what.** Which values went to the board, investors, a warehouse lender or a regulator, and when, because a covenant test or a supervisory finding may rest on them ([Funding the Book](/books/banking-and-lending/funding-the-book#investor-reporting-and-remittance)).

## What This Means for the System You Build

- **Define every metric once,** with its unit, population, scope, balance basis, annualization, gross or net, clock and maturity, and version every change.
- **Default to the regulator's definition** where one exists, so internal figures, the call report and peer data agree.
- **Divide flows by average balances and stocks by end-of-period balances,** and annualize explicitly.
- **Compute delinquency and roll rates from daily snapshots,** with the prior period's full bucket as the denominator.
- **Report net charge-offs net of recoveries, annualized,** and vintage losses by months on book.
- **Track the compliance metrics as first-class:** deadlines met by rule, filings on time, breaks open.
- **Freeze reported values and restate with new rows,** and tie the money metrics to the GL and the filings every period.

## References

**Regulators and data**

- [Federal Reserve: Charge-Off and Delinquency Rates on Loans and Leases at Commercial Banks, about the data](https://www.federalreserve.gov/releases/chargeoff/about.htm), net charge-offs over average loans, annualization by 400, Schedules RC-N and RC-C, and timing
- [Federal Reserve: Delinquency rates, seasonally adjusted](https://www.federalreserve.gov/releases/chargeoff/delallsa.htm), the definitions of delinquent loans and charge-offs in the release notes
