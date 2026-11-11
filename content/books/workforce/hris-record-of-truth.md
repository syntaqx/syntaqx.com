+++
title = "The HRIS as Record of Truth"
nav_title = "HRIS Record of Truth"
description = "The employee record and its history: effective dating, future-dated changes, corrections, positions, org units, and joiner, mover and leaver events to payroll."
category = "Workforce Industry"
order = 2635
part = "Hiring and HR Records"
tags = ["hris", "hr", "effective-dating", "position-management", "integrations", "data-model"]
+++

Every payroll, benefits enrollment, identity account and headcount report starts from the same question: who works here, in what job, at what pay, reporting to whom, as of which date. The human resources information system (HRIS) is where an employer answers it. Payroll reads the answer every period, the benefits platform reads it to decide eligibility, the identity provider reads it to create and disable accounts, and finance reads it to plan headcount. When the HRIS and payroll are one product, the answer is shared; when they are separate, every change has to cross an integration before a cutoff, and the two systems have to agree afterward on what was true.

The hard part is time. A raise approved on November 20 can be effective November 9, inside a period already paid. A transfer can be entered in October to take effect January 1. A termination can be keyed with the wrong date and corrected a week later, after payroll, benefits and identity have all acted on it. Each of those is a different operation: a change that takes effect later, a change that took effect earlier, and a correction of what the record said. An HRIS that stores only "the current value" can't tell them apart, and every downstream system inherits the confusion. This chapter covers the employee record and its history, effective dating and future-dated changes, positions and org structures, joiner, mover and leaver events to downstream systems, and the HRIS-to-payroll integration. The generic pattern is the playbook's [Temporal Data](/docs/database/temporal-data); this chapter is what HR adds to it.

## How the Platforms Do It

What HRIS and HCM vendors publish about history, effective dates and change events, as of November 2026:

| Platform | Record model | History and effective dating | Change events |
| --- | --- | --- | --- |
| **BambooHR** | Employees with fields, plus tabular datasets per employee "(e.g., jobInfo, compensation, customTabularField)" | Job and compensation history live as rows in those tables | Webhooks that "monitor a predefined set of fields," signed with an `X-BambooHR-Signature` HMAC SHA-256 header, retried "up to 5 times," and possibly batching several employees in one POST |
| **HiBob** | People with work, employment, lifecycle, salary and variable pay history tables | The work table's entries are keyed by "the site and effective date"; variable pay "is a multi-current history table" | Lifecycle webhooks such as `employee.joined` are "triggered automatically at midnight on the effective date" in the site's time zone, with a payload that carries only the employee id |
| **Oracle HCM Cloud** | Date-effective objects: "one or more physical or change records, each of which has an effective start date and may have an effective end date" | The REST API takes an `Effective-Of` header with a `RangeMode` of `UPDATE` (which splits rows in the range) or `CORRECTION` (which rewrites a range), and supports several changes on one day as sequenced rows | Retrieval of "past or future" worker details by effective date |
| **Paylocity** | A developer portal for "3rd party integrators" with WebLink, Webhooks and Partner Onboarding APIs | Not described on the public portal | Webhooks API listed |
| **Personio** | v2 persons with employments nested under them, "with the most recent employments appearing first," and compensations | Not described publicly | Webhooks management API, with a 7-day grace window when a signing secret is rotated |
| **Rippling** | A worker "represents the period of work for a user," and "one user has multiple worker records if they have been re-hired" | Each change carries `effective_on` ("past, present, or future") and `applied_on` ("When Rippling saved or approved the record") | Partner webhooks `employee.hired` and `employee.terminated`; the change feed warns that filtering by `effective_on` "will not include changes scheduled at a future date" |
| **UKG** | Pro HCM, Pro WFM and Ready on one developer portal | Not described on the portal's landing pages | Webhooks: "Modern, event-driven notifications for changes related to UKG data" |
| **Workday** | Web services including Human_Resources, Staffing, Compensation and Payroll, at "v47.1 (2026R2)"; Staffing's `Hire_Employee` "Hires a pre-hire (new or existing) into an employee position, headcount, or job," and its position reference applies only in a position management organization (under job management "Workday ignores" it) | `Change_Job`'s `Effective_Date` is "The Effective Date of the staffing action. Must be on or after the latest date that the worker's position was changed," and a hire date "must be on or after the effective date of any changes to the position or location" | The Staffing service exposes "Human Capital Management Business Services and data"; each operation runs the business process of the same name |


Three things stand out. Rippling's split of `effective_on` from `applied_on` and Oracle's split of `UPDATE` from `CORRECTION` are the same idea in two vocabularies: a record has the time a fact is true and the time the system learned it, and the two must be kept apart (the playbook's [Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)). HiBob and Rippling show the two ways to announce a future change: fire the event when the change becomes effective, or fire it when it is recorded and let the consumer schedule it; a consumer that only polls by effective date misses future-dated changes entirely, which is Rippling's own warning. And Rippling's worker-per-stint model is the core model's `employments`: a rehire is a new row on the same person, not a reactivated one. Workday does not publish its operation-level documentation openly, so its model is described here only at the level of its service list.

## The Employee Record

The record an HRIS keeps is wider than what payroll needs and narrower than what HR would like. The core model splits it into the person, the worker, the employment and the job assignment ([The Core Data Model](/books/workforce/workforce-business#the-core-data-model)), and the split matters here more than anywhere:

- **Person.** Legal name, the tokenized SSN or ITIN, date of birth and home address history (`persons`, `person_addresses`). A person exists once across every employer in a company and across rehires. Preferred names, pronouns and emergency contacts are HR fields on the person; the legal name stays as on the Social Security card because the W-2 and the I-9 need it.
- **Worker.** The person at one employer (`workers`), with the worker number, the type (employee or contractor) and a status. A transfer between two EINs in the same company is two workers, because each EIN files its own returns.
- **Employment.** One stint from hire to termination (`employments`), with the original hire date that service-based benefits and seniority count from. A rehire is a new employment.
- **Job assignment.** What the employment is, over time (`job_assignments`): title, department, manager, work location, FLSA status, pay basis and standard hours, each row effective-dated. Pay rates hang off the assignment (`pay_rates`).

What is not on the record matters too. Medical information, I-9 documents, background check reports and EEO self-identification have their own homes with their own access rules ([Employee Records, Privacy & Retention](/books/workforce/employee-records-and-privacy) covers why), and the HRIS should link to them, not copy them into the employee's main profile.

## Effective Dating and Future-Dated Changes

Every field a calculation or an eligibility rule reads is effective-dated: one closed-open `valid_during DATERANGE` column per row, never overwritten ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)). Four operations follow, and an HRIS has to support each one explicitly because they mean different things downstream:

| Operation | What happened | What the rows do | What downstream must do |
| --- | --- | --- | --- |
| **Change, effective now** | A raise approved today, effective today | Close the current row at today; open a new row from today | Payroll uses the new rate from today |
| **Change, effective in the future** | A transfer approved in October, effective January 1 | Close the current row at January 1; open the new row from January 1; nothing visible changes until then | Payroll, benefits and identity learn now and act on the date |
| **Change, effective in the past** | A raise approved November 20, effective November 9 | Close the row at November 9; open the new row from November 9 | Payroll computes retro pay for paid periods after November 9 |
| **Correction** | The record was wrong: the raise was keyed as $25.00 instead of $25.50 | Replace the value for its range, keeping the wrong row in history with when it was recorded and replaced | Downstream recomputes anything that read the wrong value, and the audit shows both |

The difference between the third and fourth rows is the one most systems lose. A backdated change says the business decided something late; a correction says the record was wrong. Both reach back in time, but a correction may also mean a W-2 was wrong, a benefits eligibility decision was made on bad data, or an access grant should never have happened, and an auditor will want to see what the record said on the day payroll ran. That is why the core model's `audit_events` carries before and after values on every effective-dated table, and why the playbook keeps [recorded time](/docs/database/temporal-data#recorded-time-and-corrections) separately from effective time. Oracle's API makes the two explicit (`RangeMode=UPDATE` splits a range, `RangeMode=CORRECTION` rewrites it); Rippling exposes both clocks on every change (`effective_on`, `applied_on`).

Future-dated changes are scheduled, not pending. The row already exists with its range, and an as-of query on any date returns the right answer without a job having to "apply" it ([Scheduling Future Changes](/docs/database/temporal-data#scheduling-future-changes)). What does need a schedule is the announcement: a downstream system that acts on effective events needs to hear on the day, and one that plans needs to hear on the day the change was recorded. My default is to emit both: a `worker_change.recorded` event when the change is saved and a `worker_change.effective` event when its date arrives, each carrying the effective date, so a consumer can pick the one it needs and neither has to poll.

### Worked Numbers: A Raise Inside a Paid Period

The numbers are invented. An hourly employee earns $24.00 an hour on a biweekly schedule; the period runs Sunday, November 1 through Saturday, November 14, 2026, with a check date of Friday, November 20. The employee works 40 hours in each week. On Monday, November 23, after the run is paid, the manager enters a raise to $25.50 effective Monday, November 9.

| Week | Hours | Rate as paid | Paid | Rate as now known | Owed | Difference |
| --- | --- | --- | --- | --- | --- | --- |
| Nov 1 to 7 | 40 | $24.00 | $960.00 | $24.00 | $960.00 | $0.00 |
| Nov 8 to 14 | 40 | $24.00 | $960.00 | $25.50 | $1,020.00 | $60.00 |

The HRIS change closes the $24.00 `pay_rates` row at November 9 and opens a $25.50 row from November 9. Payroll re-reads the paid period as of the new data, finds $60.00 more owed, and pays it on the next run as a retro earning with the work period it belongs to; overtime weeks would also need their regular rate recomputed. [Retro Pay, Voids & Corrections](/books/workforce/retro-pay-voids-and-corrections) covers the calculation. Had the same change been entered on November 6, before the run, it would have been a future-dated change, and the run would have paid $1,980.00 the first time.

A salaried change inside a period is a proration policy. An invented employee moves from $78,000 to $83,200 a year effective Monday, November 9, in the same period. At $3,000.00 and $3,200.00 per biweekly period, a calendar-day proration over the 14 days gives 8 days at the old salary and 6 at the new: $3,000.00 x 8 / 14 + $3,200.00 x 6 / 14 = $1,714.29 + $1,371.43 = $3,085.72, rounding each part to the cent (my arithmetic). A working-day proration over the period's 10 weekdays gives 5 old and 5 new: $1,500.00 + $1,600.00 = $3,100.00. Both are defensible; which one the employer uses is a rule, effective-dated like any other, and the statement should say which one produced the amount.

## Positions and Org Structures

HR systems model the organization in two ways, and many support both.

**Job management.** The worker is the anchor. A job assignment has a title, department and manager, and the organization is whatever the assignments add up to. Hiring needs only a requisition, and a reorganization is a batch of assignment changes. It suits small and fast-changing employers.

**Position management.** The position is the anchor: a seat in the organization that exists whether or not anyone fills it, with its own job code, department, cost center, location, FTE, pay grade and budget. A worker fills a position; a vacancy is a position with no incumbent; a requisition is a request to fill one. Finance can plan headcount by position before anyone is hired, and an EEO-1 job category, a pay range for a posting and an FLSA classification can be set on the job the position belongs to rather than on each person. Public employers and large enterprises use it because their budgets are by position.

Either way, the structures are effective-dated too. An org unit (a department, cost center, division or legal entity grouping) has a parent and a range; a reorganization on January 1 closes the old parent link and opens a new one, and a headcount report as of December 31 must still show the old tree. Manager relationships are the most-read part of the structure (approvals, access reviews, org charts) and the most fragile: when a manager leaves, every report's assignment needs a new manager on the same effective date, or approvals route to a terminated person.

Two rules keep the structures usable downstream. **Codes, not names.** Payroll and the general ledger key on cost center and department codes; a renamed department keeps its code, and a split creates new codes with ranges. **Job architecture drives compliance.** Pay ranges, EEO categories, FLSA status defaults and pay equity comparison groups hang off the job (family, level, code), which is why [Pay Transparency, Pay Equity & EEO-1](/books/workforce/pay-transparency-and-equity) depends on a clean job catalog more than on anything in the employee's own record.

## Joiner, Mover and Leaver Events

Workplace & Collaboration covers what identity systems do with HR events ([Joiner, Mover, Leaver](/books/workplace-and-collaboration/provisioning-and-scim#joiner-mover-leaver)): creating an account before the start date, swapping groups on a transfer, and revoking everything at a termination. From the HRIS side, the job is to emit events that are complete, ordered per worker and honest about time.

| Event | Typical trigger | Who consumes it | What they need in it |
| --- | --- | --- | --- |
| **Hire** | An accepted offer handed from the ATS, or an HR entry | Payroll, benefits, identity, onboarding (I-9, new hire report) | Person, employer, start date, job, location, pay, FLSA status, manager |
| **Rehire** | A returning former employee | The same, plus continuity rules | The prior employment and worker ids, so year-to-date and wage bases continue |
| **Transfer or promotion** | A change of job, manager, location or employer | Payroll (rate, tax location), benefits (eligibility class), identity (groups) | Effective date, old and new values |
| **Pay change** | A raise, a pay basis change | Payroll, compensation planning | Effective date, earning code, old and new rate |
| **Leave start and return** | A leave case approved | Payroll (pay status), benefits (premium arrears), time | Leave type, dates, paid or unpaid |
| **Termination** | A resignation, discharge, layoff, death | Payroll (final pay), benefits (end dates, COBRA), identity (revocation) | Termination date, last day worked, reason, rehire eligibility |
| **Rescind or correct** | A cancelled hire or a wrong date | Everyone who acted on the original | The event it reverses or corrects |

The rehire case is where the core model's split pays off. A rehire is a new `employments` row on the existing `workers` row, so the Social Security wage base and year-to-date accumulators continue ([Successor Employers and Wage Base Transfers](/books/workforce/fica-futa-and-suta#successor-employers-and-wage-base-transfers) covers the cases where they cross employers). Rippling models the same thing, one user with several worker records; Workplace & Collaboration notes that Microsoft's Workday connector re-enables the existing directory account when the old employee id comes back. Federal new hire reporting treats a returning employee as newly hired when they were separated "for at least 60 consecutive days" ([Onboarding: I-9, E-Verify & New Hire Reporting](/books/workforce/onboarding-i9-and-new-hires) covers the rest).

The rescind case is where most integrations break. An offer accepted, a hire event sent, an account created and a W-4 collected, and then the candidate doesn't start. The HRIS needs a rescind event that points at the hire, and each consumer needs to undo what it did: payroll removes a worker who was never paid, identity deletes an account never used, benefits cancels an enrollment that never started. A termination with a termination date equal to the hire date is not the same thing, because it produces a W-2-shaped worker with no wages and a separation in every report.

## HRIS-to-Payroll Integration

When the HRIS and payroll are separate products, the integration is the most consequential thing either vendor builds. Three shapes exist:

- **One product.** HCM suites run HR and payroll on one record. There is no integration to fail, only the effective-dating rules inside one database.
- **Event or API sync.** The HRIS emits changes and the payroll system applies them, or payroll polls a change feed. HiBob's lifecycle webhooks fire on the effective date; Rippling's change feed is filtered by `applied_on` to catch future-dated changes; BambooHR's webhooks may batch several employees in one request. Unified HR APIs sit in this layer for many systems at once ([Unified HR & Payroll APIs](/books/workforce/unified-hr-apis) covers them).
- **File.** A scheduled export from the HRIS, a mapping step and an import into payroll, usually before each run. Still common between an enterprise HRIS and a separate payroll or a PEO.

Whatever the shape, the same rules make it reliable:

- **Cutoffs are part of the contract.** A change effective in the current period must reach payroll before the run's approval deadline, or it becomes retro pay. The integration should report, per run, which changes arrived late and what they will cost.
- **Codes map once, centrally.** HR job codes, departments and earning types map to payroll's earning codes, cost centers and work locations in one table with effective dates, and an unmapped value stops the change with an error, never a default.
- **Payroll owns pay data after the run.** The HRIS owns the job, pay rate and status; payroll owns the statements, year-to-date and tax elections it computed with. Writing payroll results back into the HRIS (as some suites do for display) is a copy, not a second source.
- **Every change is idempotent and ordered per worker.** A webhook retried five times must apply once ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)), and a transfer and a pay change on the same day must apply in a stable order ([Ordering](/docs/architecture/events#ordering)). Several changes on one day are real (Oracle models them as sequenced rows), so the order key is the effective date plus a sequence, not a timestamp alone.
- **Reconcile, don't trust.** A daily comparison of active workers, rates, locations and statuses between the HRIS and payroll catches the change that never arrived. A worker active in payroll and terminated in the HRIS is overpaid; the reverse is unpaid.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `workers`, `employments` and `job_assignments` already exist; this chapter adds positions and org units, the change events every downstream system reads, and the delivery record per consumer.

```sql
CREATE TABLE org_units (                   -- departments, cost centers, divisions, over time
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  kind                TEXT NOT NULL CHECK (kind IN ('department', 'cost_center', 'division',
                        'location_group', 'other')),
  code                TEXT NOT NULL,         -- stable; payroll and the GL key on it
  name                TEXT NOT NULL,
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (company_id WITH =, kind WITH =, code WITH =, valid_during WITH &&)
);

CREATE TABLE org_unit_parents (            -- the tree, effective-dated, so old trees replay
  org_unit_id         UUID NOT NULL REFERENCES org_units (id),
  parent_org_unit_id  UUID NOT NULL REFERENCES org_units (id),
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (org_unit_id WITH =, valid_during WITH &&),
  CHECK (org_unit_id <> parent_org_unit_id)
);

CREATE TABLE positions (                   -- a seat that exists with or without an incumbent
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  position_number     TEXT NOT NULL,
  job_code            TEXT NOT NULL,         -- the job catalog: family, level, EEO category
  org_unit_id         UUID NOT NULL REFERENCES org_units (id),
  work_location_id    UUID REFERENCES work_locations (id),
  fte                 NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
  flsa_status_default TEXT CHECK (flsa_status_default IN ('exempt', 'nonexempt')),
  status              TEXT NOT NULL CHECK (status IN ('proposed', 'approved', 'frozen',
                        'eliminated')),
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (employer_id WITH =, position_number WITH =, valid_during WITH &&)
);

ALTER TABLE job_assignments
  ADD COLUMN position_id UUID REFERENCES positions (id),   -- null under job management
  ADD COLUMN org_unit_id UUID REFERENCES org_units (id),
  ADD COLUMN job_code    TEXT,
  ADD COLUMN change_sequence SMALLINT NOT NULL DEFAULT 0,  -- several changes on one day
  -- EXCLUDE has no concurrent build: add it while the table is small, or in a maintenance window.
  ADD CONSTRAINT job_assignments_no_overlap EXCLUDE USING GIST (
    employment_id WITH =, valid_during WITH &&) WHERE (is_primary);

ALTER TABLE employments
  ADD COLUMN last_day_worked  DATE,          -- can precede the termination date
  ADD COLUMN rehire_eligible  BOOLEAN,
  ADD COLUMN prior_employment_id UUID REFERENCES employments (id);

CREATE TABLE worker_change_events (        -- every joiner, mover and leaver fact, append-only
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  employment_id       UUID REFERENCES employments (id),
  event_type          TEXT NOT NULL CHECK (event_type IN ('hire', 'rehire', 'transfer',
                        'promotion', 'pay_change', 'manager_change', 'location_change',
                        'leave_start', 'leave_return', 'termination', 'rescind', 'correction')),
  effective_on        DATE NOT NULL,         -- when it is true
  sequence            SMALLINT NOT NULL DEFAULT 0,
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- when the HRIS learned it
  source              TEXT NOT NULL CHECK (source IN ('hris_ui', 'ats', 'import', 'api',
                        'self_service', 'system')),
  actor               TEXT NOT NULL,
  changes             JSONB NOT NULL,        -- table, row, field, before, after
  reverses_event_id   UUID REFERENCES worker_change_events (id),   -- rescind and correction
  idempotency_key     TEXT NOT NULL,
  UNIQUE (company_id, idempotency_key),
  CHECK ((event_type IN ('rescind', 'correction')) = (reverses_event_id IS NOT NULL))
);

CREATE INDEX worker_change_events_order
  ON worker_change_events (worker_id, effective_on, sequence, recorded_at);

CREATE TABLE downstream_syncs (            -- one row per event per consumer
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_change_event_id UUID NOT NULL REFERENCES worker_change_events (id),
  target              TEXT NOT NULL CHECK (target IN ('payroll', 'benefits', 'identity',
                        'time', 'onboarding', 'unified_api', 'other')),
  target_ref          TEXT,                  -- the connector or partner
  deliver_on          DATE NOT NULL,         -- recorded date or effective date, per target
  status              TEXT NOT NULL CHECK (status IN ('scheduled', 'sent', 'acknowledged',
                        'failed', 'skipped', 'superseded')),
  attempts            SMALLINT NOT NULL DEFAULT 0,
  last_error          TEXT,
  acknowledged_at     TIMESTAMPTZ,
  missed_cutoff_pay_run_id UUID REFERENCES pay_runs (id),   -- arrived after a run's deadline
  UNIQUE (worker_change_event_id, target, target_ref)
);
```

An as-of query is the same shape everywhere: the assignment, rate and org unit whose ranges contain the date. "Who reported to this manager on December 31, 2026, in which cost center" reads:

```sql
SELECT ja.employment_id, ja.title, ou.code AS cost_center
FROM job_assignments ja
JOIN org_units ou ON ou.id = ja.org_unit_id AND ou.valid_during @> DATE '2026-12-31'
WHERE ja.manager_worker_id = $1
  AND ja.is_primary
  AND ja.valid_during @> DATE '2026-12-31';
```

Design notes:

- **The change event is the integration contract.** Payroll, benefits and identity each read `worker_change_events` through their own `downstream_syncs` rows, never the HRIS tables directly, so a consumer can be replayed from any point and a new consumer can be backfilled ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).
- **Two clocks on every event.** `effective_on` and `recorded_at` are both required, and `deliver_on` picks one per target: identity usually wants the effective date, payroll wants the recorded date so it can plan the run and flag retro.
- **Corrections point at what they correct.** A `correction` or `rescind` event carries `reverses_event_id`, so each consumer can find what it did and undo or redo it, and the audit shows both values.
- **Late changes are measured.** `missed_cutoff_pay_run_id` records which run a change missed, which is the number an employer needs to fix its process (and the number a provider needs to price its retro work).
- **Map with the neighbors.** A hire event becomes an identity provider's account creation and, through SCIM, a `members` row in a collaboration product ([How to Build It](/books/workplace-and-collaboration/provisioning-and-scim#how-to-build-it)); the HRIS `worker_id` is the `employeeNumber` or `externalId` that ties them together.

## Auditing

The HRIS record is what an employer shows a wage-hour investigator, an EEOC charge, a benefits auditor and its own SOC 1 auditor. Keep:

- **Every effective-dated value with both clocks.** What was true on each date and what the record said on each date, so a payroll that ran on bad data can be explained as well as corrected.
- **Every change with its actor, source and reason,** including imports and integrations, in `audit_events`.
- **Every change event and its delivery per consumer,** with acknowledgments and failures, so "did payroll get the termination before the run" is a query.
- **Approvals.** Who approved each hire, pay change and termination, because segregation of duties over pay changes is a payroll control ([Controls, Audits & SOC 1](/books/workforce/controls-audits-and-soc1) covers them).
- **Org structures as of each date,** so a headcount, an EEO-1 snapshot or a WARN count can be reproduced for a past date.

The mechanics (append-only history, typed actors, tamper evidence) are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Effective-date every field a calculation or rule reads,** with one closed-open range per row, and keep recorded time separately so a correction is distinguishable from a backdated change.
- **Model change, future change, backdated change and correction as four operations,** and tell every consumer which one happened.
- **Emit events when a change is recorded and when it takes effect,** so no consumer has to poll for future-dated changes.
- **Keep person, worker and employment apart,** so a rehire continues year-to-date totals and a transfer between EINs is two workers.
- **Give rescinds and corrections their own events** that point at the event they reverse.
- **Map HR codes to payroll codes once, with dates, and fail on unmapped values.**
- **Treat the payroll cutoff as part of the integration,** and report every change that missed it.
- **Reconcile HRIS and payroll daily** on status, rate, location and manager.

## References

**Law and regulation**

- [42 USC 653a](https://www.law.cornell.edu/uscode/text/42/653a), a returning employee separated for at least 60 consecutive days is a newly hired employee for new hire reporting

**Vendor documentation**

- [BambooHR: API reference](https://documentation.bamboohr.com/reference), tabular datasets such as jobInfo and compensation, and per-user API keys
- [BambooHR: Webhooks](https://documentation.bamboohr.com/docs/webhooks), monitored fields, permissioned webhooks, the HMAC SHA-256 signature header, five retries and batched posts
- [HiBob: Employee data API](https://apidocs.hibob.com/reference/employee-data-api/llms.txt), work, salary, lifecycle and variable pay history tables, and work entries keyed by site and effective date
- [HiBob: Employee joined webhook](https://apidocs.hibob.com/reference/post_webhook_employee-joined.md), lifecycle events fired at midnight on the effective date with an id-only payload
- [Oracle HCM Cloud: Manage date effective objects](https://docs.oracle.com/en/cloud/saas/human-resources/farws/Manage_Date_Effective_Objects.html), date effectivity, physical and logical records, and the Effective-Of header
- [Oracle HCM Cloud: Date effective update](https://docs.oracle.com/en/cloud/saas/human-resources/farws/Date_Effective_Update.html), RangeMode UPDATE, range splits and multiple changes per day
- [Oracle HCM Cloud: Date effective correction](https://docs.oracle.com/en/cloud/saas/human-resources/farws/Date_Effective_Correction.html), RangeMode CORRECTION
- [Paylocity: Developer portal](https://developer.paylocity.com/), the WebLink, Webhooks and Partner Onboarding APIs for third-party integrators
- [Personio: Developer hub](https://developer.personio.de/), v2 persons, nested employments, compensations, webhooks and secret rotation
- [Rippling: Data models](https://developer.rippling.com/documentation/rest-api/essentials/data-models.md), workers as periods of work and multiple worker records for rehires
- [Rippling: Worker changes](https://developer.rippling.com/documentation/rest-api/guides/worker-changes.md), effective_on and applied_on, and future-dated changes missing from effective-date filters
- [Rippling: Webhooks](https://developer.rippling.com/documentation/developer-portal/v2-guides/webhooks.md), employee.hired and employee.terminated
- [UKG: Developer portal](https://developer.ukg.com/), Pro HCM, Pro WFM, Ready and event-driven webhooks
- [Workday: Public web services](https://community.workday.com/sites/default/files/file-hosting/productionapi/index.html), the v47.1 service list including Human_Resources, Staffing, Compensation and Payroll
- [Workday: Hire_Employee (Staffing v44.2)](https://community.workday.com/sites/default/files/file-hosting/productionapi/Staffing/v44.2/Hire_Employee.html), hiring into a position, headcount or job, and position references under position versus job management
- [Workday: Change_Job (Staffing v44.2)](https://community.workday.com/sites/default/files/file-hosting/productionapi/Staffing/v44.2/Change_Job.html), the staffing action's Effective_Date rule
