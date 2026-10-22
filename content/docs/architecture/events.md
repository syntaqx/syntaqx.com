+++
title = "Events & Async Messaging"
description = "Publishing and consuming events reliably: the transactional outbox, idempotent consumers, partition keys for ordering, CloudEvents, and schema evolution."
category = "Architecture"
order = 8.1
tags = ["architecture", "events", "messaging", "cloudevents"]
aliases = ["events"]
+++

Events decouple services in time: the producer says what happened and moves on, and consumers react when they can. That only works if publishing is reliable and consuming is safe to repeat.

## Commands vs Events

| | Command | Event |
| --- | ------- | ----- |
| Says | "Do this" | "This happened" |
| Name | Imperative: `capture_payment` | Past tense: `payment.captured` |
| Receivers | Exactly one handler | Zero or more subscribers |
| Can be rejected | Yes | No, it already happened |

Don't disguise commands as events. If the producer needs a specific thing to happen, that's a command, and it should fail loudly when it can't.

## The Transactional Outbox

The classic bug: write to the database, then publish to the broker. If the process dies between the two, the database says the payment was captured and nobody else ever hears about it. Publish first and you get the opposite.

The fix is the [transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html):

1. In the **same transaction** as the state change, insert the event into an `outbox_events` table.
2. A relay reads unpublished rows in order and publishes them to the broker.
3. After the broker acknowledges, the relay marks the row published.

```sql
BEGIN;
UPDATE payments SET status = 'captured' WHERE id = $1 AND status = 'authorized';
INSERT INTO outbox_events (id, type, subject, payload, created_at)
VALUES ($2, 'payment.captured', $1, $3, NOW());
COMMIT;
```

The relay can crash after publishing and before marking, so it will sometimes publish twice. That's fine, because consumers are idempotent. A change-data-capture stream (like Debezium reading the write-ahead log) is an equivalent relay.

## Consumers Are Idempotent

Every broker worth using delivers **at least once**. Exactly-once delivery doesn't exist across a network.

- **Dedupe by event ID.** Record processed IDs in the same transaction as the side effect, with a unique constraint.
- **Or make the handler naturally idempotent.** "Set status to captured" is safe to repeat. "Add 100 to the balance" is not.
- **Acknowledge after the work commits,** never before.

See [Idempotency](/docs/payments/idempotency) for the same rule at the API boundary, and [Webhooks](/docs/payments/webhooks) for it across organizations.

## Ordering

Global ordering is expensive and almost never needed. Order **per entity** instead.

- **Partition by the entity ID.** All events for payment `01932c6c-...` go to the same partition (Kafka) or message group (SQS FIFO), so they're consumed in order.
- **Don't assume order across entities.** Events for different payments can interleave any way.
- **Carry a version.** Each event includes the entity's version number, and a consumer ignores anything older than what it already applied.

## Envelope: CloudEvents, Binary Mode

Event metadata follows [CloudEvents 1.0](https://cloudevents.io/), using **binary content mode**: attributes travel as headers, and the body is the event payload itself. No `data` wrapper, the same rule as [API Design Principles](/docs/api-design/principles) and [Webhooks](/docs/payments/webhooks).

```http
POST /events HTTP/1.1
ce-specversion: 1.0
ce-id: 0194a7f3-2b11-7e80-9c3d-4e8f1a2b5c70
ce-source: /payments
ce-type: payment.captured
ce-subject: 01932c6c-7616-7590-a8db-cb4b0e4d1c8a
ce-time: 2026-10-22T14:23:45Z
Content-Type: application/json

{
  "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "status": "captured",
  "amount": 1999,
  "currency": "USD",
  "version": 4
}
```

Kafka and AMQP bindings map the same attributes to message headers. Event IDs are [UUID v7](/docs/fundamentals/identifier-conventions), times are [RFC 3339](/docs/fundamentals/time).

## Schema Evolution

Events outlive the code that produced them. They're replayed, archived, and read by consumers you've never met.

- **Every event type has a schema** (JSON Schema, Avro or Protobuf) in a registry or the repository, checked in CI.
- **Additive changes only.** New optional fields are fine. Removing, renaming or retyping a field is a new event type (`payment.captured.v2`) published alongside the old one until consumers move.
- **Consumers ignore unknown fields.** That's what makes additive changes safe.

The same breaking-change rules as [Versioning & Deprecation](/docs/operations/versioning), applied to messages.

## When Processing Fails

- **Retry with backoff** for transient failures. See [Retries & Timeouts](/docs/operations/retries-and-timeouts).
- **Dead-letter after a limit.** A message that keeps failing moves to a [dead-letter queue](https://www.enterpriseintegrationpatterns.com/patterns/messaging/DeadLetterChannel.html) with the error attached, so it can't block its partition forever.
- **Alert on dead letters, then replay deliberately** once the bug is fixed. A dead-letter queue nobody watches is just a slower way to lose data.
- **Watch consumer lag.** How far behind a consumer is matters more than how fast it is. It belongs on the dashboard next to the [SLOs](/docs/operations/slos).

## References

**Specifications**

- [CloudEvents 1.0](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md), event attributes
- [CloudEvents HTTP Protocol Binding](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/bindings/http-protocol-binding.md), binary content mode with attributes as headers

**In practice**

- [microservices.io: Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox.html), publishing events atomically with the state change
- [Enterprise Integration Patterns: Idempotent Receiver](https://www.enterpriseintegrationpatterns.com/patterns/messaging/IdempotentReceiver.html), consumers that tolerate duplicates
- [Enterprise Integration Patterns: Dead Letter Channel](https://www.enterpriseintegrationpatterns.com/patterns/messaging/DeadLetterChannel.html), where messages go when processing keeps failing
- [Martin Fowler: What do you mean by "Event-Driven"?](https://martinfowler.com/articles/201701-event-driven.html), commands vs events and event-carried state
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/), partition keys and per-partition ordering
