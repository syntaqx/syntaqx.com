+++
title = "Audit Trails"
description = "Recording who did what, when and why: typed actors, before and after values, same-transaction capture, snapshots, tamper evidence, access logs and exports."
category = "Architecture"
order = 409
tags = ["architecture", "audit", "compliance", "security", "records"]
aliases = ["audit-trails", "audit-log"]
+++

Sooner or later someone asks a question about the past and won't take your word for the answer. A player says support took back the gems he paid for. An enterprise customer's security team asks who exported their user list last Tuesday. A bank examiner asks who reversed a fee and why. A homeowner says nobody came, and the card issuer deciding her dispute wants proof. Current state can't answer any of these: "the balance is 120" says nothing about how it got there, or who made it so. An audit trail can, if it was written at the time, by the system, in a form nobody could quietly change afterwards.

This chapter is how to build one: what each record holds, how to capture it so nothing slips past, how to make it tamper-evident, and how to hand it over. How long to keep it is in [Data Retention & Deletion](/docs/architecture/data-retention#retention-schedules-by-record-type).

## Not Logs, Not Events

Three things get called "the log", and they have different jobs.

| | Application logs | Events | Audit trail |
| --- | --- | --- | --- |
| For | Engineers debugging | Other systems reacting | Anyone proving what happened |
| Shape | Whatever helps diagnose | A versioned contract for consumers | Actor, action, before and after, reason |
| Complete? | Sampled, dropped under load | Only what's worth announcing | Every audited write, including denials |
| Kept | Days or weeks | Until delivered, then pruned | Years, by record type |
| Changeable | Rotated and deleted freely | Relayed and pruned | Never, short of a governed purge |

[Structured logs](/docs/observability/logs) are for diagnosis: they're sampled, rotated and deliberately free of sensitive data, which is exactly what an auditor can't accept. [Events](/docs/architecture/events) tell other systems what happened. The same transaction that changes a subscription may write `subscription.updated` to the [transactional outbox](/docs/architecture/events#the-transactional-outbox), but the outbox is a delivery queue: its rows are relayed and pruned, the relay can publish twice, and the event is shaped for consumers, often without before values or personal data. An audit trail built from the outbox has gaps exactly when delivery fails, and misses everything that isn't worth an event: a denied attempt, a read, an edit no other service cares about.

My rule: **events tell other systems what happened; the audit store proves it.** They can be written in the same transaction, and usually are, but they're separate tables with separate owners.

## What a Record Holds

The [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) organizes event attributes as when, where, who and what. An audit record needs those and two more:

- **Who:** the actor, typed (below).
- **What:** the action, the entity and its ID, and the **before and after** value of each changed field.
- **When:** when it happened and when the server recorded it. They differ for offline clients and queued work, and both matter.
- **Where:** the app and its version, the IP address, and for physical work the device and its location.
- **Why:** a reason code where the action needs one (a manual credit, a ban, a time edit, a price override), the ticket or case it came from, and the [request ID](/docs/observability/overview#request-ids) that ties it to every other record from the same action.
- **Under which rules:** the version of the policy, price list, terms or model that applied, because a decision is only explainable against the rules that made it.

A support agent compensating a player for a purchase that never arrived:

```json
{
  "id": "019a2f4c-8e31-7b02-a4d5-6c7e8f901a2b",
  "tenant_id": "0192f1d0-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
  "action": "wallet.grant",
  "entity": { "type": "wallet", "id": "019a2f4b-11c0-7e5a-8b3d-4c5d6e7f8091" },
  "actor": {
    "type": "staff",
    "id": "0198c3e2-7d4f-7a10-b2c3-d4e5f6a7b8c9",
    "on_behalf_of": null
  },
  "changes": { "gem_balance": { "before": 120, "after": 620 } },
  "reason": "purchase_not_delivered",
  "reference": { "type": "support_ticket", "id": "019a2f40-2b6e-7d91-a0b1-c2d3e4f5a6b7" },
  "policy_version": "goodwill-grants-2026-09",
  "request_id": "019a2f4c-8e2f-7c44-9d05-1e2f3a4b5c6d",
  "source": { "app": "support-console", "version": "3.8.1", "ip": "203.0.113.7" },
  "occurred_at": "2026-10-26T15:42:10Z",
  "recorded_at": "2026-10-26T15:42:10Z",
  "prev_hash": "sha256:9f2c41...",
  "hash": "sha256:4ab07d..."
}
```

IDs are [UUID v7](/docs/fundamentals/identifier-conventions), times are UTC [RFC 3339](/docs/fundamentals/time), field names follow the [JSON conventions](/docs/requests/json-conventions). Store `changes` as a structured diff, not a sentence, because you'll query it: "every grant over 1,000 gems by this agent this month" is a filter, not a regex. Never put secrets, tokens or card numbers in it ([Sensitive Data](/docs/payments/sensitive-data)), and keep personal data out where an ID will do, which matters again under [erasure](#privacy-erasure-and-the-audit-store).

### Typed Actors

"System" is not an actor. Every record names what kind of thing acted:

| Actor type | Example | Also record |
| --- | --- | --- |
| `user` | A customer, a player, an employee in your product | Session and authentication method |
| `staff` | Your support or operations team in internal tools | The ticket or reason for access |
| `api_client` | A customer's integration using an API key | Key ID and the app it belongs to |
| `service` | A scheduled job, a trigger rule, another internal service | Job name and run ID |
| `ai_agent` | A model acting through tools | Agent name, model version, prompt version, and the human who approved, if any |

Two cases need both identities. **Support acting for someone** ("log in as this customer") records the staff member as the actor and the customer in `on_behalf_of`, never the customer alone; [Support Access](/docs/security/support-access) covers the access rules around it. **Automation started by a person** (a bulk import, an approved AI draft) records the job or agent as the actor and the person who started or approved it. When a SaaS admin's bulk role change goes wrong, "service changed 4,000 users" is useless; "the import job run by this admin changed them" is an answer.

## Capturing It

| Approach | How it works | Strengths | Weaknesses |
| --- | --- | --- | --- |
| **Application entries** | Code writes an audit row alongside each business action | Carries intent: the action name, reason, actor, ticket | Only as complete as the code paths that remember to write it |
| **Database triggers** | A trigger copies old and new rows to a history table, as in PostgreSQL's [audit trigger example](https://www.postgresql.org/docs/current/plpgsql-trigger.html) | Nothing that writes the table can skip it, including a hand-run fix | Knows the row, not the intent; `current_user` is the app's database role, so the real actor must be passed in |
| **Change data capture** | A reader such as [Debezium](https://debezium.io/documentation/reference/stable/features.html) streams the database's log, including deletes and, depending on configuration, prior row state and the transaction ID | No application changes; can feed a separate audit store | Same blind spot on intent; another system to run ([Data Pipelines](/docs/architecture/data-pipelines#change-data-capture)) |
| **Event sourcing** | The [event log is the source of truth](https://martinfowler.com/eaaDev/EventSourcing.html) and current state is derived from it | The history is the system, intent in every event, any past state rebuildable | A large architectural commitment, with old event schemas to carry forever |

I default to two layers. **Application entries** are inserted in the **same transaction** as the change, so the change and its record commit together or not at all. Underneath, **row-level capture** (triggers or CDC) on the tables that matter catches anything the application forgot, including the direct database fix at 2 a.m. The two join on transaction ID, and a row change with no matching application entry is itself worth an alert.

```sql
BEGIN;
SET LOCAL app.actor_id = '0198c3e2-7d4f-7a10-b2c3-d4e5f6a7b8c9';  -- read by the row-level trigger
UPDATE subscriptions SET seat_limit = 50 WHERE id = $1;
INSERT INTO audit_entries (id, action, entity_type, entity_id, actor_type, actor_id,
                           changes, reason, request_id, occurred_at)
VALUES ($2, 'subscription.seat_limit_changed', 'subscription', $1, 'staff', $3,
        '{"seat_limit": {"before": 25, "after": 50}}', 'sales_approved_upgrade', $4, NOW());
INSERT INTO outbox_events (id, type, subject, payload, created_at)
VALUES ($5, 'subscription.updated', $1, $6, NOW());
COMMIT;
```

`SET LOCAL` scopes the actor to the transaction, the same technique [Multi-Tenancy](/docs/architecture/multi-tenancy#enforce-it-in-the-database) uses for the tenant, so a pooled connection can't leak one request's actor into the next.

Never write the audit entry after the commit from a background job. It works in testing and fails exactly when the system is struggling, which is when the history matters most.

Event sourcing pays for itself where the history *is* the product: the money [ledger](/docs/payments/payment-states#append-only-records), consent, agreements. Not everywhere.

**Offline clients** record their own audit entries with device time, a monotonic sequence number and, where it matters, location, and upload them as they happened, rather than the server inventing them at sync time. When the server rejects or merges a stale offline edit, that resolution is an audit entry too.

## Amend, Don't Overwrite

Records get corrected: a bank fee charged in error, a wrong ban, an order shipped to the wrong address. The question is how the change is kept.

- **Corrections are new versions or new entries.** The [ledger rule](/docs/payments/payment-states#append-only-records) generalizes: a reversed fee is a reversal plus a correct entry, not an edited amount. A lifted ban is an `unban` with its own actor and reason, not a deleted `ban`.
- **A decision that's reviewed gets a second decision.** A fraud reviewer approving a held payment adds a decision rather than overwriting the model's; a manager overturning a moderator does the same.
- **Seal what's final.** When a record reaches a final state (an order fulfilled, a claim settled, a month closed), store a hash over its canonical form. Later edits are amendments with a required reason, and the original stays readable.
- **Restrict who can amend what,** and make the restriction tighter as the record ages and matters more: a same-day note is easy, an edit on a billed or disputed record needs a manager.

## Snapshot What Changes Underneath You

A record that points at mutable data changes when the data does. An invoice line with a foreign key to the current price shows this year's price on last year's invoice. Snapshot at the moment of the fact:

- **Prices and rates:** the amount, discount and tax rate used, and the price list version.
- **Terms and documents:** the exact version a customer accepted, stored as the rendered file with a content hash.
- **Credentials and assignments:** the license, role or team in effect that day, so a renewal or a reorganization doesn't rewrite history.
- **Rules:** the policy or model version that made a decision.

Snapshots cost storage. Store each immutable version once, addressed by its hash, and reference the hash.

## Automated and AI Decisions

A decision made by code needs a better record than one made by a person, because nobody can be asked afterwards what they were thinking. A fraud decision records its score, the rules that matched and the model version ([Fraud & Risk](/books/payments/fraud-and-risk#auditable-decisions) has an example). A rate-limit block, an automatic account suspension or a matchmaking ban records the signal and threshold that triggered it.

AI agents add more, because they act through tools on a user's or the business's behalf:

```json
{
  "actor": {
    "type": "ai_agent",
    "agent": "billing-assistant",
    "model": "provider/model-2026-08",
    "prompt_version": "2026-10-20.3"
  },
  "conversation_id": "019a2f51-0c3d-7e4f-8a5b-6c7d8e9f0a1b",
  "tool_call": { "name": "issue_credit", "input_hash": "sha256:9b1f20...", "result": "denied" },
  "policy_checks": [{ "rule": "credit_within_agent_limit", "is_passed": false }],
  "approved_by_id": null,
  "entity": { "type": "invoice", "id": "019a2e88-4f1a-7b2c-9d3e-0f1a2b3c4d5e" },
  "occurred_at": "2026-10-26T16:03:27Z"
}
```

- **Which version acted,** so a behavior change traces to a prompt or model release.
- **Every tool call, including refusals.** A pattern of denials is how you find a bad prompt or a gap in what the tools allow.
- **Who approved,** and whether they edited the draft. An unreviewed AI draft and a human-confirmed record are different evidence.
- **The transcript,** linked from every record the conversation touched, kept as long as those records.

[AI & LLM Security](/docs/security/ai-security#agents-tools-and-mcp) covers keeping those tools narrow in the first place.

## Make It Tamper-Evident

An audit trail the business can edit is evidence of nothing. OWASP calls for tamper detection, copying logs to read-only media and monitoring access to them. Layer it:

1. **Append-only by permission.** The application's role can `INSERT` into audit tables, never `UPDATE` or `DELETE`. Only a separate retention job can purge, and only expired records under no hold.
2. **Hash chaining.** Each record stores the hash of the previous record in its partition (per tenant, per day), so altering or removing one breaks every hash after it. Publish each day's chain head somewhere the database's operators can't rewrite. When third parties must verify the log themselves, a Merkle-tree log in the style of [Certificate Transparency (RFC 6962)](https://www.rfc-editor.org/rfc/rfc6962) adds inclusion proofs (this record is in the log) and consistency proofs (the log has only been appended to).
3. **Write-once storage.** Ship sealed partitions to WORM storage. [S3 Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html) has *compliance* mode, where no user, including the account's root user, can delete a locked version or shorten its retention, *governance* mode, which users with a bypass permission can override, and legal holds that last until removed.
4. **Alert when logging stops.** OWASP asks you to detect whether logging has stopped. Alert when a tenant's audit volume drops to zero, when a chain fails to verify, and when anyone changes retention settings.

## Log Access, Not Just Changes

Who *looked* matters as much as who changed: a departing salesperson exporting the customer list, a support agent browsing a celebrity's account, a contractor reading payroll. At minimum, log every export and bulk download, every view of sensitive fields, every impersonation, every permission change and every authentication event ([Authentication](/docs/security/authentication#audit-every-auth-event)). OWASP's list of events worth logging includes data import and export, access to sensitive data and user administration.

At the database, PostgreSQL's [pgAudit](https://github.com/pgaudit/pgaudit) logs statements by class (`READ`, `WRITE`, `ROLE`, `DDL` and others) or per table, which catches the read nobody routed through the application. Access logs are large; keep them on a shorter schedule than business records unless a rule says otherwise.

## Privacy Erasure and the Audit Store

A deletion request and a multi-year retention rule meet in the audit store. Keep identity out of audit records (an ID, never a name or email), so erasing the person's profile leaves facts without identity, and crypto-shred personal fields that can't be separated. [Data Retention & Deletion](/docs/architecture/data-retention#erasure-vs-append-only-records) has the patterns and the GDPR exceptions that allow it. Record the erasure itself as an audit entry: what was removed, what was kept, and under which exception.

## Producing Records

When a regulator, an auditor or opposing counsel asks, three things have to already work.

- **Legal holds.** A hold stops every purge for the matching people, accounts, date ranges and record types, and placing and releasing it are audited. The cost of getting this wrong is in [Data Retention](/docs/architecture/data-retention#retention-schedules-by-record-type).
- **Scoped exports.** Requests come by person, account, agent, date range or record type. Build those cuts ahead of time, in readable formats, with times rendered in the relevant local zone and the zone stated: a reader shown UTC will conclude the 7 p.m. call happened at 2 a.m.
- **A manifest.** Every export carries who requested it, the query, the record count and a hash of each file, so you can later show exactly what you produced and that it hasn't changed. The export is an audit entry too.

## What Goes Wrong

- **Partial coverage:** status changes are tracked, but the amount, the role or the clock-out time isn't.
- **"System" as the actor** for everything automated, with no way to tell a trigger rule from a data fix or an AI agent.
- **Impersonation recorded as the customer,** so a support agent's change looks like the customer's own.
- **Retention left in a vendor setting** nobody reviews, so the history is gone before the dispute arrives.
- **Purge jobs that ignore holds.**

## Auditing the Audit Trail

The audit system needs its own record: changes to retention schedules and who approved them, holds placed and released, exports and who ran them, chain verification results, every privileged read of the raw store, and every purge with its counts. Review them on a schedule, as a [SOC 2](/docs/compliance/soc-2#what-auditors-test) auditor will.

## Checklist

- **Every write that matters produces an audit entry in the same transaction,** with row-level capture underneath for what the application forgets.
- **Audit entries are separate from the outbox and from application logs.**
- **Typed actors,** with both identities for impersonation and person-started automation.
- **Before and after values as a structured diff,** with reason, request ID and rule version.
- **Corrections are new entries,** final records are sealed, and amendments need a reason.
- **Snapshots** of prices, terms and credentials at the moment of the fact.
- **Automated and AI decisions** record version, inputs, refusals and approvals.
- **Append-only permissions, hash chains, WORM archives** and an alert when logging stops.
- **Access logging** for exports, sensitive reads, impersonation and permission changes.
- **Retention by record type with legal holds,** and scoped exports with manifests.

For one industry's application of all this, with the regulators and record types involved, see [Audit Trails & Records](/books/field-operations/audit-trails-and-records) in the field operations volume.

## References

**Specifications**

- [RFC 6962: Certificate Transparency](https://www.rfc-editor.org/rfc/rfc6962), append-only Merkle tree logs with inclusion and consistency proofs

**Reference**

- [OWASP: Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), event attributes, what to log and exclude, tamper detection and detecting stopped logging
- [NIST SP 800-92: Guide to Computer Security Log Management](https://csrc.nist.gov/pubs/sp/800/92/final), enterprise log management practice
- [PostgreSQL: Trigger Functions](https://www.postgresql.org/docs/current/plpgsql-trigger.html), a PL/pgSQL trigger function for auditing
- [pgAudit](https://github.com/pgaudit/pgaudit), session and object audit logging for PostgreSQL
- [Debezium: Features](https://debezium.io/documentation/reference/stable/features.html), log-based change data capture, deletes, prior state and transaction metadata
- [AWS: Locking objects with S3 Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html), WORM retention modes and legal holds

**In practice**

- [Martin Fowler: Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html), event logs as audit trails and temporal queries
