+++
title = "Background Jobs"
description = "Moving work out of the request: small idempotent jobs, retries with backoff and dead letters, scheduling without overlap, visibility, and shutting down cleanly."
category = "Architecture"
order = 403
tags = ["architecture", "jobs", "queues", "reliability"]
+++

A request should do what the user is waiting for and nothing else. Sending the receipt email, resizing the upload, syncing to the CRM and recalculating the report can all happen a moment later, somewhere the user isn't waiting on them. Background jobs are where that work goes, and they come with a contract that's easy to get wrong: they will run late, they will fail, and they will run more than once.

## When Work Leaves the Request

Move work to a job when:

- **The user doesn't need to wait for it.** A receipt email that takes 800 ms to send is 800 ms added to checkout for nothing.
- **It can fail and be retried.** A third-party API that's down shouldn't fail the user's request; a job can try again in a minute.
- **It's slow or bursty.** Exports, imports and fan-out to many recipients belong behind a queue that smooths them out, not in a request with a timeout.
- **Something rate-limits you.** A job queue can pace calls to a provider; a burst of requests can't.

Keep work in the request when the user genuinely needs the result to continue, or when doing it later would leave them looking at inconsistent state. For work the user is waiting on but that takes too long for one request, expose it as a [long-running operation](/docs/requests/long-running-operations) backed by a job.

## Job Design

**Small inputs.** Enqueue identifiers, not objects: `{ "invoice_id": "..." }`, then load the invoice inside the job. A job enqueued with a copy of the data acts on that copy even if the record changed while it waited in the queue. Sidekiq's guidance puts it simply: save simple identifiers, not state ([Sidekiq: Best Practices](https://github.com/sidekiq/sidekiq/wiki/Best-Practices)).

**Idempotent, always.** Every real queue delivers at least once: a worker can finish the work and crash before acknowledging it, and the job runs again. So running a job twice has to be harmless. Check whether the work is already done ("receipt already sent for this invoice"), use a unique constraint to make a duplicate insert fail, and pass an idempotency key derived from the job to any external API so a retried charge or email isn't repeated downstream ([Idempotency](/docs/payments/idempotency)).

**One unit of work per job.** "Email all 40,000 users" as one job means a failure at user 23,000 retries the first 23,000. Fan out: one job enqueues 40,000 small ones, or processes in batches it can resume.

## Enqueue Transactionally

The subtle bug: you insert an order and enqueue "send confirmation" in the same request. Enqueue before commit, and a fast worker may run before the order is visible, or the transaction rolls back and the job confirms an order that doesn't exist. Enqueue after commit, and a crash in between loses the job silently.

The fix is the same [transactional outbox](/docs/architecture/events) used for events: write the job into a table in the same transaction as the data. The job exists if and only if the data does, and a separate process moves it to the real queue. Brandur Leach's [Transactionally Staged Job Drains](https://brandur.org/job-drain) walks through the failure modes and the pattern. If the queue itself lives in Postgres, the insert is already transactional and the problem disappears.

## Retries and Dead Letters

- **Retry with exponential backoff and jitter,** so a dependency that's down for five minutes gets a handful of attempts rather than a flood ([Retries & Timeouts](/docs/architecture/retries-and-timeouts)).
- **Cap the attempts,** then move the job to a **dead-letter queue** with its error, instead of retrying forever ([SQS dead-letter queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html) is one concrete implementation).
- **Classify errors.** A 503 from a provider is worth retrying; a validation error will fail the same way every time, so retrying it only delays the alert.

A **poison job** is one that crashes the worker every time it runs, often taking other jobs down with it. Attempt caps are what stop it: after N failures it's parked in the dead-letter queue, alerted on, and inspected by a person, while the queue keeps moving. Dead letters are a to-do list with an owner, not a trash can.

## Queues in Postgres, or a Broker

You don't need a separate system to start. Postgres with `FOR UPDATE SKIP LOCKED` is a solid work queue: each worker claims the next unlocked row without blocking the others, and enqueueing is part of your normal transaction ([Transactions & Concurrency](/docs/database/transactions-and-concurrency)):

```sql
UPDATE jobs SET status = 'running', locked_at = now(), attempts = attempts + 1
WHERE id = (
  SELECT id FROM jobs
  WHERE status = 'pending' AND run_at <= now()
  ORDER BY run_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED
)
RETURNING *;
```

| | Postgres queue | Broker (SQS, RabbitMQ, Redis-based) |
| --- | --- | --- |
| Transactional enqueue | Free: same database | Needs an outbox |
| Throughput | Plenty for most products; every job is rows, writes and vacuum | Built for very high volume |
| Operations | Nothing new to run | Another system to run, monitor and secure |
| Features | You build scheduling, visibility, dead letters | Often built in |

Start in Postgres unless you already know you need the volume. Move to a broker when job traffic measurably competes with your application's queries, not before.

## Visibility and Stuck Jobs

A worker that crashes mid-job leaves it claimed forever unless something notices. Give every claimed job a deadline: a `locked_at` older than the job's timeout means the worker died, and a sweeper returns it to pending (SQS calls this the [visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html)). Set the timeout longer than the job should ever take, or a slow job gets picked up a second time while it's still running, which is one more reason jobs must be idempotent.

Then make the queue observable: queue depth, age of the oldest pending job, failure rate, and dead-letter count, with alerts on the ones that mean users are affected ([SLOs & Error Budgets](/docs/operations/slos)). "The oldest job is three hours old" is the earliest signal that something is wrong.

## Scheduling

Recurring jobs ("every night at 02:00") have their own failure modes:

- **Overlap.** A run that takes longer than the interval starts again before the last one finishes. Take a lock for the job's name (a [transaction-level advisory lock](/docs/database/transactions-and-concurrency) works) and skip the run if it's held.
- **Missed runs.** A deploy or outage at 02:00 means the run never happens. Decide per job whether to catch up or skip, and record the last successful run so you can tell.
- **Time zones.** "02:00" in a zone with daylight saving happens twice on one night a year and not at all on another. Schedule in UTC, or for local-time schedules use a library that handles the transitions deliberately ([Time & Date Formats](/docs/fundamentals/time)).
- **Make the scheduler enqueue, not execute.** The cron fires a job into the normal queue, so scheduled work gets the same retries, idempotency and visibility as everything else.

## Graceful Shutdown

Workers are restarted on every deploy. When asked to stop, a worker should stop claiming new jobs, let the current one finish within a deadline, and only then exit. Kubernetes, for example, sends `SIGTERM`, waits a grace period (30 seconds by default), then sends `SIGKILL` ([Pod lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)). A job longer than that grace period will be killed partway through, so either keep jobs shorter than it or make them resumable from checkpoints. Because jobs are idempotent and stuck jobs are reclaimed, a kill is a delay, not data loss.

## This Site

syntaqx.com has no job queue, because nothing it does needs to happen after a request. Its one scheduled job runs in CI rather than in the app: a weekly GitHub Actions workflow checks every link the playbook cites. It follows the same rules at small scale: a concurrency group so two runs never overlap, and one issue it updates or closes rather than a new one each week, so running it twice is harmless.

## References

**Reference**

- [PostgreSQL: SELECT, The Locking Clause](https://www.postgresql.org/docs/current/sql-select.html), SKIP LOCKED for queue-like tables
- [AWS: Amazon SQS dead-letter queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html), parking jobs that keep failing
- [AWS: Amazon SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html), reclaiming work from workers that die
- [Kubernetes: Pod Lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/), SIGTERM, the 30-second default grace period, then SIGKILL

**In practice**

- [Sidekiq: Best Practices](https://github.com/sidekiq/sidekiq/wiki/Best-Practices), small parameters and idempotent, at-least-once jobs
- [Brandur Leach: Transactionally Staged Job Drains in Postgres](https://brandur.org/job-drain), enqueueing jobs in the same transaction as the data
- [2ndQuadrant: What is SELECT SKIP LOCKED for in PostgreSQL 9.5?](https://www.2ndquadrant.com/en/blog/what-is-select-skip-locked-for-in-postgresql-9-5/), building a queue on Postgres
