+++
title = "Unified HR & Payroll APIs"
nav_title = "Unified HR APIs"
description = "Finch, Merge and others: one API over hundreds of payroll and HR systems, read and write scopes, assisted connections, sync cadence and deduction write-back."
category = "Workforce Industry"
order = 2657
part = "Running the Platform"
tags = ["payroll", "hris", "unified-apis", "integrations", "401k", "data-freshness"]
+++

A unified HR and payroll API is one interface over hundreds of employers' systems of record. A 401(k) recordkeeper, a benefits broker, an insurer pricing workers' compensation, a lender verifying income or an HR tool that needs the org chart each serves employers on dozens of payroll and HRIS products, and none of them wants to build and maintain dozens of integrations, each with its own authentication, schema, rate limits and quirks. The unified API vendor builds the connectors, normalizes what they return into common models (a company, a directory, an individual, an employment, a pay statement, a deduction), and in the hardest cases sends people to do by hand what the source system's API can't.

The read side is a data pipeline with a freshness problem. The write side is narrower and matters more: the main reason these products write at all is that a retirement plan's recordkeeper has to change what payroll deducts when a participant changes a deferral, and benefits platforms need the same for premiums. This chapter covers why the category exists, the vendors, read and write scopes, automated and assisted connections, sync cadence and freshness, deduction write-back worked against a pay period close, webhooks, consent and security, and how to build the consumer side. Embedded payroll, which runs payroll rather than reading it, is the previous chapter, [Embedded Payroll](/books/workforce/embedded-payroll); the HRIS's own change feeds to its payroll are in [The HRIS as Record of Truth](/books/workforce/hris-record-of-truth#hris-to-payroll-integration); the generic build-or-buy question is in the playbook's [Build, or Buy a Unified API](/docs/building-blocks/integrations#build-or-buy-a-unified-api).

## Who Reads Payroll Data, and Why

The buyers are the parties in [Who's Who](/books/workforce/workforce-business#who-s-who) that sit beside payroll rather than in it:

- **Retirement plan recordkeepers and 401(k) providers** read census data (hire dates, hours, compensation, terminations) for eligibility and nondiscrimination testing, read each pay statement's deferrals and match to reconcile what arrived, and write deferral elections back into payroll. The recordkeeping side is [Investing & Digital Assets](/books/investing-and-digital-assets/retirement-accounts#401-k-recordkeeping-in-brief); the deferral calculation and limits as payroll enforces them are [Pre-Tax & Post-Tax Deductions](/books/workforce/deductions).
- **Benefits brokers and administration platforms** read the employee directory and employment status to drive eligibility and enrollment, and write premium deductions back.
- **Insurers and workers' compensation programs** read payroll by class to price and audit premium ([Pay-As-You-Go](/books/insurance/rating-workers-comp#pay-as-you-go) is the insurance side).
- **Lenders, earned wage access and income verification** read pay history and pay schedules ([Earned Wage Access](/books/banking-and-lending/earned-wage-access) owns that product).
- **HR tools** (performance, learning, compensation planning, identity provisioning) read the directory and org structure, and many of them want changes the day they happen.

Each reads a different slice at a different cadence, and the vendor's scopes and products are cut along those lines.

## How the Platforms Do It

The unified APIs over payroll and HR, as their public documentation describes them, as of November 2026:

| Vendor | Coverage and models | Connections and cadence | Writes |
| --- | --- | --- | --- |
| **Apideck** | An HRIS API with employees, companies, departments, payrolls, employee payrolls, employee schedules and time off requests | (not stated on the reference page I opened) | Create, update and delete for employees, companies, departments and time off requests; payrolls, employee payrolls and schedules are read-only |
| **Finch** | "250+" HRIS and payroll integrations; products Organization, Payroll, Deductions, Benefits, Recordkeeper and Documents (beta) | Automated integrations sync "every 24 hours"; assisted integrations refresh "every 7 days" after a one-time configuration period of one to two weeks; the initial sync pulls "2 full years of historical data" plus year to date | Company-level deductions and individual enrollments as asynchronous jobs; automated writes submitted immediately, assisted writes entered "within 2 business days" |
| **Kombo** | A "Unified HRIS API" to "read employee data, manage absences, and more" | (not stated on the page I opened) | Absence management named |
| **Merge** | Common models for HRIS: bank info, benefits, companies, dependents, employee payroll runs, employees, employer benefits, employments, groups, locations, pay groups, payroll runs, time off and balances, timesheet entries | Sync frequency tiers Highest, Daily ("every 24 hours"), Monthly or Quarterly ("reduced cadence") and Manual; US, EU and APAC tenants | POST and PATCH for supported platforms and models, confirmed per integration in the API reference |

Three patterns. **Normalization is lossy by design.** A common model has the fields most systems share; a field one payroll has and others don't comes through as passthrough or a field mapping, or not at all (Merge offers both). The consumer has to know which fields are normalized and which are best effort. **Freshness is a product tier, not a constant.** Finch's cadence depends on the connection type; Merge's on the plan, with sync credits for manual plans. A consumer that needs yesterday's payroll and buys a weekly cadence will be wrong in a way it can't see. **Writes are jobs, not calls.** Every write that reaches a payroll system goes through the source system's own rules and calendar, so it returns a job to poll or a webhook to wait for, and success means "entered," not "deducted."

## Read Scopes

A consumer asks for the products it needs, and the employer grants them when it connects. Finch's products divide the payroll world sensibly:

| Finch product | What it reads | Core model equivalent |
| --- | --- | --- |
| Organization: company, directory, individual, employment | Legal entity and EIN, locations, departments; every worker with manager and status; personal details (with a separate SSN scope); employment dates, title, income and class | `employers`, `workers`, `persons`, `employments`, `job_assignments`, `pay_rates` |
| Payroll: payments, pay statements, pay statement items, pay groups | Each pay date's totals; each worker's statement with earnings, taxes, employee deductions and employer contributions | `pay_runs`, `pay_statements`, `pay_statement_lines` |
| Deductions | Company deductions and contributions and who is enrolled | `deduction_codes`, `deduction_elections` |
| Benefits (read) | "Read benefit plans, employee enrollments, and covered dependents" | `benefit_plans`, `benefit_enrollments`, `dependents` |
| Documents (beta) | Tax forms such as W-4s | `tax_elections`, `documents` |

Merge's common models cover the same ground with different seams: `PayrollRun` and `EmployeePayrollRun` for runs and statements, `Employment` for pay rate history, `BankInfo` for deposit accounts, `TimesheetEntry` for hours.

Scope is the first privacy control. Finch asks the consumer to "Request the ssn product scope on a Connect session" separately, so a benefits tool that needs names and dates of birth doesn't also receive SSNs. My rule: request the narrowest product set per use, and if a feature needs more later, run a new consent for it rather than asking for everything at the start. A connection that can read bank account details (Merge's `BankInfo`) is a payroll diversion risk if its token leaks (Payroll Fraud & Security covers the fraud); don't request it unless the product moves money.

## Automated and Assisted Connections

Not every payroll system has an API, and some that do don't expose deductions. Finch's two integration types are the clearest public description of how a unified API covers them:

- **Automated.** "The employer authenticates through Finch Connect using OAuth, credentials, or an API token," and Finch syncs from the provider "on a 24-hour refresh cadence." Writes go to the provider immediately, or on an `effective_date`.
- **Assisted.** "Finch manages the data sync with the provider on the employer's behalf." The employer adds a third-party administrator to its own system of record, and Finch operates that account: reads are refreshed "every 7 days," writes are "written back within 2 business days," and a one-time configuration period comes first (two weeks for Organization and Payroll, one week for Deductions).

The assisted model is a service business inside an API: people logging into a payroll provider as an admin the employer invited, reading reports and keying deduction changes. That has consequences the consumer has to design for. Latency is days, not seconds. The employer has granted a human an admin seat in its payroll, which its own access reviews should see (Controls, Audits & SOC 1 covers user access reviews). And the source is a report or a screen, so fields that need judgment (which earning code is overtime, which deduction is the Roth 401(k)) are mapped by a person once, during configuration, and drift if the employer renames a code.

My rule: store the connection type on every connection and every record it produced, and let the consumer's logic branch on it. A recordkeeper that reconciles deferrals to remittances tolerates a week's lag on an assisted connection and alarms on a two-day lag on an automated one.

## Sync Cadence and Freshness

A read API is a cache of someone else's database, refreshed on a schedule. Finch states the refresh cadence and stamps every response with when the data was retrieved: `Finch-Data-Retrieved` ("The date/time that the data was retrieved from the employment system") and `Finch-Last-Attempted-Update-Date`. For a multi-entity connection, "Finch runs a separate data sync for each entity," so each EIN can have a different age. Merge's sync frequency "is the rate at which Merge initiates requests to fetch data from third-parties," and "Actual time to complete a sync can vary depending on the third-party."

Worked for an invented pay run, with a check date of Friday, November 20, 2026, processed by the employer's payroll provider on Monday, November 16:

| Connection | When the pay statements can first appear | Latest they appear |
| --- | --- | --- |
| Automated, 24-hour cadence | The first sync after the provider publishes the statements: Monday night or Tuesday, if the provider shows statements before the check date; otherwise Friday night or Saturday | About 24 hours after the provider publishes them |
| Assisted, 7-day cadence | The next weekly refresh after publication | Up to seven days later: as late as Friday, November 27 |
| Manual tier | When the consumer triggers a sync | Whenever it does |

Two consequences for consumers:

- **Freshness travels with the data.** Store the retrieved-at timestamp on every row loaded, and compute every downstream figure (a deferral reconciliation, an income verification, an eligibility decision) with the oldest timestamp it depended on. An income verification that says "as of November 27" is honest; one that says "current" is not.
- **Absence isn't zero.** A pay statement missing from Tuesday's read may not exist yet. A reconciler that treats "no deferral received" as "no deferral made" will email a participant about a contribution that arrives Friday. Compare against the expected pay schedule (the pay groups and pay dates the API exposes), and only flag a missing statement once the expected date plus the connection's cadence has passed.

## Deduction Write-Back

The write path exists because the retirement plan's records and the payroll's deductions must match. A participant changes a deferral rate on the recordkeeper's website; the recordkeeper must get the new rate into the employer's payroll before the next pay period closes, or the next paycheck deducts the old rate and someone corrects it by hand.

Finch's deductions API shows the mechanics. It operates "at two levels: the company-level and the individual-level": a company deduction (a `401k` benefit, for example) returns a `benefit_id`, and individuals are enrolled, updated and unenrolled under it with `POST /benefits/{benefit_id}/individuals`, where "the enrollment configuration will be completely overwritten," so an update carries the whole configuration, not a delta. Calls return a `job_id`; job statuses are "pending, in_progress, complete, or error," a `complete` status "does not mean success," and "Finch does not automatically retry failed jobs." Timing is the part to plan around: changes apply to the pay period whose close date hasn't passed, submitted at least 24 hours before the close for automated connections and at least three days before for assisted ones; later changes go to the next period. And the endpoints "change deductions and contributions in the payroll system only"; enrolling in the plan itself is separate.

Worked with invented numbers: an employee paid $2,000.00 biweekly raises a pre-tax 401(k) deferral from 4% to 6% on the recordkeeper's site on Wednesday, November 11, 2026. The employer's pay period runs November 1 through 14 and closes Saturday, November 14, for the November 20 check date.

| Connection | Submit by | Change on November 11 | November 20 deferral |
| --- | --- | --- | --- |
| Automated | Friday, November 13 (24 hours before the close) | In time | 6% of $2,000.00 = $120.00 |
| Assisted | Wednesday, November 11 (three days before the close) | In time only if submitted that day | $120.00 if submitted by the 11th; otherwise $80.00 (4%) |

If the assisted write misses, the November 20 check deducts $80.00, $40.00 less than elected, and the December 4 check is the first at 6%. Whether the plan requires a make-up is the plan's rule, not the API's; the recordkeeper needs to know the change was late, which it learns only from the job result and the next pay statement read. That is the reconciliation every write-back consumer runs: for each enrolled worker and pay date, expected deferral from the election and its effective period, against the deferral on the statement as read, with differences classified as late write, failed job, limit reached (the plan year's [deferral limit](/books/workforce/deductions) stopped it) or genuine error.

The employer side of the same change is an ordinary [deduction election](/books/workforce/workforce-business#the-core-data-model): a new `deduction_elections` row with a `valid_during` starting at the period the write lands in, created by an integration actor and logged in `audit_events`. A payroll provider receiving writes from a unified API should treat them like any other change source: idempotent per request, effective-dated, visible to the employer's admin, and subject to the same cutoff.

## Webhooks and Change Detection

Both vendors push events so consumers don't poll:

- **Finch** sends `account.updated`, `job.{job_type}.completed` (for example `job.benefit_enroll.completed`) and data change events in the form `{endpoint}.{created|updated|deleted}` such as `employment.updated`, one event per changed record. Requests carry `Finch-Signature`, `Finch-Event-Id` and `Finch-Timestamp`; verification is HMAC-SHA256 over `{webhook_id}.{webhook_timestamp}.{body}`, with the header able to hold several signatures for secret rotation, and timestamps more than five minutes off rejected. Retries run immediately and after 5 seconds, 5 minutes, 30 minutes and 2 hours; "If all retries are exhausted without a successful delivery, the event is dropped," and Finch recommends a recurring sync alongside webhooks.
- **Merge** sends `LinkedAccount.linked`, `LinkedAccount.sync_completed`, `LinkedAccount.deleted`, `Issue.new` and related issue events, and `{common_model}.added`, `.changed`, `.removed` and `.synced`, plus completions for async writes and passthroughs. The `X-Merge-Webhook-Signature` header is an HMAC-SHA256 of the payload encoded as Base64url.

A dropped event is a design input, not a bug report: change detection has to survive it. My pattern is the same as for embedded partners: verify, store with the event ID, deduplicate, then fetch the current record rather than trusting the event body; and run a periodic full comparison keyed on the vendor's IDs, so a missed `employment.updated` is caught within one cycle.

## Consent, Tokens and Security

The employer, not the consumer, authorizes access, through the vendor's connect flow (Finch Connect, "an embedded onboarding flow that enables employers to connect their HR or payroll system to your app"; Merge Link). The result is a credential per employer connection: a Finch `access_token`, a Merge account token sent as `X-Account-Token`. Four rules:

- **Tokens live on the backend.** Finch's guidance is that the backend "should always store the access token in a secure database" and "should never return the access token to the frontend application" ([Storing Tokens](/docs/building-blocks/integrations#storing-tokens)).
- **Consent has a scope and a date.** Record which products the employer granted, when, by whom (the admin who completed the connect flow), and for which entities. A new scope is a new consent.
- **Connections break.** An employer changes its payroll password, removes the third-party admin, or switches providers. Finch returns a `reauthenticate_user` error with a 401 and the connection has to be re-authorized; Merge raises Issues with `ONGOING` and `RESOLVED` statuses. The consumer surfaces this to the employer quickly, because every day the connection is down, deferrals stop reconciling ([Connection Health and Reconnect](/docs/building-blocks/integrations#connection-health-and-reconnect)).
- **Data stays in its region and its purpose.** Merge offers US, EU and APAC tenants. Payroll data is personal data about employees who never dealt with the consumer; under the GDPR the employer is typically the controller and the consumer a processor for the employer's purpose ([GDPR](/docs/compliance/gdpr)), and in the US, state privacy law covers employee data in California ([Employee Data Under the CCPA](/books/workforce/employee-records-and-privacy#employee-data-under-the-ccpa)). SSNs, bank details and pay are [sensitive data](/docs/security/sensitive-data#classify-every-field) on the consumer's side as much as the source's.

When an employer disconnects, the consumer stops syncing, revokes or deletes the token, and applies its retention schedule to what it already copied; the source system's records are unaffected.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model), from the consumer's side: a recordkeeper or benefits platform that reads and writes through a unified API, or a payroll provider receiving such writes. `workers` and `deduction_elections` exist; [The HRIS as Record of Truth](/books/workforce/hris-record-of-truth#how-to-build-it) added `downstream_syncs` with a `unified_api` target for the HRIS's outbound side. This chapter adds the connection, each sync job, and each deduction write-back.

```sql
-- One employer's authorization for one consumer, through one vendor.
CREATE TABLE connections (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  employer_id         UUID REFERENCES employers (id),   -- set when the connection is per entity
  vendor              TEXT NOT NULL,         -- the unified API
  source_system       TEXT NOT NULL,         -- the payroll or HRIS behind it
  connection_type     TEXT NOT NULL CHECK (connection_type IN ('automated', 'assisted', 'manual_file')),
  scopes              TEXT[] NOT NULL,       -- 'directory', 'individual', 'ssn', 'payment',
                                             -- 'pay_statement', 'deduction', 'benefits', ...
  consented_by        TEXT NOT NULL,         -- the employer admin who completed the connect flow
  consented_at        TIMESTAMPTZ NOT NULL,
  token_ref           TEXT NOT NULL,         -- vaulted; never the token
  vendor_connection_ref TEXT NOT NULL,
  data_region         TEXT NOT NULL DEFAULT 'us',
  expected_cadence    INTERVAL NOT NULL,     -- '24 hours', '7 days'
  write_lead_time     INTERVAL,              -- '24 hours', '3 days' before a period closes
  status              TEXT NOT NULL CHECK (status IN ('configuring', 'active', 'reauth_required',
                        'disconnected', 'revoked')),
  status_changed_at   TIMESTAMPTZ NOT NULL,
  UNIQUE (vendor, vendor_connection_ref)
);

-- Every read, with what it returned and how old the data was.
CREATE TABLE sync_jobs (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  connection_id       UUID NOT NULL REFERENCES connections (id),
  kind                TEXT NOT NULL CHECK (kind IN ('initial', 'scheduled', 'webhook', 'manual',
                        'reconciliation')),
  products            TEXT[] NOT NULL,
  entity_ref          TEXT,                  -- per entity for multi-entity connections
  started_at          TIMESTAMPTZ NOT NULL,
  finished_at         TIMESTAMPTZ,
  data_retrieved_at   TIMESTAMPTZ,           -- the vendor's own stamp of when it read the source
  records_added       INT NOT NULL DEFAULT 0,
  records_changed     INT NOT NULL DEFAULT 0,
  records_removed     INT NOT NULL DEFAULT 0,
  status              TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'partial', 'failed')),
  error               TEXT
);

-- Each deferral or premium change sent to payroll, and what the next statement showed.
CREATE TABLE deduction_writebacks (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  connection_id       UUID NOT NULL REFERENCES connections (id),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  deduction_kind      TEXT NOT NULL,         -- '401k', 'roth_401k', 'section125_medical', ...
  amount              BIGINT,                -- per period, cents
  percent             NUMERIC(6, 3),
  requested_effective_on DATE NOT NULL,
  submit_by           TIMESTAMPTZ NOT NULL,  -- period close less the connection's lead time
  submitted_at        TIMESTAMPTZ,
  vendor_job_ref      TEXT,
  job_status          TEXT CHECK (job_status IN ('pending', 'in_progress', 'complete', 'error')),
  job_errors          JSONB,
  landed_period_start DATE,                  -- the pay period it actually took effect in
  verified_statement_ref TEXT,               -- the first statement read that shows it
  outcome             TEXT CHECK (outcome IN ('on_time', 'late', 'failed', 'superseded',
                        'limit_reached', 'mismatch')),
  idempotency_key     TEXT NOT NULL UNIQUE,
  CHECK ((amount IS NULL) <> (percent IS NULL))
);

-- Connections whose data is older than their cadence allows: the freshness alarm.
SELECT c.id, c.source_system, c.connection_type, MAX(j.data_retrieved_at) AS last_data
FROM connections c
JOIN sync_jobs j ON j.connection_id = c.id AND j.status IN ('succeeded', 'partial')
WHERE c.status = 'active'
GROUP BY c.id
HAVING MAX(j.data_retrieved_at) < NOW() - c.expected_cadence * 1.5;
```

Design notes:

- **The connection type sets every timing rule.** `expected_cadence` and `write_lead_time` come from the connection type, so the freshness alarm and `submit_by` are computed, never typed ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **A write is verified by a read.** `outcome` stays null until a statement read shows the deduction, so `complete` from the vendor is never the end of the story.
- **Full configuration per write.** Because an enrollment update overwrites, the write payload is built from the consumer's current election, not from the change, and stored with the request.
- **Loaded rows carry their source.** Rows created from a read keep `sync_job_id` and the vendor's record ID, so a correction in the source can be matched, and a disconnected employer's data can be found and purged.
- **Events:** `connection.reauth_required`, `writeback.late` and `writeback.mismatch` go to the employer-facing support queue; `sync.stale` to operations.

## Auditing

Consumers of payroll data answer to the employer, the plan's auditors and privacy regulators. Keep:

- **Consent per connection,** with scopes, the consenting admin, dates and every scope change or disconnection.
- **Every write request and its result,** including the period it landed in and the statement that proved it, so a participant's missed deferral is traceable to a late write, a failed job or a plan limit.
- **Sync history with retrieved-at times,** so any figure the consumer reported can be tied to the data's age.
- **Access to the copied data,** especially SSN and bank scopes ([Log Access, Not Just Changes](/docs/building-blocks/audit-trails#log-access-not-just-changes)).
- **Deletion on disconnect,** with the date and the retention rule applied.

## What This Means for the System You Build

- **Request the narrowest scope per feature,** and run a new consent to widen it.
- **Branch on connection type.** Automated and assisted connections differ by days in reads and writes; build alarms and promises per type.
- **Store the data's age with the data,** and compute every derived figure from the oldest input it used.
- **Treat writes as jobs that end in a verified read,** with the submit-by time computed from the pay period close and the connection's lead time.
- **Send full configurations, not deltas,** where the vendor overwrites.
- **Assume events get dropped;** reconcile on a schedule against the vendor's IDs.
- **Keep tokens on the backend, surface broken connections to the employer fast,** and purge copied data on disconnect.

## References

**Vendor documentation**

- [Finch: Documentation index](https://developer.tryfinch.com/llms.txt), 250+ integrations, products, Finch Connect, the SSN scope, reauthentication and webhooks
- [Finch: Integration types](https://developer.tryfinch.com/integrations/integration-types.md), automated and assisted integrations, credentials, read and write latency, and configuration periods
- [Finch: Data syncs](https://developer.tryfinch.com/developer-resources/Data-Syncs.md), the initial two-year sync, cadence, freshness headers and per-entity syncs
- [Finch: Write data](https://developer.tryfinch.com/implementation-guide/API-Calls/Write-Data.md), company and individual deductions, overwriting enrollments, jobs and statuses, no automatic retries, and submission lead times before a period closes
- [Finch: Webhooks](https://developer.tryfinch.com/developer-resources/Webhooks.md), event types, signature headers and verification, and the retry schedule
- [Finch: Backend security](https://developer.tryfinch.com/implementation-guide/Backend-Application/Backend-Security.md), storing access tokens on the backend
- [Merge: HRIS overview](https://docs.merge.dev/hris/overview/), sync frequency tiers, the account token header and regional tenants
- [Merge: Documentation index](https://docs.merge.dev/merge-unified/llms.txt), common models, linked account issues, field mapping and passthrough
- [Merge: Sync frequency](https://docs.merge.dev/merge-unified/hris/merge-api-basics/sync-frequency.md), the definition of sync frequency and sync credits
- [Merge: Webhooks](https://docs.merge.dev/merge-unified/reading-data/webhooks/merge-webhooks.md), event types and the `X-Merge-Webhook-Signature` header
- [Merge: Writes](https://docs.merge.dev/merge-unified/writing-data/writes/introduction.md), POST and PATCH support, request structure, warnings and errors
- [Apideck: HRIS API](https://developers.apideck.com/apis/hris/reference), resources and which support writes
- [Kombo: Introduction](https://docs.kombo.dev/), the unified HRIS API
