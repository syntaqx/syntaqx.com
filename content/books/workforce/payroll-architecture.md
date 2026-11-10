+++
title = "Payroll Platform Architecture"
nav_title = "Platform Architecture"
description = "The pay run engine as a replayable function, versioned rules, as-of reads, idempotent money, schedulers, tenancy, peak loads, GL exports and testing."
category = "Workforce Industry"
order = 2658
part = "Running the Platform"
tags = ["payroll", "architecture", "idempotency", "temporal-data", "multi-tenancy", "testing"]
+++

A payroll platform is a calculation engine wrapped in a scheduler wrapped in a ledger. The engine turns a period's inputs into statements; the scheduler turns statements into liabilities with due dates and fires the money movements, deposits and filings those dates demand; the ledger records what was owed, moved and reported so that a question asked three years later gets the answer that was true then. Each part has one architectural property that the rest of the volume relies on: the engine is a pure function of dated inputs and versioned rules, so any statement can be recomputed and explained; the scheduler works from computed due dates stored with their rule, so a deadline is never a guess; and every movement of money carries one idempotency key, so a retry never pays twice.

This chapter covers the pay run engine (deterministic, replayable calculations and versioned rules), effective-dated records and as-of queries, idempotent money movement, liabilities and the tax calendar as schedulers, multi-tenant design for thousands of employers, peak loads (Friday check dates, the deadline hour, year-end), general ledger exports, and testing gross-to-net. The calculation order itself is [Gross-to-Net, Step by Step](/books/workforce/gross-to-net#the-calculation-order); the tax engine as a vendor component is [Tax Engines & Filing Services](/books/workforce/tax-engines-and-filing); the money mechanics are [Funding a Payroll](/books/workforce/funding-a-payroll) and [Client Funds & Impound Accounts](/books/workforce/client-funds-and-impounds). The generic patterns live in the playbook and are linked rather than repeated.

## How the Platforms Do It

Payroll providers don't publish their architectures, but their API contracts, vendor documentation and filings expose the properties that matter, as of November 2026:

| Source | What it shows |
| --- | --- |
| **Check** | Idempotent requests with an `X-Idempotency-Key`; "Subsequent requests with the same key return the same result, including 500 errors," and keys "expire after 24 hours"; taxes and net pay locked at the `reopen_deadline`; Tax Deposits created at approval with computed due dates |
| **Gusto Embedded** | Date-based API versions with 12 months of phased support after deprecation; payroll calculation as an explicit step before submission; general ledger reports generated asynchronously per payroll; an Events API beside webhooks |
| **Paycom** | Seasonality: "payroll tax filing forms and ACA forms are typically processed in the first quarter" and "unscheduled payroll runs (such as bonuses) for our clients are typically concentrated in the fourth quarter" (10-K for 2025) |
| **Paylocity** | "Client funds and year-end activities are also traditionally higher during our third fiscal quarter" (January to March) and "many clients switch solutions during the first calendar quarter"; "spikes in client usage" named as a performance risk (10-K for fiscal 2026) |
| **Symmetry Tax Engine** | Stateless calculation with rules effective by the pay date supplied; the caller supplies year-to-date ([The Calculation Layer](/books/workforce/tax-engines-and-filing#the-calculation-layer)) |
| **Vertex Payroll Tax** | Cloud, hosted or on-premise deployment with REST and SOAP APIs ([How the Platforms Do It](/books/workforce/tax-engines-and-filing#how-the-platforms-do-it)) |

Three properties recur. **Calculation is a step, then a lock.** Every API separates computing a payroll from committing it, and after the lock the only change is a correction. **The calendar is the load.** Seasonality in the 10-Ks is the year-end close and the January filing rush, and the daily shape is every employer's deadline landing at the same hour. **Exactly-once is the client's job too.** An idempotency key that expires after 24 hours protects a retry within a day; a platform that might replay a file next week needs its own keys on its own rows.

## The Pay Run Engine

The engine is a function: `statement = f(inputs as of the period, rules as of the check date, year-to-date before this run)`. Everything else in this chapter exists to keep that true.

**Inputs as of a date.** The engine never reads "current" anything. It reads every effective-dated table (assignments, rates, elections, tax locations, deduction elections, enrollments) as of the pay period, and tax rules as of the check date, because federal and state withholding apply the rules in force when wages are paid. [Gross-to-Net](/books/workforce/gross-to-net#how-to-build-it) defined `calculation_runs` with `as_of_period`, `as_of_check_date`, `engine_version` and `inputs_hash`; this chapter adds the snapshot itself.

**Snapshot, then compute.** The run first resolves every input into one document: the worker's assignment and rate rows, the hours, the elections, the year-to-date per tax key, the rule versions in force. It hashes the document, stores it, and passes it to a computation that reads nothing else: no clock, no database, no cache. The output is the statement lines and a trace of steps. Recomputing from the stored snapshot must give the same lines to the cent; recomputing from fresh reads tells you whether anything underneath changed since ([Snapshots](/docs/database/temporal-data#snapshots), [Snapshot What Changes Underneath You](/docs/building-blocks/audit-trails#snapshot-what-changes-underneath-you)).

**Why it matters.** A retro calculation for a raise backdated three periods recomputes each old period with its old snapshot plus the new rate, and pays the difference ([Retro Pay, Voids & Corrections](/books/workforce/retro-pay-voids-and-corrections#retroactive-rate-changes)). A DOL investigator's question about one paycheck is answered by replaying it. A tax engine upgrade is tested by computing last year's snapshots on the new version and diffing. None of these work if the engine read a clock or a mutable table.

The shape, with the replay check built in:

```go tab="Go"
// Snapshot is everything one statement's calculation may read.
type Snapshot struct {
	WorkerID     string            `json:"worker_id"`
	Period       [2]string         `json:"period"`     // closed-open ISO dates
	CheckDate    string            `json:"check_date"` // tax rules resolve by this
	Earnings     []Earning         `json:"earnings"`
	Elections    []Election        `json:"elections"`
	YTD          map[string]int64  `json:"ytd"`        // cents per tax key, before this run
	RuleVersions map[string]string `json:"rule_versions"`
}

// Hash returns the snapshot's identity: SHA-256 over canonical JSON
// (Go's encoder sorts map keys, so equal snapshots hash equally).
func (s Snapshot) Hash() (string, error) {
	b, err := json.Marshal(s)
	if err != nil {
		return "", err
	}
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:]), nil
}

// Replay recomputes a stored statement and reports any line that differs.
func Replay(s Snapshot, stored []Line, calc func(Snapshot) []Line) []LineDiff {
	return diffLines(stored, calc(s)) // calc is pure: no clock, no I/O
}
```

```rust tab="Rust"
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::collections::BTreeMap;

/// Everything one statement's calculation may read.
#[derive(Serialize)]
pub struct Snapshot {
    pub worker_id: String,
    pub period: (String, String), // closed-open ISO dates
    pub check_date: String,       // tax rules resolve by this
    pub earnings: Vec<Earning>,
    pub elections: Vec<Election>,
    pub ytd: BTreeMap<String, i64>, // cents per tax key, before this run; sorted for hashing
    pub rule_versions: BTreeMap<String, String>,
}

impl Snapshot {
    /// The snapshot's identity: SHA-256 over canonical JSON.
    pub fn hash(&self) -> serde_json::Result<String> {
        let bytes = serde_json::to_vec(self)?;
        Ok(hex::encode(Sha256::digest(&bytes)))
    }
}

/// Recomputes a stored statement and reports any line that differs.
pub fn replay(s: &Snapshot, stored: &[Line], calc: impl Fn(&Snapshot) -> Vec<Line>) -> Vec<LineDiff> {
    diff_lines(stored, &calc(s)) // calc is pure: no clock, no I/O
}
```

Two details make the hash trustworthy: maps serialize with sorted keys (Go's encoder sorts map keys; the Rust version uses `BTreeMap`), and amounts are integer cents, so there's no float formatting to drift between runs ([Integer Minor Units](/docs/money/amounts#integer-minor-units)).

## Versioned Rules

Rules come from three places, and each needs a version the run records:

- **Tax engine releases.** The vendor's engine and rule set version, stored per run as [`tax_engine_version_id`](/books/workforce/tax-engines-and-filing#how-to-build-it).
- **Platform rule tables.** Wage bases, taxability rules, deduction limits, minimum wages, overtime rules, deposit rules: rows with `valid_during` ranges in tables other chapters define ([`tax_rates`](/books/workforce/fica-futa-and-suta#how-to-build-it), [`taxability_rules`](/books/workforce/workforce-business#the-core-data-model), [`wage_bases`](/books/workforce/gross-to-net#how-to-build-it), [`deduction_limits`](/books/workforce/deductions)).
- **Engine code.** The calculation's own logic (the order of steps, the rounding rule, how arrears are taken) changes with releases.

The effective date answers "which rule applied on that date"; the version answers "which edition of our rule table did we believe, when we ran." They differ when a rule is corrected: a city's rate published late, a typo in a SUI rate entered in January and fixed in March. A correction to a rule row is a new version of the row, not an edit, so the January runs can be explained ("computed with version 1, which had 3.4%") and recomputed ("version 2 says 3.1%; the difference is a refund"). The `rule_versions` table below records each published version of each rule set, and every snapshot names the versions it read ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions), [Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).

**Which date picks the rule** is itself a rule, and payroll has two answers. Tax withholding, wage bases and deposit schedules follow the date wages are paid (the check date). Wage-hour rules (minimum wage, overtime, daily overtime, meal premiums) follow when the work was done (the work period), which is why `pay_statement_lines.work_period` exists. A minimum wage increase effective January 1 applies to hours worked from January 1, paid on January 9 for the period ending January 3, partly at each rate; the income tax tables applied to that check are the new year's, entirely.

## Effective-Dated Records and As-Of Queries

The core model stores every input with a closed-open `valid_during` range and an exclusion constraint against overlaps ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)). The engine's reads are as-of queries ([As-Of Queries](/docs/database/temporal-data#as-of-queries)):

```sql
-- The assignment, rate and federal election in force for one worker on the period's last day.
SELECT a.id AS job_assignment_id, a.flsa_status, r.rate, r.rate_unit, e.filing_status,
       e.multiple_jobs, e.dependents_amount, e.extra_withholding
FROM job_assignments a
JOIN employments m ON m.id = a.employment_id
JOIN pay_rates r ON r.job_assignment_id = a.id AND r.valid_during @> :period_end
JOIN tax_elections e ON e.worker_id = m.worker_id
                    AND e.jurisdiction_id = :federal
                    AND e.valid_during @> :check_date
WHERE m.worker_id = :worker
  AND a.is_primary
  AND a.valid_during @> :period_end;
```

Two kinds of time are in play ([Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)): when a fact was true (valid time) and when the system learned it (recorded time). Payroll needs both. A W-4 received November 18 and effective for the next payroll is valid from its receipt; a raise entered on November 18 but effective November 1 is valid from November 1 and recorded on November 18. The difference is what retro pay is: valid time that starts before recorded time, inside a period already paid. The snapshot captures recorded time implicitly (it holds what was read when), and `audit_events` holds the history; a query "what did we believe on November 16" is answered from snapshots, not by reconstructing tables.

Future-dated changes are the opposite case and the common one: a raise entered in October effective January 1 sits in `pay_rates` with a future range, and the first January run picks it up with no job to "apply" it ([Scheduling Future Changes](/docs/database/temporal-data#scheduling-future-changes)). [The HRIS as Record of Truth](/books/workforce/hris-record-of-truth#effective-dating-and-future-dated-changes) works the HR side.

## Idempotent Money Movement

Every money movement has exactly one key, derived from what it pays, and the key is unique in `money_movements` ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)). The derivations that work:

| Movement | Key |
| --- | --- |
| Client debit for a run | `client_debit:{pay_run_id}:{attempt}` (a re-debit after a return is a new attempt, deliberately) |
| Net pay credit | `net_pay:{pay_statement_id}:{pay_distribution_id}` |
| Tax deposit | `tax:{remittance_id}` |
| Garnishment payment | `garnishment:{remittance_id}` |
| Refund to employer | `refund:{pay_run_id}:{reason}:{sequence}` |

The key is generated from domain identifiers, not a random value at send time, so a job that crashes after inserting the row but before writing the ACH file finds the row on restart and continues; a job that crashes before inserting simply inserts. The bank file is built from rows in `pending`, and marking them `sent` happens in the same transaction that records the file ([Enqueue Transactionally](/docs/architecture/background-jobs#enqueue-transactionally)). An external API's own idempotency window doesn't replace this: Check's keys "expire after 24 hours," and a remittance retried on Monday after a Friday failure needs the platform's key, not the API's.

```go tab="Go"
// CreditNetPay records one net pay credit exactly once. A retry with the same
// statement and distribution returns the existing movement instead of a new one.
func CreditNetPay(ctx context.Context, tx pgx.Tx, st Statement, d Distribution, amount int64) (string, error) {
	key := fmt.Sprintf("net_pay:%s:%s", st.ID, d.ID)
	var id string
	err := tx.QueryRow(ctx, `
		INSERT INTO money_movements (employer_id, pay_run_id, pay_statement_id, purpose, rail,
		       direction, bank_account_id, amount, effective_date, status, idempotency_key)
		VALUES ($1, $2, $3, 'net_pay', 'ach', 'credit', $4, $5, $6, 'pending', $7)
		ON CONFLICT (idempotency_key) DO UPDATE SET idempotency_key = EXCLUDED.idempotency_key
		RETURNING id`,
		st.EmployerID, st.PayRunID, st.ID, d.BankAccountID, amount, st.CheckDate, key,
	).Scan(&id)
	return id, err
}
```

```rust tab="Rust"
/// Records one net pay credit exactly once. A retry with the same statement
/// and distribution returns the existing movement instead of a new one.
pub async fn credit_net_pay(
    tx: &mut sqlx::PgConnection,
    st: &Statement,
    d: &Distribution,
    amount: i64,
) -> sqlx::Result<uuid::Uuid> {
    let key = format!("net_pay:{}:{}", st.id, d.id);
    sqlx::query_scalar(
        "INSERT INTO money_movements (employer_id, pay_run_id, pay_statement_id, purpose, rail,
                direction, bank_account_id, amount, effective_date, status, idempotency_key)
         VALUES ($1, $2, $3, 'net_pay', 'ach', 'credit', $4, $5, $6, 'pending', $7)
         ON CONFLICT (idempotency_key) DO UPDATE SET idempotency_key = EXCLUDED.idempotency_key
         RETURNING id",
    )
    .bind(st.employer_id).bind(st.pay_run_id).bind(st.id)
    .bind(d.bank_account_id).bind(amount).bind(st.check_date).bind(&key)
    .fetch_one(&mut *tx)
    .await
}
```

The no-op `DO UPDATE` makes `RETURNING` give back the existing row on a conflict, so the caller gets one ID whether it is the first call or the fifth. A retry with a different amount for the same key is a bug, not a new payment; a production version compares the stored amount and fails loudly if it differs.

## Liabilities and the Tax Calendar as Schedulers

Approval creates `liabilities` with computed `due_on` dates; [Deposits, Returns & the Tax Calendar](/books/workforce/deposits-and-returns#the-tax-calendar-as-data) groups them into `tax_calendar_events` per deposit period and return. The scheduler is the loop that reads those rows and acts:

- **Due-date driven, not cron driven.** A job "pay the IRS deposit for the Wednesday-to-Friday period" exists because a calendar event with `due_on` and an `operational_deadline_at` exists, not because a cron fires on Wednesdays. When a holiday moves a due date, the event moves and the job with it.
- **Work backwards from the deadline.** An EFTPS deposit must be initiated before the cutoff the business day before it settles; the job's `run_at` is the operational deadline less a margin, with an alarm if the job hasn't succeeded by the deadline itself.
- **One job per obligation, with the obligation's key.** A deposit job for calendar event X is unique on X; a retry after a crash finds the remittance it already created ([Retries and Dead Letters](/docs/architecture/background-jobs#retries-and-dead-letters)).
- **Late is a state, visible.** A job past its deadline doesn't silently keep retrying; the event becomes `late`, the penalty exposure is computed ([Failure-to-Deposit Penalties](/books/workforce/deposits-and-returns#failure-to-deposit-penalties)), and a person owns it.

The same scheduler runs the rest of the calendar: quarterly returns at quarter end, W-2s by the year-end deadline, garnishment remittances within each order's days, 401(k) remittances, SUI wage reports, rate notice loads, deposit schedule determinations each year. Every scheduled job points at the row that justified it, so "why did this run" and "what didn't run" are queries.

## Multi-Tenant Design for Thousands of Employers

The tenant is the company: one customer, one contract, one permissions boundary, with employers (EINs) beneath it ([Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies)). Every row carries `company_id` directly or through its employer, and the database enforces it ([Enforce It in the Database](/docs/architecture/multi-tenancy#enforce-it-in-the-database)). Payroll adds three twists:

- **Two tenant axes.** Accountants and PEOs see many companies; a PEO's worksite employees are in the PEO's employer (its EIN) and the client's company at once ([PEOs & Co-Employment](/books/workforce/peos-and-co-employment#how-to-build-it)). Access is granted per company and per employer, and filings run per employer across companies.
- **Platform-wide rules, tenant-specific choices.** Tax rules, wage bases and minimum wages are shared rows with no tenant; SUI rates, earning codes and local options are per employer. A query that joins them must never let a tenant's override leak to another, and a shared rule change must be reviewed as affecting every tenant at once.
- **Noisy neighbors by calendar.** One employer with 50,000 workers approves at the same deadline as 2,000 small ones. Calculation runs per statement, so a large run is many small jobs; queue them with per-company concurrency limits so a large employer's run doesn't starve the small ones ([Noisy Neighbors](/docs/architecture/multi-tenancy#noisy-neighbors)).

Partitioning follows the same seams: statement lines by check date (most reads are by period, and old years are cold), and by company where a single database can't hold the volume.

## Peak Loads

Payroll load isn't spread across the week or the year; the law and the banking calendar concentrate it.

**The week.** Most employers pay on Fridays, and the partners' deadlines put approval days before: a 4-day speed approves on Monday for a Friday check date, and every partner has one time of day (Check's 5pm PT collection, Gusto's 4:00pm PT `payroll_deadline`, Zeal's 2 PM PT batch) when all of that day's approvals close. Worked with invented numbers for a platform with 20,000 employers averaging 40 workers: say 4,000 pay weekly, 12,000 biweekly (half of them each Friday), 3,000 semimonthly and 1,000 monthly. A typical Friday check date carries the weekly employers' 160,000 statements and half the biweekly employers' 6,000 x 40 = 240,000, so 400,000 statements, plus semimonthly on the 15th and last day. If 70% of those runs are approved in the last two hours before Monday's deadline (admins approve late, after the last timesheet), the engine must calculate and lock about 280,000 statements in two hours, roughly 39 per second sustained, while the morning's preview traffic is a fraction of that. Over the year, the same platform produces 4,000 x 40 x 52 + 12,000 x 40 x 26 + 3,000 x 40 x 24 + 1,000 x 40 x 12 = 8,320,000 + 12,480,000 + 2,880,000 + 480,000 = 24,160,000 statements.

**The quarter.** Every quarterly return (941, state withholding, SUI wage reports) for every employer is built from locked statement lines in the month after the quarter ends, all due the same day.

**The year.** Paycom's 10-K puts tax forms and ACA forms in the first quarter and bonus off-cycle runs in the fourth; Paylocity's puts "year-end activities" and client switching in January to March. The last payroll of December carries bonuses, imputed income true-ups and benefit limit catch-ups, December 31 check dates fall on bank holidays' doorsteps, January 1 activates every new tax table and wage base at once, and W-2s for every worker paid during the year (terminated ones included) are due to employees and the SSA together ([The Year-End Close and the January Rush](/books/workforce/year-end-and-w2s#the-year-end-close-and-the-january-rush)).

The design responses: precompute what can be (preview calculations as timesheets arrive, so approval is a lock, not a calculation); admit work by deadline rather than arrival, so runs closest to their cutoff go first ([Priority Classes](/docs/architecture/admission-control#priority-classes)); freeze non-urgent deploys from mid-December to the end of January; and load-test against last year's actual peak day, replayed from snapshots, with the new year's rules.

## General Ledger Exports

The employer's accountant needs each pay run as a journal entry in its own chart of accounts. Gusto Embedded produces a general ledger report per payroll in JSON, with rows of account type, description, job, debit and credit, requested asynchronously and polled by request ID. The core of every such export is the same mapping from statement lines to accounts, by pay item type and line type, configured per company ([Syncing to the Accounting System](/docs/money/accounting#syncing-to-the-accounting-system)).

Worked from the invented run in [The Life of a Pay Run](/books/workforce/workforce-business#the-life-of-a-pay-run): gross pay $160,000.00, employee Social Security $9,622.40 and Medicare $2,250.40 matched by the employer, federal income tax withheld $14,880.00, 401(k) deferrals $6,400.00, Section 125 premiums $4,800.00, net pay $122,047.20. The summary journal at the check date:

| Account | Debit | Credit |
| --- | --- | --- |
| Wages expense | $160,000.00 | |
| Payroll tax expense (employer Social Security and Medicare) | $11,872.80 | |
| Net pay clearing | | $122,047.20 |
| Federal payroll taxes payable ($14,880.00 + 2 x $11,872.80) | | $38,625.60 |
| 401(k) deferrals payable | | $6,400.00 |
| Health premiums payable | | $4,800.00 |
| **Total** | **$171,872.80** | **$171,872.80** |

When the provider debits the employer on Monday, a second entry clears net pay and the taxes and deferrals the provider collected against cash ($167,072.80, the debit in the example); the premiums payable stay until the carrier's invoice is paid. Three choices the export has to make explicit: summary or detail (one line per account, or per department or job for cost allocation); the date (my default posts at the check date, the date the payroll facts exist, and leaves the accrual of earned-but-unpaid wages at month end to the accountant's adjustment); and stability (an export is a batch with an ID, sent once, and a correction run produces its own entry rather than a re-sent original; [One Log Per Sync Batch](/docs/money/accounting#one-log-per-sync-batch), [Idempotent Sync](/docs/money/accounting#idempotent-sync)).

## Testing Gross-to-Net

A payroll engine is tested at four levels:

- **Agency worked examples and boundary cases,** pinned to the publication year, as [Testing a Tax Engine](/books/workforce/tax-engines-and-filing#testing-a-tax-engine) lays out; the same applies to the platform's own rules (a regular rate with a bonus, a deferral that hits the annual limit mid-period, a garnishment that leaves net pay at the CCPA floor).
- **Invariants on every statement,** checked in production as well as tests: gross equals the sum of earning lines; net equals gross less deductions and employee taxes; no tax line's taxable wages exceed its subject wages; year-to-date Social Security wages never exceed the base per employer; net pay distributions sum to net. A violated invariant blocks approval.
- **Replay.** Every night, a sample of yesterday's statements is recomputed from snapshots; any difference means the engine read something outside its snapshot.
- **Golden years and differentials.** A full year of synthetic employers and workers (every pay frequency, state, local tax, deduction type, garnishment kind and correction) is computed on every engine release and diffed against the approved outputs; a rule release runs the next year's first payroll for a sample of real employers against old and new rules before its effective date ([Testing Rules](/docs/building-blocks/rules-as-data#testing-rules)).

Property tests fit payroll well: generate random earnings, elections and year-to-date, and assert the invariants hold and that splitting a payment into two runs on the same check date yields the same total tax as one run, within the rounding the rules allow.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `pay_runs`, `accumulators`, `audit_events` and `liabilities` exist; [Gross-to-Net](/books/workforce/gross-to-net#how-to-build-it) added `calculation_runs` and `calculation_steps`, and [Deposits, Returns & the Tax Calendar](/books/workforce/deposits-and-returns#how-to-build-it) added `tax_calendar_events`. This chapter adds rule versions, calculation snapshots, GL exports and scheduler jobs.

```sql
-- Each published edition of a rule set the engine reads.
CREATE TABLE rule_versions (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  rule_set            TEXT NOT NULL,         -- 'tax_rates', 'taxability_rules', 'wage_bases',
                                             -- 'deduction_limits', 'minimum_wage_rates', 'engine_code', ...
  version             INT NOT NULL,
  published_at        TIMESTAMPTZ NOT NULL,
  supersedes_id       UUID REFERENCES rule_versions (id),
  change_summary      TEXT NOT NULL,
  source_ref          TEXT,                  -- the agency notice, release note or commit
  approved_by         TEXT NOT NULL,
  retro_from          DATE,                  -- set when the change corrects past periods
  UNIQUE (rule_set, version)
);

-- The exact input document a calculation read, by hash; replay reads only this.
CREATE TABLE calculation_snapshots (
  inputs_hash         CHAR(64) PRIMARY KEY,  -- matches calculation_runs.inputs_hash
  company_id          UUID NOT NULL REFERENCES companies (id),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  document            JSONB NOT NULL,        -- assignments, rates, hours, elections, YTD
  rule_version_ids    UUID[] NOT NULL,       -- rule_versions read
  tax_engine_version_id UUID REFERENCES tax_engine_versions (id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE calculation_runs
  ADD FOREIGN KEY (inputs_hash) REFERENCES calculation_snapshots (inputs_hash),
  ADD COLUMN replayed_at     TIMESTAMPTZ,
  ADD COLUMN replay_result   TEXT CHECK (replay_result IN ('match', 'diff', 'error'));

-- One journal batch per run (or correction) per company's ledger.
CREATE TABLE gl_exports (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  pay_run_id          UUID NOT NULL REFERENCES pay_runs (id),
  entry_kind          TEXT NOT NULL CHECK (entry_kind IN ('payroll_expense', 'funding',
                        'remittance', 'correction')),
  posting_date        DATE NOT NULL,
  detail_level        TEXT NOT NULL CHECK (detail_level IN ('summary', 'department', 'job',
                        'worker')),
  mapping_version     INT NOT NULL,          -- the company's account mapping used
  lines               JSONB NOT NULL,        -- [{account, debit, credit, dimension}], cents
  total_debit         BIGINT NOT NULL,
  total_credit        BIGINT NOT NULL,
  destination         TEXT,                  -- the accounting system it was sent to
  external_ref        TEXT,                  -- the journal's ID there
  status              TEXT NOT NULL CHECK (status IN ('built', 'sent', 'acknowledged', 'failed')),
  idempotency_key     TEXT NOT NULL UNIQUE,
  CHECK (total_debit = total_credit)
);

-- Every scheduled obligation, pointing at the row that justified it.
CREATE TABLE scheduler_jobs (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                TEXT NOT NULL,         -- 'client_debit', 'net_pay_file', 'tax_deposit',
                                             -- 'return_build', 'garnishment_remit', 'w2_file', ...
  subject_table       TEXT NOT NULL,         -- 'pay_runs', 'tax_calendar_events', 'filings', ...
  subject_id          UUID NOT NULL,
  run_at              TIMESTAMPTZ NOT NULL,  -- deadline less margin
  deadline_at         TIMESTAMPTZ NOT NULL,  -- after this, the obligation is late
  priority            SMALLINT NOT NULL,     -- earlier deadline, higher priority
  attempts            SMALLINT NOT NULL DEFAULT 0,
  status              TEXT NOT NULL CHECK (status IN ('scheduled', 'running', 'succeeded',
                        'failed', 'late', 'canceled')),
  owner               TEXT,                  -- the person on a late or failed job
  last_error          TEXT,
  UNIQUE (kind, subject_table, subject_id)
);

-- Obligations at risk: not done, deadline within four hours or passed.
SELECT kind, subject_table, subject_id, deadline_at, status, attempts
FROM scheduler_jobs
WHERE status IN ('scheduled', 'running', 'failed')
  AND deadline_at < NOW() + INTERVAL '4 hours'
ORDER BY deadline_at;
```

Design notes:

- **Snapshots are content-addressed.** Two calculations with identical inputs share one snapshot row, and replay is `SELECT document ... WHERE inputs_hash = ...` followed by the pure function; a replay that differs is a defect in purity, not a data change.
- **A rule correction carries its blast radius.** `rule_versions.retro_from` lets the correction job find every snapshot that read the superseded version within the retro window and queue recomputation through the corrections process.
- **The GL batch balances or doesn't exist.** `CHECK (total_debit = total_credit)` and a unique idempotency key per batch keep an export from posting twice or half.
- **Jobs are unique per obligation.** `UNIQUE (kind, subject_table, subject_id)` is the scheduler's idempotency; a second enqueue for the same deposit is a conflict, not a second deposit.
- **Retention follows the record, not the table.** Snapshots for paid statements are kept as long as the statements they explain ([Retention Schedules by Record Type](/docs/building-blocks/data-retention#retention-schedules-by-record-type)); drafts that never ran can be purged.

## Auditing

A SOC 1 auditor, a DOL investigator and an IRS examiner each test a different layer of this architecture:

- **Reproducibility.** Any paid statement, recomputed from its snapshot, matches; replay results are kept as evidence that the engine is pure.
- **Rule provenance.** Every rule version with its source, approver and publication time, and which runs read it.
- **Change management.** Engine and rule releases with their test results and approvals, which is the SOC 1 change management control ([Controls, Audits & SOC 1](/books/workforce/controls-audits-and-soc1)).
- **Schedule integrity.** Every obligation, its deadline, when it ran and its result; late items with their owner and resolution.
- **Export trail.** Every GL batch with its mapping version and acknowledgment, so the employer's books tie to the pay runs.

## What This Means for the System You Build

- **Make the engine a pure function of a stored snapshot,** hash the snapshot, and replay a sample every night.
- **Version every rule set,** record the versions each calculation read, and treat a correction as a new version with a retro window.
- **Pick the rule's date deliberately:** check date for tax, work period for wage-hour.
- **Derive money movement keys from what they pay,** keep them forever, and don't rely on an API's 24-hour key window.
- **Schedule from computed deadlines,** with one job per obligation and lateness as a visible state with an owner.
- **Tenant by company, file by employer,** with shared rules reviewed as platform-wide changes and per-company concurrency at the deadline hour.
- **Plan capacity for the deadline hour and January,** precompute previews, and freeze risky changes over year-end.
- **Export balanced, idempotent journal batches** from statement lines through a versioned account mapping.
- **Test with agency examples, invariants on every statement, replay and golden years.**

## References

**Filings**

- [Paycom: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1590955/000119312526059372/payc-20251231.htm), seasonality of tax forms and ACA forms in the first quarter and bonus runs in the fourth
- [Paylocity: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/1591698/000159169826000069/pcty-20260630.htm), year-end activity and client switching in the third fiscal quarter, and usage spikes as a performance risk

**Vendor documentation**

- [Check: Idempotent requests](https://docs.checkhq.com/docs/idempotent-requests.md), the `X-Idempotency-Key` header, 24-hour expiry and repeated results including errors
- [Check: Life of a payroll](https://docs.checkhq.com/docs/life-of-a-payroll.md), locking at the `reopen_deadline` and the 5pm PT collection
- [Check: Tax deposits](https://docs.checkhq.com/docs/tax-deposits.md), deposits created at approval with computed due dates
- [Gusto Embedded: Payroll statuses](https://docs.gusto.com/embedded-payroll/docs/payroll-statuses.md), the 4:00pm PT payroll deadline
- [Gusto Embedded: API versioning](https://docs.gusto.com/embedded-payroll/docs/api-versioning.md), date versions and phased support
- [Gusto Embedded: Retrieve a general ledger report](https://docs.gusto.com/embedded-payroll/docs/retrieve-a-general-ledger-report.md), the JSON report, its rows and the asynchronous request
- [Zeal: Running payroll](https://docs.zeal.com/docs/employee-checks-guide.md), the 2 PM PT batch two days before the check date
