+++
title = "Payroll & HR Metrics"
description = "Clients, worksite employees, retention, PEPM, float and yield as filings define them; on-time pay, notice and correction rates; turnover and time to hire."
category = "Workforce Industry"
order = 2662
part = "Running the Platform"
tags = ["payroll", "metrics", "kpis", "float", "peo", "hr-analytics"]
+++

A payroll business measures three things, and each has a different audience. Investors read the business metrics the public companies define in their 10-Ks: clients, worksite employees, revenue retention, revenue per worker per month, and the average client fund balance and its yield. Operators read the metrics that say whether payroll worked: whether people were paid on time, whether taxes were deposited and returns accepted, how often a statement had to be corrected, how long a run took. And employers buy HR software partly for the metrics it gives them about their own workforce: headcount, turnover, time to hire. All three fail the same way: a number without its definition, compared with someone else's number under a different definition.

This chapter covers the business metrics as the filings define them, worked from the filed figures, the operational metrics with definitions and worked numbers, the HR metrics employers buy software for, and how to store metric definitions and values so a changed definition is a new series rather than a silent restatement. The figures themselves, provider by provider, are in [The Payroll & HR Landscape](/books/workforce/workforce-landscape#what-gets-counted); how the revenue lines work is in [How Payroll Providers Make Money](/books/workforce/revenue-models). The general discipline is shared with other volumes' metrics chapters: [Definitions as Code, Restatements as Rows](/books/user-generated-platforms/operating-metrics#definitions-as-code-restatements-as-rows) and Investing & Digital Assets' [Investing Metrics](/books/investing-and-digital-assets/investing-metrics).

## How the Companies Report

The metrics public payroll providers and PEOs define in their latest 10-Ks, as of November 2026:

| Company | Metric | Definition, as filed | Value |
| --- | --- | --- | --- |
| **ADP** (FY ended June 30, 2026) | Pays per control | "represents the approximate growth in the number of employees on ADP clients' processed payrolls in the United States," on a same-store basis for a subset of clients | Grew 1% |
| | Employer Services client revenue retention | (no formula in the sections I read) | 92.1% |
| | Average client funds and yield | Funds "collected from clients but have not yet been remitted" to taxing authorities, client employees and other payees | $40,410.7 million at 3.4%; interest $1,354.8 million |
| | PEO average worksite employees | | Up 2% |
| **Insperity** (2025) | Average WSEEs paid per month | Worksite employees ("WSEEs") paid, averaged by month | 310,089 |
| | Revenues per WSEE per month | "comprised of gross billings per WSEE per month less WSEE payroll costs per WSEE per month" | $1,831 |
| | Gross profit per WSEE per month | "our principal measurement of relative performance at the gross profit level" | $242 (2024: $285) |
| | Client retention | (no formula given) | About 83% (2024: 81%) |
| **Paychex** (FY ended May 31, 2026) | Payroll client retention | "in the range of 82% to 83% of our beginning client base" | 82% to 83% |
| | Worksite employees supported by HR Outsourcing | | About 2.6 million |
| | Average funds held for clients and rate | | $5,768.2 million at 3.5%; interest $210.9 million |
| **Paycom** (2025) | Clients | Accounts "with separate taxpayer identification numbers (or, in certain circumstances, separate client codes)" counted as separate clients | 39,199; 20,321 by parent company grouping |
| | Annual revenue retention rate | (Recurring and other revenues − TTM revenue attrition) ÷ recurring and other revenues | 91% (2024: 90%) |
| **Paylocity** (FY ended June 30, 2026) | Clients | Clients with "multiple divisions, segments or locations" counted once; excludes acquired clients | About 44,400 |
| | Annual revenue retention rate | Prior 12 months' total revenue less revenue lost from clients, excluding "interest income on funds held for clients" | Greater than 92% |
| **TriNet** (2025) | WSEs | "co-employees and other individuals receiving PEO services," counted from the date co-employment commences | Average 333,886; year end 323,206 |
| | Insurance cost ratio | "the ratio of insurance costs to insurance service revenues" | 91% (2024: 90%) |

Three lessons from the table. **The same word counts different things.** A Paycom client is a taxpayer ID, a Paylocity client is a customer counted once across divisions, a Paychex customer includes non-payroll customers. **Retention comes in two kinds.** Client retention (Paychex, Insperity) counts customers kept; revenue retention (Paycom, Paylocity, ADP) counts dollars kept, and small-business payroll loses many clients that simply close, which both measures count as losses. **PEO metrics are per worksite employee per month,** because the PEO's unit of revenue and cost is the co-employed worker, and the denominator (average paid per month, or year end) changes the answer.

## Clients and Workers

**Clients.** Paycom's choice (each taxpayer ID is a client) matches the core model's `employers`; Paylocity's (count the customer once) matches `companies`. A platform should report both and say which: a company with three EINs is one company and three employers, and its churn is one lost company or three lost employers. Paycom reports both, 39,199 and 20,321 "based on parent company grouping," and the ratio (about 1.9 taxpayer IDs per parent) is itself a measure of the client base's complexity.

**Workers paid.** ADP's pays per control is a growth rate, not a count: the change in employees on the same clients' payrolls, which isolates hiring and layoffs at existing clients from client wins and losses. It's an economic indicator as much as a business metric, and it is what moves PEPM revenue between client changes. The platform version is `COUNT(DISTINCT worker_id)` over paid statements in a period, by employer, compared for employers present in both periods.

**Worksite employees.** A PEO counts co-employed workers. TriNet counts "co-employees and other individuals receiving PEO services," from "the date on which their co-employment with TriNet commences," and reports both the average and the year-end count; Insperity reports the average paid per month. Paychex's 2.6 million "worksite employees" supported by HR Outsourcing Solutions is broader than co-employment. Average and year-end differ by the year's trend: TriNet's 333,886 average against 323,206 at year end says the count fell through 2025.

## Revenue Retention

Paycom publishes the formula. For a 12-month measurement period, annual revenue retention is recurring and other revenues less trailing-12-month revenue attrition, divided by recurring and other revenues, where attrition "is equal to the actual recurring fees paid by such lost clients during the 12 months preceding the respective dates on which they last processed payroll with us," and "The point at which a client is deemed "lost" is determined based on the terms of our standard services agreement." The rate is "negatively impacted when former clients are acquired or otherwise cease operations."

Worked with invented numbers: a provider's recurring revenues for the measurement period are $100.0 million. Clients lost during the period paid $9.0 million of recurring fees in the 12 months before their last payroll.

Revenue retention = ($100.0 million − $9.0 million) ÷ $100.0 million = 91.0%.

Two features of the definition matter. Attrition uses each lost client's full trailing year of fees, not the fees lost during the period, so a client lost in month 2 counts as much as one lost in month 11. And expansion at retained clients is not added back: this is a gross retention rate, so it can't exceed 100%. Paylocity's definition starts from the preceding 12 months' total revenue and subtracts annualized revenue lost from clients, and excludes interest income on funds held for clients, which keeps rate moves out of a customer metric. Neither is comparable with a net revenue retention rate that adds expansion; a metric table that holds both needs a `kind` column.

## Revenue per Worker per Month

PEPM is a price for a payroll provider and a derived metric for a PEO.

**As a price.** Paylocity's recurring fees are "charged and collected based on a per-employee-per-month fee"; Square Payroll lists $35 a month plus $6 per person paid ([Per Employee per Month](/books/workforce/revenue-models#per-employee-per-month)). The metric is invoiced PEPM revenue ÷ billed worker-months, and its definition is the billing definition of a worker ([What Gets Counted](/books/workforce/revenue-models#what-gets-counted)).

**As a PEO metric.** Insperity defines revenues per WSEE per month as "gross billings per WSEE per month less WSEE payroll costs per WSEE per month." Checking it against the filed totals: revenues of $6,812 million ÷ 310,089 average WSEEs ÷ 12 = $1,830.66, the $1,831 reported; gross profit of $900 million ÷ 310,089 ÷ 12 = $241.87, the $242 reported. The same arithmetic on gross billings, $45,565 million ÷ 310,089 ÷ 12 = $12,245, is the average monthly cost of a worksite employee to the client including wages; the $1,831 is the markup over wages, and the $242 is what's left after the PEO's own costs of benefits, taxes and workers' compensation. TriNet doesn't report a per-WSE revenue metric; by my arithmetic its professional service revenues of $719 million ÷ 333,886 average WSEs ÷ 12 = about $179 per WSE per month, and its 91% insurance cost ratio says how much of insurance service revenue went to insurance costs.

The comparison these numbers invite (Insperity's $1,831 against TriNet's $179) is wrong: Insperity's revenue includes benefits and insurance billed to clients, and TriNet's professional service revenue excludes its separately reported insurance service revenue. Per-worker metrics compare only when their numerators were built the same way, which is why the definition column exists.

## Float and Yield

Interest on client funds is the product of an average balance and a yield, and the filings report all three. ADP: average client funds of $40,410.7 million at an average yield of 3.4% produced $1,354.8 million; the implied yield, $1,354.8 ÷ $40,410.7, is 3.35%, which rounds to the reported 3.4%. Paychex: $5,768.2 million at 3.5% would be about $201.9 million against $210.9 million reported; the implied 3.66% differs from the stated rate, and [The Workforce Business](/books/workforce/workforce-business#interest-on-client-funds) notes the filing's rate excludes net realized gains and losses, so the two measures aren't built the same way.

For a platform's own float metric, the definitions to fix are:

- **Balance.** The average daily balance of funds collected from clients and not yet paid out, which is ADP's definition of client funds ("collected from clients but have not yet been remitted"). It should exclude the provider's own operating cash and include funds in transit only once.
- **Yield.** Interest earned ÷ average balance, stated with or without realized gains on securities sold.
- **Days held.** Average balance ÷ average daily funds moved, which ties the float to the funding speed: a move from 4-day to 2-day debits shortens days held before the check date, and a deposit schedule that holds taxes until their due date lengthens it.

Worked from the core model with invented numbers: an employer's run debits $167,072.80 on Monday; net pay of $122,047.20 leaves Thursday; federal taxes of $38,625.60 leave the following Wednesday; the 401(k) remittance of $6,400.00 leaves the following Monday. At an annual yield of 3.4%:

| Leg | Amount | Days held | Interest at 3.4% |
| --- | --- | --- | --- |
| Net pay | $122,047.20 | 3 | $34.11 |
| Federal taxes | $38,625.60 | 9 | $32.38 |
| 401(k) deferrals | $6,400.00 | 7 | $4.17 |
| **Run** | **$167,072.80** | | **$70.66** |

Each leg is amount x 3.4% x days ÷ 365, which is what [`float_income_accruals`](/books/workforce/revenue-models#how-to-build-it) accrues by day. Summed over every run, the platform's float metric is built from rows, and a change in funding speed or deposit timing shows up in days held before it shows up in revenue. Rate sensitivity is worked in [Rate Sensitivity](/books/workforce/revenue-models#rate-sensitivity).

## Operational Metrics

The business metrics say whether the business grew. These say whether payroll worked, and they're what a platform's operations team, its partners and its SOC 1 auditor watch. Each needs a precise numerator, denominator and attribution:

**On-time pay rate.** The share of expected payments available to the worker by the check date. Two versions answer two questions: the provider-attributable rate excludes failures caused by the employer (late funding) or the worker's data (a closed account), and the worker-experienced rate counts every late payment whatever the cause. Worked for an invented month with 1,200,000 expected net payments:

| Late or missing on the check date | Count | Attributed to |
| --- | --- | --- |
| Returned by the receiving bank (closed or invalid account) | 1,450 | Worker data |
| Held for verification of a changed account past the check date | 300 | Fraud control |
| Late because the provider's file missed a settlement window | 120 | Provider |
| Late because the employer's funding arrived after the deadline | 60 | Employer |

Provider-attributable on-time rate = (1,200,000 − 120) ÷ 1,200,000 = 99.990%. Worker-experienced on-time rate = (1,200,000 − 1,450 − 300 − 120 − 60) ÷ 1,200,000 = 1,198,070 ÷ 1,200,000 = 99.839%. The first is the provider's quality; the second is what workers feel, and the gap (0.15 percentage points, 1,810 people) is where product work on account verification and funding pays off.

**Tax notice rate.** Agency notices received per 1,000 employer-quarters, split by cause. Invented: 1,100 notices in a quarter across 20,000 employers is 55 per 1,000; if 140 were caused by the provider (a late deposit, a missing return, a wrong rate), the provider-caused rate is 7 per 1,000, and the rest are agency errors, employer-caused or informational ([Tax Notices, Amendments & Agency Accounts](/books/workforce/tax-notices-and-agency-accounts)).

**Correction rate.** Correction, void and reversal statements ÷ all statements, by cause. On the 24,160,000 statements a year from the invented platform in [Peak Loads](/books/workforce/payroll-architecture#peak-loads), 96,640 corrections is 0.40%. Causes split into late inputs (a change after the cutoff, which [downstream syncs](/books/workforce/hris-record-of-truth#how-to-build-it) record as missed cutoffs), employer errors and engine errors; only the last is a defect, but the first is the one a product can shrink.

**Run time.** From approval to locked statements, and from the deadline to files sent, per run and at the 99th percentile on the busiest day; the measure that capacity plans are built on.

**Funding failure rate, deposit timeliness and filing reject rate.** Returned client debits ÷ debits ([When the Debit Fails](/books/workforce/failed-debits-and-recovery)); deposits made by their due date ÷ deposits due; first-submission rejects ÷ submissions ([Rejects and Resubmission](/books/workforce/tax-engines-and-filing#rejects-and-resubmission)). Deposit timeliness should be 100%, and every miss is a penalty computed and owned.

## HR Metrics Employers Buy Software For

Employers buy an HRIS partly to answer questions about their own workforce, and the two they ask most have public definitions to anchor to.

**Turnover.** The BLS's Job Openings and Labor Turnover Survey computes the separations rate "by dividing the number of separations by employment and multiplying that quotient by 100," where separations "include all separations from the payroll during the entire reference month," and splits them into quits ("generally voluntary separations initiated by the employee"), layoffs and discharges ("involuntary separations initiated by the employer") and other separations ("retirement, death, disability, and transfers to other locations of the same firm"). For September 2026, total separations were 5.3 million at a rate of 3.3%, quits 3.4 million at 2.1%, and layoffs and discharges 1.6 million at 1.0%.

An employer's annual turnover on the same basis: separations in the year ÷ average employment × 100. Worked with invented numbers: an employer averaging 40 employees with 10 separations in the year (7 quits, 2 discharges, 1 retirement) has 25.0% annual turnover, 17.5% voluntary; its monthly average is 10 ÷ 12 ÷ 40 = 2.1%, below the 3.3% national all-industry monthly rate (which isn't a benchmark for any one employer, but it is a published, defined number). The HRIS computes it from [`employments`](/books/workforce/workforce-business#the-core-data-model) (termination date and reason) and average headcount from active employments by day; [Terminations, Offboarding & WARN](/books/workforce/terminations-and-warn#the-separation-workflow) records the reason codes that split voluntary from involuntary.

**Time to hire.** Days from a requisition opening (or a candidate's application) to an accepted offer (or a start date). There's no official definition; the platform has to pick the endpoints and store them with the metric, because "time to fill" from requisition to start and "time to hire" from application to accepted offer differ by weeks. The data is [`requisitions`, `applications` and `offers`](/books/workforce/recruiting-and-hiring#how-to-build-it).
<!-- source-gap: wf-time-to-hire-benchmark | missing | a published, defined time-to-hire benchmark | closes with: a BLS or other public survey defining and reporting time to hire | checked: 2026-11-10 -->

Other workforce metrics follow the same pattern (overtime hours ÷ total hours, absence rate from the leave ledger, compensation ratio against pay ranges from [Pay Transparency, Pay Equity & EEO-1](/books/workforce/pay-transparency-and-equity)): each is a query over the core tables with a stated definition, not a number someone typed.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `companies` and `employers` exist; [The Payroll & HR Landscape](/books/workforce/workforce-landscape#how-to-build-it) added `provider_metrics` for figures other companies publish. This chapter adds the platform's own metric definitions and computed values.

```sql
-- A metric as defined: the query is versioned, and a new definition is a new row.
CREATE TABLE metric_definitions (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  metric_key          TEXT NOT NULL,         -- 'on_time_pay_rate', 'revenue_retention',
                                             -- 'pepm_revenue', 'float_yield', 'turnover', ...
  version             INT NOT NULL,
  audience            TEXT NOT NULL CHECK (audience IN ('business', 'operations', 'customer_hr')),
  kind                TEXT,                  -- 'gross' or 'net' retention; 'provider' or
                                             -- 'worker_experienced' on-time
  numerator           TEXT NOT NULL,         -- in words, as a reader would check it
  denominator         TEXT NOT NULL,
  unit                TEXT NOT NULL CHECK (unit IN ('percent', 'count', 'usd', 'days', 'ratio')),
  grain               TEXT NOT NULL CHECK (grain IN ('platform', 'company', 'employer')),
  query_ref           TEXT NOT NULL,         -- the SQL in version control
  aligns_with         TEXT,                  -- 'Paycom 10-K revenue retention', 'BLS JOLTS'
  effective_from      DATE NOT NULL,
  superseded_by_id    UUID REFERENCES metric_definitions (id),
  UNIQUE (metric_key, version)
);

-- A computed value, with the inputs it counted, for a period and a scope.
CREATE TABLE metric_values (
  metric_definition_id UUID NOT NULL REFERENCES metric_definitions (id),
  scope_kind          TEXT NOT NULL CHECK (scope_kind IN ('platform', 'company', 'employer')),
  scope_id            UUID,                  -- null for the platform
  period              DATERANGE NOT NULL,
  numerator_value     NUMERIC NOT NULL,
  denominator_value   NUMERIC,
  value               NUMERIC NOT NULL,
  computed_at         TIMESTAMPTZ NOT NULL,
  data_as_of          TIMESTAMPTZ NOT NULL,  -- the latest input it read
  restates_value      BOOLEAN NOT NULL DEFAULT FALSE,   -- recomputed after a late input
  PRIMARY KEY (metric_definition_id, scope_kind, scope_id, period, computed_at)
);

-- Provider-attributable on-time pay rate for a month: payments expected on a check date,
-- against those late for a cause the provider owns.
WITH expected AS (
  SELECT m.id, m.effective_date, m.status, m.return_code, s.check_date,
         r.funding_status
  FROM money_movements m
  JOIN pay_statements s ON s.id = m.pay_statement_id
  JOIN pay_runs r ON r.id = m.pay_run_id
  WHERE m.purpose = 'net_pay'
    AND s.check_date >= :month_start AND s.check_date < :month_end
    AND r.run_type IN ('regular', 'off_cycle', 'bonus')
)
SELECT COUNT(*) AS expected,
       COUNT(*) FILTER (WHERE effective_date > check_date
                          AND return_code IS NULL
                          AND funding_status = 'funded') AS provider_late,
       1 - COUNT(*) FILTER (WHERE effective_date > check_date
                              AND return_code IS NULL
                              AND funding_status = 'funded')::NUMERIC / COUNT(*) AS on_time_rate
FROM expected;
```

Design notes:

- **A definition change is a new version.** Changing what counts as a client or a late payment creates a new `metric_definitions` row; old values stay under the old version, and a chart that crosses the change shows it.
- **Values carry their inputs' age.** `data_as_of` and `restates_value` make it visible when a late return or a backdated termination changed a number already reported.
- **Attribution is in the query, not a spreadsheet.** The on-time query excludes returns (worker data) and late funding (employer) by the rows' own fields; a fraud hold that delays payment is its own cause, recorded on `account_change_holds`.
- **Compare only like definitions.** `aligns_with` notes when a metric follows a filing's or the BLS's definition, so a dashboard that puts the platform's retention next to a public company's knows whether that comparison is valid.
- **Customer metrics are per employer.** HR metrics are computed per company and employer on the customer's data, with the same definitions table, so a customer can see the formula behind its turnover.

## Auditing

Metrics end up in board decks, investor materials, partner reviews and customer contracts (an on-time pay commitment is a service level). Keep:

- **Every definition version with its query,** and which values were computed under it.
- **Every reported value with its inputs' as-of time,** and every restatement with its cause.
- **The rows behind any number given to a customer or partner,** retrievable by the value's key ([Producing Records](/docs/building-blocks/audit-trails#producing-records)).
- **Public company figures with source and retrieval date** in `provider_metrics`, never retyped into the platform's own series.

## What This Means for the System You Build

- **Store every metric with its definition,** and version the definition; a changed definition is a new series.
- **Report clients both ways,** by company and by employer, and say which.
- **Keep gross and net retention apart,** and exclude float income from customer retention the way Paylocity does.
- **Build float from rows:** amount, days held and yield per leg, so speed and deposit timing show up as days held.
- **Measure on-time pay twice:** provider-attributable and worker-experienced, with the cause on every late payment.
- **Rate notices and corrections per cause,** because the controllable causes are the product work.
- **Compute HR metrics on public definitions where they exist,** JOLTS for separations, and state the endpoints where they don't.

## References

**Agency guidance and forms**

- [BLS: Job Openings and Labor Turnover Summary, September 2026](https://www.bls.gov/news.release/jolts.nr0.htm), total separations, quits and layoffs and discharges with their rates, and their definitions
- [BLS: JOLTS technical note](https://www.bls.gov/news.release/jolts.tn.htm), how the separations and component rates are computed and what separations include
- [BLS: JOLTS definitions](https://www.bls.gov/jlt/jltdef.htm), the survey's data element definitions

**Filings**

- [ADP: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/8670/000000867026000030/adp-20260630.htm), pays per control, client revenue retention, PEO average worksite employees, client funds defined, average balance, yield and interest on funds held for clients
- [Paychex: Form 10-K for the fiscal year ended May 31, 2026](https://www.sec.gov/Archives/edgar/data/723531/000119312526307785/payx-20260531.htm), customers and payroll clients, payroll client retention, worksite employees and funds held for clients
- [Paycom: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1590955/000119312526059372/payc-20251231.htm), client counts by taxpayer ID and parent grouping, and the annual revenue retention rate formula
- [Paylocity: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/1591698/000159169826000069/pcty-20260630.htm), client counting, per-employee-per-month fees and the annual revenue retention rate
- [TriNet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/937098/000093709826000010/tnet-20251231.htm), the WSE definition, average and total WSEs, professional service revenues and the insurance cost ratio
- [Insperity: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1000753/000100075326000011/nsp-20251231.htm), average WSEEs paid per month, revenues and gross profit per WSEE per month, gross billings and client retention

**Vendor documentation**

- [Square: Payroll pricing](https://squareup.com/us/en/payroll/pricing), a published base fee plus per-person price
