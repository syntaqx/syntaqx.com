+++
title = "Workflows & State Machines"
nav_title = "Workflows"
description = "Business processes that outlive a request: explicit states guarded by the database, durable engines vs a jobs table, sagas, timers and human approvals."
category = "Building Blocks"
order = 455
tags = ["architecture", "workflows", "state-machines", "sagas", "postgres", "temporal"]
+++

An order that ships in three parcels, a refund over a limit that needs a manager, a new account that has to pass a credit check, sign a contract and get provisioned in two other systems, a claim that waits nine days for a document: each is a business process that starts with one request and finishes days or weeks later, after several systems and people have each done their part. No HTTP request lives that long, no database transaction should, and no single service owns every step.

These processes fail in a recognizable way. The status is a free-text column any code path can set to anything. Halfway through, step three fails and nobody knows what steps one and two already did. A deadline passes and nothing happens because the reminder lived in a cron job someone deleted. A deploy changes the steps and every instance already in flight breaks. Support can't answer "where is my request?" without an engineer reading logs.

My rule: **a long-running process is an explicit state machine whose transitions the database enforces, whose every step is idempotent, whose failures are compensated rather than rolled back, and whose current position anyone in support can read.** This chapter is how to build that, and when to reach for a workflow engine instead of building it.

## When a Process Is a Workflow

Most work isn't a workflow. A request that does its job in one transaction is a request. Work that runs once in the background and either succeeds or retries is a job ([Background Jobs](/docs/architecture/background-jobs#when-work-leaves-the-request)). A fact that something happened is an event ([Events & Messaging](/docs/architecture/events#commands-vs-events)).

It becomes a workflow when several of these are true:

- **It has more than one step, and the order matters.** Credit check before contract, contract before provisioning.
- **It waits.** On a person, a partner, a document, a payment settling, or a date.
- **It spans systems** that can't share a transaction: your database, a payment provider, a vendor's API, another team's service.
- **Partial completion is a real state** that someone has to see and act on.
- **Its rules change** while instances are running.

A single resource with a handful of states and no waiting (a draft that becomes published) needs a status column and the transition guard below, not an engine. Money objects are their own case with stricter rules ([Payment States](/docs/money/payment-states#explicit-state-machines)); this chapter covers the general process that might create one.

## Make the States Explicit

Every workflow instance has one current state from a closed list, and moves only along transitions on a closed list. Draw it before writing it:

![A workflow state machine. Submitted moves to in_review when assigned, in_review moves to fulfilling when approved, and fulfilling moves to completed when all steps are done; that path is accented. A self-loop on in_review reads deadline passed: remind, escalate. Dashed exits: in_review to rejected when rejected, fulfilling to compensating when a step fails, and compensating to reversed when undone. Completed, rejected and reversed are terminal states with double outlines.](/diagrams/workflow-states.svg "An approval workflow as a state machine. The deadline loops on the human step instead of leaving it, and a failure after approval compensates the steps already done rather than pretending they never happened.")

The drawing is the specification. Each box is a value of `state`, each arrow is a row in a transitions table, and anything not drawn is refused. Three habits keep it honest:

- **States are nouns for where the instance is,** not verbs for what last happened: `in_review`, not `reviewed`. An instance waiting on something has a state that says so (`awaiting_documents`), because "waiting" is the state support gets asked about most.
- **Terminal states are few and final.** `completed`, `rejected` and `reversed` never transition again. A reopened request is a new instance linked to the old one, so the history of the first stays true.
- **Failure has its own states.** `compensating` and `reversed` are as much part of the design as `completed`. A process whose failures are a `failed` flag beside a normal state has no plan for them.

### Guarded in the Database

A state machine enforced only by application code is enforced only by the code paths that remember to check. Imports, admin tools, a backfill script and the next service to touch the table all skip it. Put the closed lists in the database:

```sql
CREATE TABLE workflow_transitions (
  workflow_type TEXT NOT NULL,
  from_state    TEXT NOT NULL,
  to_state      TEXT NOT NULL,
  PRIMARY KEY (workflow_type, from_state, to_state)
);

CREATE TABLE workflow_instances (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  workflow_type       TEXT NOT NULL,
  definition_version  INTEGER NOT NULL,      -- which version of the steps this instance runs
  subject_type        TEXT NOT NULL,         -- 'order', 'refund', 'account'
  subject_id          UUID NOT NULL,
  state               TEXT NOT NULL,
  state_entered_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deadline_at         TIMESTAMPTZ,           -- next timer, if any
  context             JSONB NOT NULL DEFAULT '{}',  -- results of steps so far
  version             INTEGER NOT NULL DEFAULT 1,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workflow_instances_subject_key UNIQUE (tenant_id, workflow_type, subject_type, subject_id)
);

CREATE FUNCTION workflow_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.state IS DISTINCT FROM OLD.state AND NOT EXISTS (
       SELECT 1 FROM workflow_transitions t
        WHERE t.workflow_type = NEW.workflow_type
          AND t.from_state = OLD.state
          AND t.to_state = NEW.state) THEN
    RAISE EXCEPTION 'transition % -> % not allowed for %', OLD.state, NEW.state, NEW.workflow_type
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER workflow_instances_guard
  BEFORE UPDATE OF state ON workflow_instances
  FOR EACH ROW EXECUTE FUNCTION workflow_guard();
```

For a single resource with a fixed set of states, a `CHECK (state IN (...))` on the resource's own table plus the same trigger is enough. For a family of workflows, the transitions table is data: adding a state is an insert reviewed like code, and it's the same table the diagram is generated from or checked against in a test. The unique key on the subject means one live process per order, refund or account, so a double-submitted form can't start two.

### Transition History

The current state answers "where is it"; support, audits and disputes ask "how did it get there." Every transition writes a history row in the same transaction as the state change:

```sql
CREATE TABLE workflow_history (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  instance_id   UUID NOT NULL REFERENCES workflow_instances (id),
  workflow_type TEXT NOT NULL,
  from_state    TEXT NOT NULL,
  to_state      TEXT NOT NULL,
  actor_type    TEXT NOT NULL,     -- user, staff, system, partner, timer
  actor_id      TEXT,
  reason        TEXT,              -- 'approved', 'deadline passed', 'credit check declined'
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (workflow_type, from_state, to_state)
    REFERENCES workflow_transitions (workflow_type, from_state, to_state)
);
```

The foreign key means a history row can only describe an allowed transition. Rows are append-only. Typed actors (a timer is an actor, so is a partner's webhook) and what counts as a durable record are in [Audit Trails](/docs/building-blocks/audit-trails#typed-actors); the history table is the workflow's own copy, shaped for its screens.

### One Function Moves the State

All transitions go through one function that takes the state it expects to leave. The update is conditional on that state, so two workers racing on the same instance can't both move it, and the loser learns it lost instead of overwriting the winner ([Transactions & Concurrency](/docs/database/transactions-and-concurrency#optimistic-concurrency)):

```go tab="Go"
var ErrStale = errors.New("workflow: instance is no longer in the expected state")

type Actor struct {
	Type string // user, staff, system, partner, timer
	ID   string
}

// Transition moves an instance from one state to another inside tx and records
// why. The database trigger refuses transitions that aren't in the table.
func Transition(ctx context.Context, tx *sql.Tx, id, from, to string, deadline *time.Time, actor Actor, reason string) error {
	res, err := tx.ExecContext(ctx, `
		UPDATE workflow_instances
		   SET state = $3, state_entered_at = now(), deadline_at = $4, version = version + 1
		 WHERE id = $1 AND state = $2`, id, from, to, deadline)
	if err != nil {
		return err
	}
	if n, err := res.RowsAffected(); err != nil {
		return err
	} else if n == 0 {
		return ErrStale
	}
	_, err = tx.ExecContext(ctx, `
		INSERT INTO workflow_history (instance_id, workflow_type, from_state, to_state, actor_type, actor_id, reason)
		SELECT id, workflow_type, $2, $3, $4, $5, $6 FROM workflow_instances WHERE id = $1`,
		id, from, to, actor.Type, actor.ID, reason)
	return err
}
```

```rust tab="Rust"
#[derive(Debug, thiserror::Error)]
pub enum TransitionError {
    #[error("workflow: instance is no longer in the expected state")]
    Stale,
    #[error(transparent)]
    Db(#[from] sqlx::Error),
}

pub struct Actor<'a> {
    pub kind: &'a str, // user, staff, system, partner, timer
    pub id: Option<&'a str>,
}

/// Moves an instance from one state to another inside `tx` and records why.
/// The database trigger refuses transitions that aren't in the table.
pub async fn transition(
    tx: &mut sqlx::PgConnection,
    id: Uuid,
    from: &str,
    to: &str,
    deadline: Option<DateTime<Utc>>,
    actor: Actor<'_>,
    reason: &str,
) -> Result<(), TransitionError> {
    let moved = sqlx::query(
        "UPDATE workflow_instances
            SET state = $3, state_entered_at = now(), deadline_at = $4, version = version + 1
          WHERE id = $1 AND state = $2",
    )
    .bind(id).bind(from).bind(to).bind(deadline)
    .execute(&mut *tx)
    .await?;
    if moved.rows_affected() == 0 {
        return Err(TransitionError::Stale);
    }
    sqlx::query(
        "INSERT INTO workflow_history (instance_id, workflow_type, from_state, to_state, actor_type, actor_id, reason)
         SELECT id, workflow_type, $2, $3, $4, $5, $6 FROM workflow_instances WHERE id = $1",
    )
    .bind(id).bind(from).bind(to).bind(actor.kind).bind(actor.id).bind(reason)
    .execute(&mut *tx)
    .await?;
    Ok(())
}
```

`ErrStale` is a normal outcome, not an error page: reload the instance and decide again, or drop the work because someone else already did it. In the same transaction, write the outbox row for whatever should happen next (the next step's job, a notification, an event), so the state change and the work it triggers commit together ([Events & Messaging](/docs/architecture/events#the-transactional-outbox)).

## A Jobs Table, or a Workflow Engine

There are two credible ways to run the steps between states, and the choice is mostly about how much orchestration you're writing by hand.

**A jobs table plus the state column.** Each state that does work enqueues a job; the job does one step and calls `Transition` to the next state, which enqueues the next job. Waiting is a state with a `deadline_at`. Everything lives in your database, uses the queue you already run, and is queryable with SQL ([Background Jobs](/docs/architecture/background-jobs#queues-in-postgres-or-a-broker)).

**A durable execution engine.** The workflow is code (Temporal, Azure Durable Functions and others) or a declarative definition (AWS Step Functions), and the engine persists progress, replays it after a crash, runs timers, retries steps and keeps an execution history.

| | Jobs table + state column | Durable execution engine |
| --- | --- | --- |
| **What you build** | Step chaining, timers, retries per step, compensation bookkeeping, a support view | The workflow code or definition; the engine does the plumbing |
| **State lives** | In your tables, next to the business data | In the engine's history; your tables hold what you copy out |
| **Querying "all instances stuck in review"** | One SQL query | The engine's visibility API, or your own copy of the state |
| **Long waits and many timers** | A `deadline_at` column and a sweeper | Built in. Temporal timers can run from a second to years, and its docs say "a single Worker can await millions of Timers concurrently" |
| **Changing steps mid-flight** | Your versioning scheme (below) | The engine's versioning rules, which are strict |
| **Operations** | Nothing new | A cluster to run or a managed service to pay for, plus its SDK's constraints |

My default is **the jobs table and state column** for workflows of a few states with simple branching, which is most of them in a product, and an engine once the orchestration itself is the hard part: many steps with parallel branches, long waits on timers and signals, retries and compensation per step, and a team writing several such workflows. The tell is when the code starts growing its own scheduler, its own retry table and its own "resume from step N" logic; that's a workflow engine, written badly.

The engines' constraints are real and worth knowing before choosing:

- **Temporal** replays workflow code against its stored history after any restart, so workflow code must be deterministic: Temporal's docs say it must "make the same Workflow API calls in the same sequence, given the same input," and anything non-deterministic (API calls, database queries, the clock, randomness) belongs in Activities. An execution's history is capped at 51,200 events or 50 MB, with a warning at 10,240 events or 10 MB, and long-running workflows checkpoint with Continue-As-New, which starts a fresh run carrying the latest state.
- **AWS Step Functions** offers two types. Standard workflows run up to one year with exactly-once execution of each step (unless the definition adds retries) and keep execution history for 90 days after they close; Express workflows run up to five minutes, at-least-once when asynchronous. A Standard execution fails if its history reaches 25,000 events, and a task's input or output is capped at 256 KiB. The type can't be changed after the state machine is created.

Whichever runs the steps, **the business state still belongs in your database.** An engine's history is an execution log, retained for its own period and queryable through its own API. The order's status that customers, support, reports and other services read is a column you own, updated by the workflow as it goes.

## Every Step Is Idempotent

Every step will run more than once: a worker dies after the side effect and before recording it, a timeout fires on a call that actually succeeded, an engine retries. Even Step Functions' exactly-once Standard workflows retry a step when the definition says to, and an asynchronous Express workflow may run the whole execution more than once.

- **Derive an idempotency key from the instance and the step,** `{instance_id}:{step}` and never the attempt number, and send it with every external call that supports one ([Idempotency](/docs/requests/idempotency#idempotency-beyond-the-api)). A payment created with the key `wf_123:charge` is created once however many times the step runs.
- **Record the step's result before moving on,** in the instance's `context` or a steps table, in the same transaction as the transition. A rerun that finds the result skips the call.
- **Check before acting** when the other system has no idempotency key: look up whether the account, shipment or ticket already exists, by your reference stored on it, before creating it.
- **Retries per step have budgets and backoff,** and only for errors that are safe to retry ([Retries & Timeouts](/docs/architecture/retries-and-timeouts#what-is-safe-to-retry)). A step that exhausts its retries moves the instance to a state a person can see, not into a log line.

## Sagas, Not Distributed Transactions

A workflow that touches several systems can't commit them atomically. Two-phase commit across your database, a payment provider and a vendor's API isn't available, and where it is, it holds locks across systems for as long as the slowest participant takes. The alternative has a name from 1987: a **saga**, from Garcia-Molina and Salem's paper, which microservices.io summarizes as "a reliably coordinated sequence of local transactions." Each step commits on its own; if a later step fails, the completed steps "are undone by compensating transactions."

Compensation is not rollback. A refund doesn't erase a charge; it's a second, visible event, with its own fees, emails and ledger entries. Design it as such:

- **Write the compensation for each step when you write the step.** Reserve stock, release stock. Create the account, close the account. Charge the card, refund it. A step with no possible compensation is the irreversible one, and that dictates order.
- **Put the irreversible step last,** or as late as possible. Run everything that can fail and be undone (validation, holds, reservations, credit checks) before the step that can't be undone (shipping the parcel, sending the wire, publishing the filing). After it, the saga only moves forward, retrying until it completes.
- **Hold, then commit.** Many steps have a reversible first half: authorize then capture a payment, place a hold then confirm a booking ([Reservations & Holds](/docs/building-blocks/reservations-and-holds#confirming-a-hold-idempotently)). Do the holds early and the commits after the last check passes.
- **Compensations are steps too:** idempotent, retried, and recorded in history. A compensation that fails needs a state (`compensation_failed`) and a person, not a silent stop.
- **Expect anomalies, because there's no isolation.** Between a step and its compensation, other requests see the intermediate state: stock looks reserved, an account exists. microservices.io calls the lack of isolation the saga's main drawback and the fix "countermeasures," design that makes intermediate states safe: a `pending` flag other readers respect, reservations that expire, values that are only committed at the end.

**Orchestration or choreography.** A saga can be run by one orchestrator that tells each participant what to do next, or by participants reacting to each other's events. My default is orchestration: one place holds the state machine, the history and the compensation logic, and support has one thing to look at. Choreography fits a short chain between teams that already publish the right events; past three or four steps nobody can say what state the whole process is in without reading every service's logs.

## Timers, Deadlines and Escalations

Most of a workflow's life is waiting, and most of its bugs are about what happens when the wait ends.

- **A deadline is data on the instance,** computed when the state is entered and stored as an instant (`deadline_at`), not a sleep in a process or a cron expression in someone's head. Business deadlines ("respond within three business days") come from rules with effective dates, computed once and stored with the rule that produced them ([Rules as Data](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **A sweeper fires due timers.** It claims instances with `deadline_at <= now()` using `FOR UPDATE SKIP LOCKED`, and calls the same `Transition` function with the timer as actor. Because the transition is conditional on the state, a timer that fires after a person already acted finds the instance moved and does nothing. Engines give you this as durable timers; Temporal persists them so a workflow resumes after its Worker or the service comes back.
- **Escalation is a ladder, not one alarm.** First deadline: remind the assignee. Second: reassign or notify their manager. Final: take the default action the policy names (auto-approve below a limit, auto-reject, cancel and release). Each rung is a transition or a loop with its own reason in history, so "why was this auto-cancelled" has an answer.
- **The whole instance has a deadline too.** A workflow that can wait forever will. Give every non-terminal state a maximum age, and alert on instances past it.
- **Timers respect the calendar they mean.** "Remind at 9:00" is 9:00 in the assignee's zone; "three business days" skips the tenant's holidays ([Time & Date Formats](/docs/fundamentals/time#business-dates-business-days-and-holidays)).

## Human Steps

An approval, a review, a document check or a manual exception is a step like any other, with three differences: it's slow, it's done by someone who has to be allowed to do it, and its outcome is a decision that may be questioned later.

- **Model the human step as a task,** a row with the instance, the step, the assignee or queue, a due time and the possible outcomes. The task list is a query over tasks, not over workflow states, so one person's queue spans every workflow that needs them.
- **Decisions come back through the same transition function,** with the person as actor and their stated reason. The decision is conditional on the instance still being in the waiting state, which makes a double-click or two approvers racing harmless.
- **Check authority when the decision is made,** not when the task was assigned: roles change while tasks wait ([Authorization](/docs/security/authorization#where-checks-belong)). Separation of duties is a check too: the requester can't approve their own request, and a large enough amount needs two different approvers.
- **Engines resume on a callback.** Step Functions' callback pattern pauses a task until something returns its task token, explicitly for cases like "a human approval," and can wait until the execution's one-year limit; a `HeartbeatSeconds` value makes it fail with `States.Timeout` instead of waiting indefinitely. Temporal workflows wait on a signal. Either way the token or workflow ID stays server-side, behind your own endpoint that checks who's deciding.
- **Approval links in email are a convenience, not the control.** A one-click link signs a specific decision on a specific task, expires, and still requires the person to be signed in, or anyone the email is forwarded to can approve.

## Changing a Workflow While Instances Are in Flight

A workflow that runs for weeks will be changed while thousands of instances are halfway through it. Every change has to answer one question: what happens to the instances that started under the old rules?

- **Stamp each instance with its definition version** (`definition_version` above) when it starts. Code that runs a step branches on the version where behavior differs, and old branches are deleted once no live instance uses them, which a query can tell you.
- **Additive changes are safe:** a new state reachable only from new transitions, a new optional step for new instances. Removing or renaming a state that live instances occupy isn't; migrate those instances explicitly, one transition at a time with history rows that say "migrated," or let them drain first.
- **Engines enforce this more strictly.** Temporal says a workflow definition "can change in very limited ways once there is a Workflow Execution depending on it," because reordering or removing steps breaks replay with a non-determinism error; its docs call Worker Versioning "the recommended way to handle versioning," with patching (code that stays compatible across versions) as the alternative. Step Functions publishes numbered, immutable versions of a state machine and lets an execution start against a specific version or an alias.
- **Rules that change on a date are data,** not a new workflow version. A new approval limit or response deadline belongs in rules with effective dates, and each instance records which rule version decided ([Rules as Data](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Test the old path.** Keep a fixture instance per live definition version, and run it through the current code in CI. The bug that breaks in-flight instances never shows on a fresh one.

## Visibility for Support

A workflow is only as good as the answer to "where is my request, and why?" Build the screen before the first customer asks:

- **Per instance:** current state, how long it's been there, the deadline and what happens at it, who it's waiting on, and the full history with actors and reasons. Failed steps show the error a person can act on, not a stack trace.
- **Across instances:** counts by state and age, the oldest instance in each waiting state, instances past their deadline, and instances in failure states (`compensating`, `compensation_failed`, `needs_attention`). These are dashboards with alerts, like queue age for jobs ([Background Jobs](/docs/architecture/background-jobs#visibility-and-stuck-jobs)).
- **Safe manual actions:** retry a failed step, skip it with a reason, reassign a task, cancel and compensate. Each goes through `Transition`, needs a role, and lands in history with the staff actor; editing the `state` column by hand is exactly what the trigger exists to stop.
- **Engine executions link to your instance.** Use the instance ID as the engine's workflow ID or execution name, so support can go from the customer's request to the engine's history in one step, and remember the engine's retention: Step Functions drops Standard execution history 90 days after it closes, so anything you need longer is copied into your own history.

## Checklist

- A process with several steps, waits, other systems or partial completion is modeled as a workflow; anything simpler is a status column with a guard.
- States and transitions are closed lists in the database; a trigger refuses any other transition, from any code path.
- Every transition goes through one function that is conditional on the expected state, writes history with a typed actor and reason, and writes the outbox in the same transaction.
- A jobs table and state column by default; a durable execution engine when the orchestration itself is the hard part. The business state lives in your tables either way.
- Every step and every compensation is idempotent, keyed on the instance and the step.
- Multi-system processes are sagas: compensations written with the steps, holds early, the irreversible step last, and a visible state when compensation fails.
- Deadlines are stored instants fired by a sweeper or engine timer, escalate in rungs, and every non-terminal state has a maximum age.
- Human steps are tasks; decisions check authority at decision time and go through the transition function.
- Each instance records its definition version; changes are additive or migrate live instances explicitly; old paths are tested.
- Support can see every instance's state, history, deadline and failure, and act on it through audited actions.

## References

**Specifications**

- [Garcia-Molina and Salem: Sagas (SIGMOD 1987)](https://doi.org/10.1145/38713.38742), the paper that named the pattern of local transactions with compensating transactions

**Reference**

- [Temporal: Workflow Definition](https://docs.temporal.io/workflow-definition), deterministic constraints, replay against Event History, and the limited changes a definition allows once executions depend on it
- [Temporal: Workflow Execution limits](https://docs.temporal.io/workflow-execution/limits), the 51,200-event and 50 MB history limit and its warning thresholds
- [Temporal: Continue-As-New](https://docs.temporal.io/workflow-execution/continue-as-new), checkpointing a long-running workflow into a fresh history
- [Temporal: Timers and delays](https://docs.temporal.io/workflow-execution/timers-delays), durable timers from a second to years, persisted across restarts
- [AWS Step Functions: Choosing workflow type](https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html), Standard vs Express durations, execution semantics and history retention
- [AWS Step Functions: Service quotas](https://docs.aws.amazon.com/step-functions/latest/dg/service-quotas.html), the 25,000-event history limit, one-year maximum and 256 KiB payloads
- [AWS Step Functions: Service integration patterns](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html), the task-token callback for human approvals and heartbeat timeouts
- [AWS Step Functions: State machine versions](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-state-machine-version.html), numbered immutable versions and starting executions against one

**In practice**

- [microservices.io: Saga pattern](https://microservices.io/patterns/data/saga.html), compensating transactions, orchestration vs choreography, and countermeasures for the lack of isolation
